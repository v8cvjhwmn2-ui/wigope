import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/radii.dart';
import '../../app/theme/typography.dart';

/// Service grid tile used on the home dashboard (Mobile, DTH, Electricity, etc).
/// Light card, hairline border, orange-soft icon halo, navy label.
///
/// Note: this tile fills its parent height. Always wrap it in a `GridView` with
/// `mainAxisExtent` (≥ 96) — never the default 1:1 aspect ratio, otherwise the
/// label overflows on narrow screens.
class WigopeServiceTile extends StatelessWidget {
  const WigopeServiceTile({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      borderRadius: WigopeRadii.rCard,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        decoration: BoxDecoration(
          color: WigopeColors.surfaceCard,
          borderRadius: WigopeRadii.rCard,
          border: Border.all(color: WigopeColors.borderSoft),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                gradient: WigopeColors.gradOrangeSoft,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: WigopeColors.orange600, size: 20),
            ),
            const SizedBox(height: 6),
            Flexible(
              child: Text(
                label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: WigopeText.bodyS.copyWith(
                  color: WigopeColors.navy900,
                  fontWeight: FontWeight.w600,
                  height: 1.2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
