import 'package:flutter/material.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

/// A branded section divider — gradient line + small orange dot label.
/// Used between major sections on Home/Profile to give the page rhythm
/// without using heavy backgrounds.
class WigopeSectionDivider extends StatelessWidget {
  const WigopeSectionDivider({super.key, this.label});
  final String? label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 1,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0x00F97316),
                    WigopeColors.borderDefault,
                  ],
                ),
              ),
            ),
          ),
          if (label != null) ...[
            const SizedBox(width: 10),
            Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                gradient: WigopeColors.gradOrange,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              label!.toUpperCase(),
              style: WigopeText.caption.copyWith(
                color: WigopeColors.textTertiary,
                letterSpacing: 0.18 * 11,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                gradient: WigopeColors.gradOrange,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 10),
          ],
          Expanded(
            child: Container(
              height: 1,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    WigopeColors.borderDefault,
                    Color(0x00F97316),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
