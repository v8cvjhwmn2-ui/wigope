import 'package:flutter/material.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/radii.dart';

class WigopeCard extends StatelessWidget {
  const WigopeCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.hero = false,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final bool hero;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: hero ? WigopeRadii.rHero : WigopeRadii.rCard,
        border: Border.all(color: WigopeColors.borderSoft),
        boxShadow: [
          BoxShadow(
            color: WigopeColors.navy900.withOpacity(hero ? 0.08 : 0.04),
            blurRadius: hero ? 24 : 8,
            offset: Offset(0, hero ? 8 : 2),
          ),
        ],
      ),
      padding: padding,
      child: child,
    );

    if (onTap == null) return card;
    return InkWell(
      onTap: onTap,
      borderRadius: hero ? WigopeRadii.rHero : WigopeRadii.rCard,
      child: card,
    );
  }
}
