/// Domain-level error type. Every layer below presentation throws this — never
/// raw DioException or platform errors. Mapped to user copy via [ErrorMapper].
class AppException implements Exception {
  AppException({
    required this.code,
    required this.message,
    this.details,
    this.statusCode,
  });

  final String code;
  final String message;
  final Map<String, dynamic>? details;
  final int? statusCode;

  /// Number of attempts left before OTP locks. Only meaningful for `OTP_WRONG`.
  int? get attemptsLeft => details?['attemptsLeft'] as int?;

  /// Seconds the client should back off. Only set on rate/cooldown errors.
  int? get retryAfter => details?['retryAfter'] as int?;

  @override
  String toString() => 'AppException($code, $statusCode): $message';
}
