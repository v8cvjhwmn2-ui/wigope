import 'package:flutter/material.dart';

import '../../app/theme/colors.dart';

/// Subtle 24px grid pattern — matches the wigope.com hero backdrop.
/// Use with `Stack` behind hero cards. Cheap to paint (just two line passes).
class GridPatternBackground extends StatelessWidget {
  const GridPatternBackground({
    super.key,
    this.color,
    this.opacity = 0.18,
    this.spacing = 24,
    this.borderRadius,
    this.child,
  });

  final Color? color;
  final double opacity;
  final double spacing;
  final BorderRadius? borderRadius;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final painted = CustomPaint(
      painter: _GridPainter(
        color: (color ?? WigopeColors.borderSoft).withOpacity(opacity),
        spacing: spacing,
      ),
      child: child,
    );
    if (borderRadius == null) return painted;
    return ClipRRect(borderRadius: borderRadius!, child: painted);
  }
}

class _GridPainter extends CustomPainter {
  _GridPainter({required this.color, required this.spacing});
  final Color color;
  final double spacing;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = 1;
    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), p);
    }
    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), p);
    }
  }

  @override
  bool shouldRepaint(covariant _GridPainter old) =>
      old.color != color || old.spacing != spacing;
}
