/// Hand-rolled DTOs — small enough that codegen would just be overhead.
/// If we ever go beyond ~20 endpoints, switch to freezed + json_serializable.

class AuthUser {
  AuthUser({
    required this.id,
    required this.mobile,
    required this.kycStatus,
    required this.walletBalance,
    required this.role,
    this.name,
    this.email,
    this.referralCode,
  });

  final String id;
  final String mobile;
  final String? name;
  final String? email;
  final String kycStatus;
  final num walletBalance;
  final String? referralCode;
  final String role;

  factory AuthUser.fromJson(Map<String, dynamic> j) => AuthUser(
        id: j['id'] as String,
        mobile: j['mobile'] as String,
        name: j['name'] as String?,
        email: j['email'] as String?,
        kycStatus: (j['kycStatus'] as String?) ?? 'none',
        walletBalance: (j['walletBalance'] as num?) ?? 0,
        referralCode: j['referralCode'] as String?,
        role: (j['role'] as String?) ?? 'user',
      );

  String get displayName => (name?.isNotEmpty ?? false) ? name! : 'there';
}

class SendOtpResult {
  SendOtpResult({
    required this.sentTo,
    required this.expiresInSeconds,
    required this.retryAfterSeconds,
  });
  final String sentTo;
  final int expiresInSeconds;
  final int retryAfterSeconds;

  factory SendOtpResult.fromJson(Map<String, dynamic> j) => SendOtpResult(
        sentTo: j['sentTo'] as String,
        expiresInSeconds: (j['expiresInSeconds'] as num).toInt(),
        retryAfterSeconds: (j['retryAfterSeconds'] as num).toInt(),
      );
}

class VerifyOtpResult {
  VerifyOtpResult({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
    required this.isNewUser,
  });
  final AuthUser user;
  final String accessToken;
  final String refreshToken;
  final bool isNewUser;

  factory VerifyOtpResult.fromJson(Map<String, dynamic> j) => VerifyOtpResult(
        user: AuthUser.fromJson(j['user'] as Map<String, dynamic>),
        accessToken: j['accessToken'] as String,
        refreshToken: j['refreshToken'] as String,
        isNewUser: (j['isNewUser'] as bool?) ?? false,
      );
}
