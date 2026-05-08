import 'app_exception.dart';
import 'package:dio/dio.dart';

/// Backend error code → user-facing copy. Keep in sync with
/// `backend/src/utils/errors.ts`.
///
/// We default to the server-supplied [AppException.message] when present —
/// these overrides are for codes where the backend message is too technical
/// or where we want to inject dynamic numbers (attempts, seconds).
class ErrorMapper {
  static String toUserMessage(Object error) {
    if (error is DioException && error.error is AppException) {
      error = error.error! as AppException;
    }
    if (error is! AppException) {
      return "Something went wrong. Please try again.";
    }
    switch (error.code) {
      case 'OTP_RATE_LIMITED':
        return 'Too many OTP requests. Please try again after an hour.';
      case 'OTP_COOLDOWN':
        return 'Please wait ${error.retryAfter ?? 30}s before requesting another OTP.';
      case 'OTP_EXPIRED':
        return 'OTP has expired. Please request a new one.';
      case 'OTP_WRONG':
        final n = error.attemptsLeft;
        return n == null
            ? 'Incorrect OTP. Please try again.'
            : 'Incorrect OTP. $n attempt${n == 1 ? '' : 's'} left.';
      case 'OTP_LOCKED':
        return 'Too many wrong attempts. Please request a new OTP.';
      case 'SMS_PROVIDER_FAILED':
        return "OTP SMS provider is not reachable right now. Please try again in a moment.";
      case 'TOKEN_EXPIRED':
      case 'INVALID_TOKEN':
      case 'REFRESH_REUSE':
        return 'Your session expired. Please sign in again.';
      case 'USER_BLOCKED':
        return error.message; // backend supplies the reason verbatim
      case 'VALIDATION_ERROR':
        return 'Please check the entered details and try again.';
      case 'NETWORK':
        return "We couldn't reach Wigope servers. Check your connection.";
      default:
        return error.message;
    }
  }
}
