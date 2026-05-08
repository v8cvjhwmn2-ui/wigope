import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/radii.dart';
import '../../app/theme/typography.dart';

enum WigopeButtonVariant { primary, secondary, tertiary }

class WigopeButton extends StatefulWidget {
  const WigopeButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = WigopeButtonVariant.primary,
    this.icon,
    this.loading = false,
    this.fullWidth = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final WigopeButtonVariant variant;
  final IconData? icon;
  final bool loading;
  final bool fullWidth;

  @override
  State<WigopeButton> createState() => _WigopeButtonState();
}

class _WigopeButtonState extends State<WigopeButton> {
  bool _pressed = false;

  void _setPressed(bool v) {
    if (widget.onPressed == null || widget.loading) return;
    if (v) HapticFeedback.lightImpact();
    setState(() => _pressed = v);
  }

  @override
  Widget build(BuildContext context) {
    final disabled = widget.onPressed == null || widget.loading;
    final height = switch (widget.variant) {
      WigopeButtonVariant.primary => WigopeHeights.buttonPrimary,
      WigopeButtonVariant.secondary => WigopeHeights.buttonSecondary,
      WigopeButtonVariant.tertiary => WigopeHeights.buttonTertiary,
    };

    Widget child = AnimatedScale(
      scale: _pressed ? 0.97 : 1.0,
      duration: const Duration(milliseconds: 100),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        height: height,
        width: widget.fullWidth ? double.infinity : null,
        padding: EdgeInsets.symmetric(horizontal: widget.fullWidth ? 24 : 20),
        decoration: BoxDecoration(
          borderRadius: WigopeRadii.rButton,
          gradient: widget.variant == WigopeButtonVariant.primary && !disabled
              ? WigopeColors.gradOrange
              : null,
          color: switch (widget.variant) {
            WigopeButtonVariant.primary => disabled ? WigopeColors.borderDefault : null,
            WigopeButtonVariant.secondary => WigopeColors.surfaceBase,
            WigopeButtonVariant.tertiary => Colors.transparent,
          },
          border: widget.variant == WigopeButtonVariant.secondary
              ? Border.all(color: WigopeColors.orange600)
              : null,
          boxShadow: widget.variant == WigopeButtonVariant.primary && !disabled
              ? const [BoxShadow(color: Color(0x1FF97316), blurRadius: 16, offset: Offset(0, 6))]
              : null,
        ),
        alignment: Alignment.center,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (widget.loading)
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white),
              )
            else ...[
              Text(
                widget.label,
                style: WigopeText.bodyStrong.copyWith(
                  color: switch (widget.variant) {
                    WigopeButtonVariant.primary => WigopeColors.textOnOrange,
                    WigopeButtonVariant.secondary || WigopeButtonVariant.tertiary =>
                      WigopeColors.orange600,
                  },
                ),
              ),
              if (widget.icon != null) ...[
                const SizedBox(width: 8),
                Icon(
                  widget.icon,
                  size: 18,
                  color: widget.variant == WigopeButtonVariant.primary
                      ? WigopeColors.textOnOrange
                      : WigopeColors.orange600,
                ),
              ],
            ],
          ],
        ),
      ),
    );

    return GestureDetector(
      onTapDown: (_) => _setPressed(true),
      onTapUp: (_) => _setPressed(false),
      onTapCancel: () => _setPressed(false),
      onTap: disabled ? null : widget.onPressed,
      child: Opacity(opacity: disabled ? 0.6 : 1, child: child),
    );
  }
}
