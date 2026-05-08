import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

/// Used after a recharge / wallet top-up. Auto-fires haptic + optional confetti.
/// Drop-in replacement for the (later) Lottie checkmark — same surface area.
class WigopeSuccessAnimation extends StatefulWidget {
  const WigopeSuccessAnimation({
    super.key,
    required this.title,
    this.subtitle,
    this.confetti = false,
  });

  final String title;
  final String? subtitle;
  final bool confetti;

  @override
  State<WigopeSuccessAnimation> createState() => _WigopeSuccessAnimationState();
}

class _WigopeSuccessAnimationState extends State<WigopeSuccessAnimation>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final ConfettiController _confettiCtrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600))
      ..forward();
    _confettiCtrl = ConfettiController(duration: const Duration(seconds: 2));
    HapticFeedback.mediumImpact();
    if (widget.confetti) _confettiCtrl.play();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _confettiCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.topCenter,
      children: [
        Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ScaleTransition(
                scale: CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut),
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: WigopeColors.successBg,
                    shape: BoxShape.circle,
                    border: Border.all(color: WigopeColors.success, width: 3),
                  ),
                  child: const Icon(
                    PhosphorIconsBold.checkCircle,
                    size: 64,
                    color: WigopeColors.success,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(widget.title, style: WigopeText.displayL, textAlign: TextAlign.center),
              if (widget.subtitle != null) ...[
                const SizedBox(height: 8),
                Text(
                  widget.subtitle!,
                  style: WigopeText.body.copyWith(color: WigopeColors.textSecondary),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
        if (widget.confetti)
          ConfettiWidget(
            confettiController: _confettiCtrl,
            blastDirectionality: BlastDirectionality.explosive,
            shouldLoop: false,
            colors: const [
              WigopeColors.orange600,
              WigopeColors.orange400,
              WigopeColors.success,
              WigopeColors.navy700,
            ],
          ),
      ],
    );
  }
}
