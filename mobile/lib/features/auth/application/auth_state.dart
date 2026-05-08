import '../data/auth_models.dart';

/// Sealed-style auth state — no codegen needed at this scale.
abstract class AuthState {
  const AuthState();
}

class AuthInitializing extends AuthState {
  const AuthInitializing();
}

class AuthSignedOut extends AuthState {
  const AuthSignedOut({this.reason});
  final String? reason;
}

class AuthSendingOtp extends AuthState {
  const AuthSendingOtp(this.mobile);
  final String mobile;
}

class AuthAwaitingOtp extends AuthState {
  const AuthAwaitingOtp({
    required this.mobile,
    required this.maskedMobile,
    required this.expiresInSeconds,
    required this.cooldownSeconds,
  });
  final String mobile;
  final String maskedMobile;
  final int expiresInSeconds;
  final int cooldownSeconds;
}

class AuthVerifying extends AuthState {
  const AuthVerifying(this.mobile);
  final String mobile;
}

class AuthSignedIn extends AuthState {
  const AuthSignedIn(this.user);
  final AuthUser user;
}
