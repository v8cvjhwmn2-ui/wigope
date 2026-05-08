import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

/// A unique "tier" pill the user wears in the greeting strip.
/// Tier ladder: Bronze → Silver → Gold → Platinum (drives cashback rate later).
enum WigopeTier { bronze, silver, gold, platinum }

class WigopeTierBadge extends StatelessWidget {
  const WigopeTierBadge({super.key, required this.tier});

  final WigopeTier tier;

  @override
  Widget build(BuildContext context) {
    final (gradient, label, icon) = switch (tier) {
      WigopeTier.bronze => (
          const LinearGradient(colors: [Color(0xFFB66B36), Color(0xFFE3915E)]),
          'BRONZE',
          PhosphorIconsFill.medal,
        ),
      WigopeTier.silver => (
          const LinearGradient(colors: [Color(0xFF8B95AB), Color(0xFFC4CCDA)]),
          'SILVER',
          PhosphorIconsFill.medal,
        ),
      WigopeTier.gold => (
          const LinearGradient(colors: [Color(0xFFEDA82A), Color(0xFFFFD66B)]),
          'GOLD',
          PhosphorIconsFill.crown,
        ),
      WigopeTier.platinum => (
          WigopeColors.gradNavy,
          'PLATINUM',
          PhosphorIconsFill.diamond,
        ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(999),
        boxShadow: const [
          BoxShadow(
            color: Color(0x140A1628),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: Colors.white),
          const SizedBox(width: 4),
          Text(
            label,
            style: WigopeText.caption.copyWith(
              color: Colors.white,
              fontSize: 9,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.18 * 11,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }
}
