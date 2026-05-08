import 'dart:async';
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/dio_client.dart';
import '../../../core/error/app_exception.dart';
import '../../../core/storage/token_storage.dart';
import '../data/auth_models.dart';
import '../data/auth_repository.dart';
import 'auth_state.dart';

// ─── infrastructure providers ──────────────────────────────────────────────

const _defaultBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://recharge-api.wigope.com/api/v1',
);

final tokenStorageProvider = Provider<TokenStorage>((_) => TokenStorage());

final dioClientProvider = Provider<DioClient>((ref) {
  return DioClient.create(
    baseUrl: _defaultBaseUrl,
    tokens: ref.watch(tokenStorageProvider),
  );
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    ref.watch(dioClientProvider),
    ref.watch(tokenStorageProvider),
  );
});

// ─── controller ────────────────────────────────────────────────────────────

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  final tokens = ref.watch(tokenStorageProvider);
  final dio = ref.watch(dioClientProvider);
  return AuthController(repo, tokens, dio)..bootstrap();
});

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._repo, this._tokens, this._dio)
      : super(const AuthInitializing()) {
    _dio.onAuthFailure = () async {
      // Refresh interceptor failed — fall back to signed-out so the router
      // redirects to /login and any in-flight UI clears.
      state = const AuthSignedOut(reason: 'Session expired');
    };
  }

  final AuthRepository _repo;
  final TokenStorage _tokens;
  final DioClient _dio;

  /// Called once at app start. If we have a refresh token, attempt to fetch
  /// /auth/me — Dio's interceptor will silently refresh the access token if
  /// expired. On any failure, fall back to signed-out without surfacing it.
  Future<void> bootstrap() async {
    try {
      final refresh = await _bootstrapTimeout(
        _tokens.getRefreshToken(),
        const Duration(seconds: 2),
      );
      if (refresh == null || refresh.isEmpty) {
        state = const AuthSignedOut();
        return;
      }
      final user = await _bootstrapTimeout(
        _repo.me(),
        const Duration(seconds: 5),
      );
      if (user == null) {
        await _clearTokensBestEffort();
        state = const AuthSignedOut();
      } else {
        state = AuthSignedIn(user);
      }
    } catch (_) {
      await _clearTokensBestEffort();
      state = const AuthSignedOut();
    }
  }

  Future<T?> _bootstrapTimeout<T>(Future<T?> future, Duration timeout) {
    if (kDebugMode) return future;
    return future.timeout(timeout, onTimeout: () => null);
  }

  Future<void> _clearTokensBestEffort() async {
    try {
      if (kDebugMode) {
        await _tokens.clear();
      } else {
        await _tokens.clear().timeout(
              const Duration(seconds: 2),
              onTimeout: () {},
            );
      }
    } catch (_) {
      // Storage can be unavailable on some browser previews. Fail open so
      // the user reaches login instead of getting trapped on splash.
    }
  }

  Future<SendOtpResult> sendOtp(String mobile) async {
    state = AuthSendingOtp(mobile);
    try {
      final r = await _repo.sendOtp(mobile);
      state = AuthAwaitingOtp(
        mobile: mobile,
        maskedMobile: r.sentTo,
        expiresInSeconds: r.expiresInSeconds,
        cooldownSeconds: r.retryAfterSeconds,
      );
      return r;
    } catch (e) {
      state = const AuthSignedOut();
      rethrow;
    }
  }

  Future<VerifyOtpResult> verifyOtp({
    required String mobile,
    required String otp,
  }) async {
    state = AuthVerifying(mobile);
    try {
      final r = await _repo.verifyOtp(
        mobile: mobile,
        otp: otp,
        deviceInfo: _deviceInfo(),
      );
      state = AuthSignedIn(r.user);
      return r;
    } catch (e) {
      // remain in awaiting-otp so the user can retry without re-sending.
      state = AuthAwaitingOtp(
        mobile: mobile,
        maskedMobile: _mask(mobile),
        expiresInSeconds: 0,
        cooldownSeconds: 0,
      );
      if (e is AppException) rethrow;
      throw AppException(code: 'INTERNAL_ERROR', message: e.toString());
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthSignedOut();
  }

  Map<String, dynamic> _deviceInfo() {
    if (kIsWeb) {
      return {'platform': 'web', 'appVersion': '0.1.0'};
    }
    return {
      'platform': Platform.operatingSystem,
      'osVersion': Platform.operatingSystemVersion,
      'appVersion': '0.1.0',
    };
  }

  String _mask(String mobile) {
    final digits = mobile.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 4) return '+91 $digits';
    final last4 = digits.substring(digits.length - 4);
    return '+91 ${digits.substring(0, 2)}****$last4';
  }
}
