import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/router/router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../core/error/error_mapper.dart';
import '../../shared/branding/wigope_logo.dart';
import '../../shared/decoration/grid_pattern.dart';
import 'application/auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _ctrl = TextEditingController();
  bool _valid = false;
  bool _focused = false;
  bool _submitting = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _onChanged(String v) {
    final ok = RegExp(r'^[6-9]\d{9}$').hasMatch(v);
    if (ok != _valid) setState(() => _valid = ok);
  }

  Future<void> _continue() async {
    if (!_valid || _submitting) return;
    HapticFeedback.mediumImpact();
    setState(() => _submitting = true);

    try {
      await ref.read(authControllerProvider.notifier).sendOtp(_ctrl.text);
      if (!mounted) return;
      context.push('${AppRoutes.otp}?m=${_ctrl.text}');
    } catch (e) {
      if (!mounted) return;
      _showError(ErrorMapper.toUserMessage(e));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          backgroundColor: WigopeColors.error,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          content:
              Text(msg, style: WigopeText.body.copyWith(color: Colors.white)),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceBase,
      body: Stack(
        children: [
          Positioned.fill(
            child: GridPatternBackground(
              color: WigopeColors.navy900,
              opacity: 0.018,
              spacing: 24,
              child: const SizedBox.expand(),
            ),
          ),
          Positioned(
            top: -86,
            right: -92,
            child: Container(
              width: 230,
              height: 230,
              decoration: BoxDecoration(
                color: WigopeColors.orange600.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: -120,
            left: -110,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                color: WigopeColors.orange600.withOpacity(0.06),
                shape: BoxShape.circle,
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                  child: Row(
                    children: [
                      const WigopeLogo.full(height: 28),
                      const Spacer(),
                      TextButton(
                        onPressed: () {},
                        style: TextButton.styleFrom(
                            foregroundColor: WigopeColors.navy900),
                        child: Text('Need help?',
                            style: WigopeText.bodyS.copyWith(
                                fontWeight: FontWeight.w600,
                                color: WigopeColors.navy800)),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1, color: WigopeColors.borderSoft),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
                    physics: const ClampingScrollPhysics(),
                    children: [
                      Text(
                        'WELCOME',
                        style: WigopeText.caption.copyWith(
                          color: WigopeColors.orange600,
                          letterSpacing: 0.18 * 11,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Enter your\nmobile number',
                        style: WigopeText.displayL.copyWith(
                          fontWeight: FontWeight.w800,
                          letterSpacing: -1,
                          height: 1.08,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        "We'll send a 6-digit verification code\nto confirm it's really you.",
                        style: WigopeText.body.copyWith(
                          color: WigopeColors.textSecondary,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 32),
                      _PhoneField(
                        controller: _ctrl,
                        valid: _valid,
                        onChanged: _onChanged,
                        onFocus: (f) => setState(() => _focused = f),
                        onSubmitted: _continue,
                        focused: _focused,
                      ),
                      const SizedBox(height: 28),
                      _ContinueButton(
                        enabled: _valid && !_submitting,
                        loading: _submitting,
                        onPressed: _continue,
                      ),
                      const SizedBox(height: 18),
                      const _TrustRow(),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
                  child: Text.rich(
                    TextSpan(
                        children: [
                          const TextSpan(
                              text: 'By continuing, you agree to our '),
                          TextSpan(
                            text: 'Terms of Service',
                            style: WigopeText.bodyS.copyWith(
                              color: WigopeColors.orange600,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const TextSpan(text: ' and '),
                          TextSpan(
                            text: 'Privacy Policy',
                            style: WigopeText.bodyS.copyWith(
                              color: WigopeColors.orange600,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const TextSpan(text: '.'),
                        ],
                        style: WigopeText.bodyS
                            .copyWith(color: WigopeColors.textTertiary)),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── private widgets (unchanged design — only loading state added) ─────────

class _PhoneField extends StatelessWidget {
  const _PhoneField({
    required this.controller,
    required this.valid,
    required this.onChanged,
    required this.onFocus,
    required this.onSubmitted,
    required this.focused,
  });

  final TextEditingController controller;
  final bool valid;
  final bool focused;
  final ValueChanged<String> onChanged;
  final ValueChanged<bool> onFocus;
  final VoidCallback onSubmitted;

  @override
  Widget build(BuildContext context) {
    final borderColor = focused
        ? WigopeColors.orange600
        : valid
            ? WigopeColors.success
            : WigopeColors.borderDefault;

    return Focus(
      onFocusChange: onFocus,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 64,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor, width: focused ? 2 : 1.2),
          boxShadow: focused
              ? [
                  BoxShadow(
                    color: WigopeColors.orange600.withOpacity(0.10),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ]
              : const [
                  BoxShadow(
                    color: Color(0x0A0A1628),
                    blurRadius: 8,
                    offset: Offset(0, 2),
                  ),
                ],
        ),
        child: Row(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18),
              child: Row(
                children: [
                  Text('🇮🇳', style: WigopeText.h2),
                  const SizedBox(width: 8),
                  Text('+91',
                      style: WigopeText.h3.copyWith(
                        color: WigopeColors.navy900,
                        fontWeight: FontWeight.w700,
                      )),
                ],
              ),
            ),
            Container(width: 1, height: 28, color: WigopeColors.borderSoft),
            Expanded(
              child: TextField(
                controller: controller,
                autofocus: true,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => onSubmitted(),
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(10),
                ],
                onChanged: onChanged,
                style: WigopeText.h2.copyWith(
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                  color: WigopeColors.navy900,
                ),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.transparent,
                  hintText: '98765 43210',
                  hintStyle: WigopeText.h2.copyWith(
                    fontWeight: FontWeight.w500,
                    color: WigopeColors.textTertiary,
                    letterSpacing: 1.2,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                ),
              ),
            ),
            if (valid)
              Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: const BoxDecoration(
                    color: WigopeColors.success,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(PhosphorIconsBold.check,
                      size: 16, color: Colors.white),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ContinueButton extends StatelessWidget {
  const _ContinueButton({
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
                      strokeWidth: 2.4,
                      color: Colors.white,
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Send OTP',
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

class _TrustRow extends StatelessWidget {
  const _TrustRow();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(PhosphorIconsRegular.lock,
            size: 14, color: WigopeColors.textTertiary),
        const SizedBox(width: 6),
        Text(
          'Secured by Wigope',
          style: WigopeText.caption.copyWith(
            color: WigopeColors.textTertiary,
            letterSpacing: 0.04 * 11,
          ),
        ),
      ],
    );
  }
}
