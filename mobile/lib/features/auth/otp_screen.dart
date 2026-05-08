import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:pinput/pinput.dart';

import '../../app/router/router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../core/error/error_mapper.dart';
import '../../shared/branding/wigope_logo.dart';
import 'application/auth_controller.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key, required this.mobile});
  final String mobile;

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _ctrl = TextEditingController();
  bool _valid = false;
  bool _showError = false;
  String? _errorMessage;
  bool _verifying = false;
  bool _resending = false;
  int _seconds = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _seconds = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      if (_seconds <= 0) {
        t.cancel();
        return;
      }
      setState(() => _seconds--);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    if (!_valid || _verifying) return;
    setState(() {
      _verifying = true;
      _showError = false;
    });
    HapticFeedback.mediumImpact();

    try {
      await ref.read(authControllerProvider.notifier).verifyOtp(
            mobile: widget.mobile,
            otp: _ctrl.text,
          );
      if (!mounted) return;
      context.go(AppRoutes.home);
    } catch (e) {
      if (!mounted) return;
      HapticFeedback.heavyImpact();
      setState(() {
        _verifying = false;
        _showError = true;
        _errorMessage = ErrorMapper.toUserMessage(e);
      });
    }
  }

  Future<void> _resend() async {
    if (_seconds > 0 || _resending) return;
    setState(() => _resending = true);
    try {
      await ref.read(authControllerProvider.notifier).sendOtp(widget.mobile);
      if (!mounted) return;
      _startTimer();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          backgroundColor: WigopeColors.navy900,
          content: Text('A new code has been sent.',
              style: WigopeText.body.copyWith(color: Colors.white)),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: WigopeColors.error,
          behavior: SnackBarBehavior.floating,
          content: Text(ErrorMapper.toUserMessage(e),
              style: WigopeText.body.copyWith(color: Colors.white)),
        ),
      );
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  PinTheme get _baseTheme => PinTheme(
        width: 48,
        height: 56,
        textStyle: WigopeText.h1.copyWith(
          color: WigopeColors.navy900,
          fontWeight: FontWeight.w700,
        ),
        decoration: BoxDecoration(
          color: WigopeColors.surfaceBase,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: WigopeColors.borderDefault, width: 1.2),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final masked = _maskMobile(widget.mobile);

    return Scaffold(
      backgroundColor: WigopeColors.surfaceBase,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 20, 8),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(PhosphorIconsRegular.caretLeft,
                        color: WigopeColors.navy900),
                    onPressed: () => context.pop(),
                  ),
                  const Spacer(),
                  const WigopeLogo.full(height: 24),
                  const Spacer(),
                  const SizedBox(width: 40),
                ],
              ),
            ),
            const Divider(height: 1, color: WigopeColors.borderSoft),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
                physics: const ClampingScrollPhysics(),
                children: [
                  Text('VERIFICATION',
                      style: WigopeText.caption.copyWith(
                        color: WigopeColors.orange600,
                        letterSpacing: 0.18 * 11,
                      )),
                  const SizedBox(height: 10),
                  Text(
                    'Verify your\nphone number',
                    style: WigopeText.displayL.copyWith(
                      fontWeight: FontWeight.w800,
                      letterSpacing: -1,
                      height: 1.08,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text('Enter the 6-digit code sent to ',
                          style: WigopeText.body
                              .copyWith(color: WigopeColors.textSecondary)),
                      Text(masked,
                          style: WigopeText.body.copyWith(
                              color: WigopeColors.navy900,
                              fontWeight: FontWeight.w700)),
                      TextButton(
                        onPressed: () => context.pop(),
                        style: TextButton.styleFrom(
                          minimumSize: Size.zero,
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text('Edit',
                            style: WigopeText.body.copyWith(
                                color: WigopeColors.orange600,
                                fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  Pinput(
                    controller: _ctrl,
                    length: 6,
                    autofocus: true,
                    defaultPinTheme: _baseTheme,
                    focusedPinTheme: _baseTheme.copyWith(
                      decoration: _baseTheme.decoration!.copyWith(
                        border:
                            Border.all(color: WigopeColors.orange600, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: WigopeColors.orange600.withOpacity(0.14),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                    ),
                    submittedPinTheme: _baseTheme.copyWith(
                      decoration: _baseTheme.decoration!.copyWith(
                        border:
                            Border.all(color: WigopeColors.success, width: 1.5),
                      ),
                    ),
                    errorPinTheme: _baseTheme.copyWith(
                      decoration: _baseTheme.decoration!.copyWith(
                        border:
                            Border.all(color: WigopeColors.error, width: 1.5),
                      ),
                    ),
                    forceErrorState: _showError,
                    separatorBuilder: (_) => const SizedBox(width: 8),
                    onChanged: (v) => setState(() {
                      _valid = v.length == 6;
                      _showError = false;
                    }),
                    onCompleted: (_) => _verify(),
                  ),
                  if (_showError) ...[
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(PhosphorIconsBold.warningCircle,
                            size: 16, color: WigopeColors.error),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            _errorMessage ??
                                'Incorrect code. Please try again.',
                            style: WigopeText.bodyS.copyWith(
                              color: WigopeColors.error,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 24),
                  Center(
                    child: _ResendBlock(
                      seconds: _seconds,
                      loading: _resending,
                      onResend: _resend,
                    ),
                  ),
                  const SizedBox(height: 32),
                  _VerifyButton(
                    enabled: _valid && !_verifying,
                    loading: _verifying,
                    onPressed: _verify,
                  ),
                  const SizedBox(height: 20),
                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(PhosphorIconsRegular.shieldCheck,
                            size: 14, color: WigopeColors.textTertiary),
                        const SizedBox(width: 6),
                        Text(
                          'Auto-detecting code from your messages',
                          style: WigopeText.caption.copyWith(
                            color: WigopeColors.textTertiary,
                            letterSpacing: 0.04 * 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _maskMobile(String m) {
    final digits = m.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 4) return '+91 $digits';
    final last4 = digits.substring(digits.length - 4);
    return '+91 •• ••• $last4';
  }
}

class _ResendBlock extends StatelessWidget {
  const _ResendBlock({
    required this.seconds,
    required this.loading,
    required this.onResend,
  });
  final int seconds;
  final bool loading;
  final VoidCallback onResend;

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(
              strokeWidth: 2, color: WigopeColors.orange600));
    }
    if (seconds > 0) {
      return Text(
        "Didn't get it? Resend in 0:${seconds.toString().padLeft(2, '0')}",
        style: WigopeText.bodyS.copyWith(color: WigopeColors.textSecondary),
      );
    }
    return TextButton.icon(
      onPressed: onResend,
      icon: const Icon(PhosphorIconsBold.arrowsClockwise,
          size: 16, color: WigopeColors.orange600),
      label: Text(
        'Resend code',
        style: WigopeText.bodyStrong.copyWith(
          color: WigopeColors.orange600,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _VerifyButton extends StatelessWidget {
  const _VerifyButton({
    required this.enabled,
    required this.loading,
    required this.onPressed,
  });
  final bool enabled;
  final bool loading;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      height: 56,
      decoration: BoxDecoration(
        gradient: enabled ? WigopeColors.gradOrange : null,
        color: enabled ? null : WigopeColors.surfaceMuted,
        borderRadius: BorderRadius.circular(16),
        boxShadow: enabled
            ? [
                BoxShadow(
                  color: WigopeColors.orange600.withOpacity(0.32),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: enabled ? onPressed : null,
          child: Center(
            child: loading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2.4, color: Colors.white),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Verify & Continue',
                        style: WigopeText.bodyStrong.copyWith(
                          color: enabled
                              ? Colors.white
                              : WigopeColors.textTertiary,
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        PhosphorIconsBold.arrowRight,
                        size: 18,
                        color:
                            enabled ? Colors.white : WigopeColors.textTertiary,
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
