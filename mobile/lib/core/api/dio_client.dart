import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../error/app_exception.dart';
import '../storage/token_storage.dart';

const _apiDebugLogs = bool.fromEnvironment('API_DEBUG_LOGS');

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
    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Accept': 'application/json'},
      ),
    );
    final client = DioClient._(dio, tokens);
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: client._onRequest,
        onResponse: client._onResponse,
        onError: client._onError,
      ),
    );
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
    _logRequest(options);
    handler.next(options);
  }

  void _onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    _logResponse(response);
    handler.next(response);
  }

  Future<void> _onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    _logDioError(err);
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

    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        type: err.type,
        error: _toAppException(err),
      ),
    );
  }

  Future<void> _refresh() async {
    if (_refreshing != null) return _refreshing!.future;
    final c = Completer<void>();
    _refreshing = c;
    try {
      final refresh = await _tokens.getRefreshToken();
      if (refresh == null || refresh.isEmpty) {
        throw AppException(
          code: 'INVALID_TOKEN',
          message: 'No refresh token',
          statusCode: 401,
        );
      }
      final res = await _dio.post(
        '/auth/refresh',
        data: {'refreshToken': refresh},
        options: Options(extra: {'skipAuth': true}),
      );
      final data = unwrapApiData(res.data);
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

  static void _logRequest(RequestOptions options) {
    if (!kDebugMode && !_apiDebugLogs) return;
    final headers = Map<String, dynamic>.from(options.headers);
    if (headers.containsKey('Authorization')) {
      headers['Authorization'] = 'Bearer ***';
    }
    debugPrint(
      '[API] --> ${options.method} ${options.baseUrl}${options.path} '
      'query=${options.queryParameters} headers=$headers body=${_safeBody(options.data)}',
    );
  }

  static void _logResponse(Response<dynamic> response) {
    if (!kDebugMode && !_apiDebugLogs) return;
    debugPrint(
      '[API] <-- ${response.statusCode} ${response.requestOptions.method} '
      '${response.requestOptions.path} body=${_safeBody(response.data)}',
    );
  }

  static void _logDioError(DioException err) {
    if (!kDebugMode && !_apiDebugLogs) return;
    debugPrint(
      '[API] !! ${err.type} ${err.response?.statusCode ?? '-'} '
      '${err.requestOptions.method} ${err.requestOptions.path} '
      'message=${err.message} body=${_safeBody(err.response?.data)} error=${err.error}',
    );
  }
}

String? _extractCode(Object? body) {
  if (body is Map && body['error'] is Map) {
    return body['error']['code'] as String?;
  }
  return null;
}

Map<String, dynamic> unwrapApiData(Object? body) {
  if (body is String) {
    try {
      return unwrapApiData(jsonDecode(body));
    } on FormatException catch (e) {
      throw AppException(
        code: 'JSON_PARSE_FAILED',
        message: 'Server returned invalid JSON: ${e.message}',
      );
    }
  }
  if (body is! Map) {
    throw AppException(
      code: 'INVALID_RESPONSE',
      message: 'Server returned an unexpected response.',
    );
  }
  final map = body.cast<String, dynamic>();
  final ok = map['ok'];
  final success = map['success'];
  if ((ok == false || success == false) && map['error'] is Map) {
    final e = (map['error'] as Map).cast<String, dynamic>();
    throw AppException(
      code: (e['code'] as String?) ?? 'API_ERROR',
      message: (e['message'] as String?) ?? 'Request failed.',
      details: (e['details'] as Map?)?.cast<String, dynamic>(),
    );
  }
  final data = map['data'];
  if (data is Map) return data.cast<String, dynamic>();
  if (data == null) return <String, dynamic>{};
  throw AppException(
    code: 'INVALID_RESPONSE',
    message: 'Server data shape is invalid.',
    details: {'dataType': data.runtimeType.toString()},
  );
}

AppException _toAppException(DioException err) {
  if (err.error is AppException) return err.error! as AppException;

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

String _safeBody(Object? body) {
  Object? redacted(Object? value) {
    if (value is Map) {
      return value.map((key, dynamic child) {
        final k = key.toString().toLowerCase();
        if (k.contains('token') ||
            k.contains('secret') ||
            k.contains('authorization') ||
            k.contains('api_key')) {
          return MapEntry(key, '***');
        }
        if (k.contains('mobile') ||
            k.contains('phone') ||
            k.contains('number')) {
          return MapEntry(key, _mask(child));
        }
        return MapEntry(key, redacted(child));
      });
    }
    if (value is List) return value.map(redacted).toList();
    return value;
  }

  try {
    return jsonEncode(redacted(body));
  } catch (_) {
    return body.toString();
  }
}

String _mask(Object? value) {
  final raw = value?.toString() ?? '';
  final digits = raw.replaceAll(RegExp(r'\D'), '');
  if (digits.length < 4) return '***';
  return '${digits.substring(0, 2)}****${digits.substring(digits.length - 2)}';
}
