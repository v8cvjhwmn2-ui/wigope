import 'dart:async';

import 'package:dio/dio.dart';

import '../error/app_exception.dart';
import '../storage/token_storage.dart';

/// Single Dio instance — never new-up Dio anywhere else.
///
/// Pipeline:
///   1. Attach `Authorization: Bearer <access>` if we have one.
///   2. On 401 / TOKEN_EXPIRED → silently call `/auth/refresh` (deduped via
///      a Completer so 5 concurrent 401s only fire ONE refresh) → retry the
///      original request once.
///   3. On refresh failure → clear tokens and bubble a `REFRESH_REUSE` error;
///      the AuthController listens and routes back to `/login`.
///   4. Convert every error to [AppException] so screens never see DioError.
class DioClient {
  DioClient._(this._dio, this._tokens);

  final Dio _dio;
  final TokenStorage _tokens;

  /// Hook the auth controller installs at boot — invoked after a refresh
  /// failure so it can transition to signed-out and clear router state.
  Future<void> Function()? onAuthFailure;

  Completer<void>? _refreshing;

  factory DioClient.create({
    required String baseUrl,
    required TokenStorage tokens,
  }) {
    final dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Accept': 'application/json'},
    ));
    final client = DioClient._(dio, tokens);
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: client._onRequest,
      onError: client._onError,
    ));
    return client;
  }

  Dio get raw => _dio;

  Future<void> _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (options.extra['skipAuth'] != true) {
      final access = await _tokens.getAccessToken();
      if (access != null) {
        options.headers['Authorization'] = 'Bearer $access';
      }
    }
    handler.next(options);
  }

  Future<void> _onError(DioException err, ErrorInterceptorHandler handler) async {
    final status = err.response?.statusCode;
    final data = err.response?.data;
    final code = _extractCode(data);

    final isExpired =
        status == 401 && (code == 'TOKEN_EXPIRED' || code == 'INVALID_TOKEN');
    final alreadyRetried = err.requestOptions.extra['_retried'] == true;
    final isRefreshCall = err.requestOptions.path.endsWith('/auth/refresh');

    if (isExpired && !alreadyRetried && !isRefreshCall) {
      try {
        await _refresh();
        err.requestOptions.extra['_retried'] = true;
        // Re-attach (refreshed) access token before retry.
        final access = await _tokens.getAccessToken();
        if (access != null) {
          err.requestOptions.headers['Authorization'] = 'Bearer $access';
        }
        final response = await _dio.fetch(err.requestOptions);
        return handler.resolve(response);
      } catch (_) {
        await _tokens.clear();
        await onAuthFailure?.call();
        // Fall through to surface a session-expired error.
      }
    }

    handler.reject(DioException(
      requestOptions: err.requestOptions,
      response: err.response,
      type: err.type,
      error: _toAppException(err),
    ));
  }

  Future<void> _refresh() async {
    if (_refreshing != null) return _refreshing!.future;
    final c = Completer<void>();
    _refreshing = c;
    try {
      final refresh = await _tokens.getRefreshToken();
      if (refresh == null || refresh.isEmpty) {
        throw AppException(code: 'INVALID_TOKEN', message: 'No refresh token', statusCode: 401);
      }
      final res = await _dio.post(
        '/auth/refresh',
        data: {'refreshToken': refresh},
        options: Options(extra: {'skipAuth': true}),
      );
      final data = (res.data['data'] ?? {}) as Map<String, dynamic>;
      await _tokens.save(
        accessToken: data['accessToken'] as String,
        refreshToken: data['refreshToken'] as String,
      );
      c.complete();
    } catch (e, st) {
      c.completeError(e, st);
      rethrow;
    } finally {
      _refreshing = null;
    }
  }
}

String? _extractCode(Object? body) {
  if (body is Map && body['error'] is Map) {
    return body['error']['code'] as String?;
  }
  return null;
}

AppException _toAppException(DioException err) {
  // Network or socket — no HTTP response.
  if (err.type == DioExceptionType.connectionError ||
      err.type == DioExceptionType.connectionTimeout ||
      err.type == DioExceptionType.receiveTimeout ||
      err.type == DioExceptionType.sendTimeout ||
      err.error is FormatException) {
    return AppException(
      code: 'NETWORK',
      message: "We couldn't reach Wigope servers. Check your connection.",
      statusCode: err.response?.statusCode,
    );
  }

  final body = err.response?.data;
  if (body is Map && body['error'] is Map) {
    final e = body['error'] as Map;
    return AppException(
      code: (e['code'] as String?) ?? 'INTERNAL_ERROR',
      message: (e['message'] as String?) ?? 'Something went wrong',
      details: (e['details'] as Map?)?.cast<String, dynamic>(),
      statusCode: err.response?.statusCode,
    );
  }
  return AppException(
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong. Please try again.',
    statusCode: err.response?.statusCode,
  );
}
