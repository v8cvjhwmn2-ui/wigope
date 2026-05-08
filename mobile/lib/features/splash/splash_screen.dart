import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/branding/wigope_logo.dart';
import '../../shared/decoration/grid_pattern.dart';

/// Splash — purely decorative. The router decides where to navigate next based
/// on `AuthController.bootstrap()` state, so we don't time out manually here.
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceBase,
      body: Stack(
        children: [
          Positioned.fill(
            child: GridPatternBackground(opacity: 0.30, spacing: 28),
          ),
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: WigopeColors.orange400.withOpacity(0.16),
              ),
            ),
          ),
          Positioned(
            bottom: -120,
            left: -120,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: WigopeColors.orange50,
              ),
            ),
          ),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 132,
                  height: 132,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [
                      BoxShadow(
                        color: WigopeColors.orange600.withOpacity(0.36),
                        blurRadius: 38,
                        offset: const Offset(0, 18),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(32),
                    child: const WigopeLogo.mark(size: 132),
                  ),
                )
                    .animate()
                    .scale(
                      duration: 480.ms,
                      curve: Curves.easeOutCubic,
                      begin: const Offset(0.82, 0.82),
                    )
                    .fadeIn(duration: 320.ms),
                const SizedBox(height: 22),
                const WigopeLogo.wordmark(height: 28)
                    .animate()
                    .fadeIn(delay: 280.ms, duration: 420.ms)
                    .slideY(begin: 0.2, end: 0, duration: 420.ms),
                const SizedBox(height: 10),
                Text(
                  'Recharge & Bill Payments',
                  style: WigopeText.bodyStrong.copyWith(
                    color: WigopeColors.navy800,
                    letterSpacing: 0.5,
                    fontWeight: FontWeight.w600,
                  ),
                ).animate().fadeIn(delay: 480.ms, duration: 360.ms),
                const SizedBox(height: 28),
                const SizedBox(
                  width: 28,
                  height: 28,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.4,
                    color: WigopeColors.orange600,
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 36,
            child: Center(
              child: Column(
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: WigopeColors.surfaceCard,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: WigopeColors.borderSoft),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Secured by Wigope',
                          style: WigopeText.caption.copyWith(
                            color: WigopeColors.textSecondary,
                            letterSpacing: 0.12 * 11,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 4,
                          height: 4,
                          decoration: const BoxDecoration(
                            color: WigopeColors.borderDefault,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Made in India',
                          style: WigopeText.caption.copyWith(
                            color: WigopeColors.textSecondary,
                            letterSpacing: 0.12 * 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Wigope Technologies Pvt Ltd',
                    style: WigopeText.bodyS.copyWith(
                      color: WigopeColors.textTertiary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ).animate().fadeIn(delay: 700.ms, duration: 360.ms),
            ),
          ),
        ],
      ),
    );
  }
}
