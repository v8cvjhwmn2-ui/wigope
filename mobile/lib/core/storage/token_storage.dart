import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Wraps [FlutterSecureStorage]. On Android the backing store is
/// EncryptedSharedPreferences (AES-256, KeyStore-bound). On iOS it's Keychain.
///
/// Tokens are stored opaque — we never parse the JWT on device. The only thing
/// we cache is the refresh-token expiry hint so the splash screen can decide
/// whether to attempt a silent refresh.
class TokenStorage {
  TokenStorage([FlutterSecureStorage? storage])
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
                resetOnError: true,
              ),
              iOptions:
                  IOSOptions(accessibility: KeychainAccessibility.first_unlock),
            );

  final FlutterSecureStorage _storage;

  static const _kAccess = 'wg_access_token';
  static const _kRefresh = 'wg_refresh_token';
  static const _kExpiry = 'wg_refresh_expires_at';
  static const _kAccessExpiry = 'wg_access_expires_at';

  Future<void> save({
    required String accessToken,
    required String refreshToken,
    DateTime? accessExpiresAt,
    DateTime? refreshExpiresAt,
  }) async {
    await Future.wait([
      _storage.write(key: _kAccess, value: accessToken),
      _storage.write(key: _kRefresh, value: refreshToken),
      if (accessExpiresAt != null)
        _storage.write(
          key: _kAccessExpiry,
          value: accessExpiresAt.toUtc().toIso8601String(),
        ),
      if (refreshExpiresAt != null)
        _storage.write(
          key: _kExpiry,
          value: refreshExpiresAt.toUtc().toIso8601String(),
        ),
    ]);
  }

  Future<void> saveTokens({
    required String access,
    required String refresh,
    DateTime? accessExpiresAt,
  }) {
    return save(
      accessToken: access,
      refreshToken: refresh,
      accessExpiresAt: accessExpiresAt,
      refreshExpiresAt: DateTime.now().toUtc().add(const Duration(days: 30)),
    );
  }

  Future<String?> getAccessToken() => _storage.read(key: _kAccess);
  Future<String?> getRefreshToken() => _storage.read(key: _kRefresh);

  Future<DateTime?> getAccessExpiry() async {
    final s = await _storage.read(key: _kAccessExpiry);
    return s == null ? null : DateTime.tryParse(s);
  }

  Future<DateTime?> getRefreshExpiry() async {
    final s = await _storage.read(key: _kExpiry);
    return s == null ? null : DateTime.tryParse(s);
  }

  Future<void> clear() async {
    await Future.wait([
      _storage.delete(key: _kAccess),
      _storage.delete(key: _kRefresh),
      _storage.delete(key: _kAccessExpiry),
      _storage.delete(key: _kExpiry),
    ]);
  }
}
