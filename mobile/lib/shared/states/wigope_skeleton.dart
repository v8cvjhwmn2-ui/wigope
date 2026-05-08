import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/radii.dart';

/// Loading placeholder. Always pair list items with this — never spinners.
class WigopeSkeleton extends StatelessWidget {
  const WigopeSkeleton({
    super.key,
    this.width = double.infinity,
    this.height = 16,
    this.radius,
  });

  /// Convenience: a card-shaped skeleton (e.g., for transaction rows).
  const WigopeSkeleton.card({super.key, this.height = 88})
      : width = double.infinity,
        radius = WigopeRadii.card;

  /// Convenience: a circle (avatar / operator logo).
  const WigopeSkeleton.circle({super.key, double size = 40})
      : width = size,
        height = size,
        radius = 999;

  final double width;
  final double height;
  final double? radius;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: WigopeColors.surfaceMuted,
      highlightColor: WigopeColors.surfaceBase,
      period: const Duration(milliseconds: 1200),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: WigopeColors.surfaceMuted,
          borderRadius: BorderRadius.circular(radius ?? 8),
        ),
      ),
    );
  }
}
