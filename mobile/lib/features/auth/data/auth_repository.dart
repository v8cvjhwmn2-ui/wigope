import 'package:dio/dio.dart';

import '../../../core/api/dio_client.dart';
import '../../../core/storage/token_storage.dart';
import 'auth_models.dart';

class AuthRepository {
  AuthRepository(this._client, this._tokens);

  final DioClient _client;
  final TokenStorage _tokens;

  Future<SendOtpResult> sendOtp(String mobile) async {
    final res = await _client.raw.post(
      '/auth/send-otp',
      data: {'mobile': mobile},
      options: Options(extra: {'skipAuth': true}),
    );
    return SendOtpResult.fromJson(res.data['data'] as Map<String, dynamic>);
  }

  Future<VerifyOtpResult> verifyOtp({
    required String mobile,
    required String otp,
    Map<String, dynamic>? deviceInfo,
  }) async {
    final res = await _client.raw.post(
      '/auth/verify-otp',
      data: {
        'mobile': mobile,
        'otp': otp,
        if (deviceInfo != null) 'deviceInfo': deviceInfo,
      },
      options: Options(extra: {'skipAuth': true}),
    );
    final result =
        VerifyOtpResult.fromJson(res.data['data'] as Map<String, dynamic>);
    await _tokens.save(
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      // Server doesn't return refresh expiry; mirror the configured 30d.
      refreshExpiresAt: DateTime.now().toUtc().add(const Duration(days: 30)),
    );
    return result;
  }

  Future<AuthUser?> me() async {
    try {
      final res = await _client.raw.get('/auth/me');
      return AuthUser.fromJson(
        (res.data['data']['user']) as Map<String, dynamic>,
      );
    } on DioException {
      return null;
    }
  }

  Future<void> logout() async {
    final refresh = await _tokens.getRefreshToken();
    try {
      if (refresh != null) {
        await _client.raw.post('/auth/logout', data: {'refreshToken': refresh});
      }
    } catch (_) {
      // best-effort
    } finally {
      await _tokens.clear();
    }
  }
}
