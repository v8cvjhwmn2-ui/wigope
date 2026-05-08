import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/theme/colors.dart';

/// Brand logo. Tries `assets/icons/wigope_logo.png` (the official mark) and
/// gracefully falls back to a code-painted approximation so the UI never breaks
/// during dev or first launch. Drop the PNG into `mobile/assets/icons/` and
/// it'll be picked up automatically.
///
/// The painted fallback is engineered to *resemble* the official mark:
/// a chunky white W with an orange edge, an orange flame swoosh exiting the
/// right leg, a 4-point sparkle on top-right, and an "WIGOPE" wordmark with a
/// hairline orange underline swoosh — all from primitives, no asset needed.
///
/// Variants:
///  - [WigopeLogo.mark]      → square mark only (splash, app bar avatar)
///  - [WigopeLogo.full]      → mark + WIGOPE wordmark, horizontal
///  - [WigopeLogo.wordmark]  → wordmark only (footers, dense headers)
class WigopeLogo extends StatelessWidget {
  const WigopeLogo.mark({super.key, this.size = 48})
      : _variant = _Variant.mark,
        _height = size;

  const WigopeLogo.full({super.key, double height = 36})
      : _variant = _Variant.full,
        _height = height,
        size = 0;

  const WigopeLogo.wordmark({super.key, double height = 22})
      : _variant = _Variant.wordmark,
        _height = height,
        size = 0;

  final _Variant _variant;
  final double size;
  final double _height;

  static const _markAsset = 'assets/icons/wigope_logo_mark.png';
  static const _fullAsset = 'assets/icons/wigope_logo.png';
  static final Future<Set<String>> _availableAssets =
      AssetManifest.loadFromAssetBundle(
    rootBundle,
  ).then((manifest) => manifest.listAssets().toSet());

  @override
  Widget build(BuildContext context) {
    switch (_variant) {
      case _Variant.mark:
        return FutureBuilder<Set<String>>(
          future: _availableAssets,
          builder: (context, snapshot) {
            if (snapshot.data?.contains(_markAsset) ?? false) {
              return Image.asset(_markAsset, height: size, width: size);
            }
            return _PaintedMark(size: size);
          },
        );
      case _Variant.full:
        return FutureBuilder<Set<String>>(
          future: _availableAssets,
          builder: (context, snapshot) {
            if (snapshot.data?.contains(_fullAsset) ?? false) {
              return Image.asset(_fullAsset,
                  height: _height, fit: BoxFit.contain);
            }
            return _PaintedFull(height: _height);
          },
        );
      case _Variant.wordmark:
        return _PaintedWordmark(height: _height);
    }
  }
}

enum _Variant { mark, full, wordmark }

// ─────────────────────────────────────────────────────────────────────────────
// Painted fallbacks — engineered to resemble the official Wigope mark.
// ─────────────────────────────────────────────────────────────────────────────

class _PaintedMark extends StatelessWidget {
  const _PaintedMark({required this.size});
  final double size;

  @override
  Widget build(BuildContext context) {
    // Square aspect — fits a splash hero or an avatar slot.
    return SizedBox.square(
      dimension: size,
      child: CustomPaint(painter: _MarkPainter()),
    );
  }
}

class _PaintedFull extends StatelessWidget {
  const _PaintedFull({required this.height});
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox.square(
            dimension: height,
            child: CustomPaint(painter: _MarkPainter()),
          ),
          SizedBox(width: height * 0.28),
          _PaintedWordmark(height: height * 0.62),
        ],
      ),
    );
  }
}

class _PaintedWordmark extends StatelessWidget {
  const _PaintedWordmark({required this.height});
  final double height;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'WIGOPE',
          style: TextStyle(
            fontFamily: 'PlusJakartaSans',
            fontSize: height,
            height: 1,
            fontWeight: FontWeight.w900,
            color: WigopeColors.orange600,
            letterSpacing: -height * 0.02,
          ),
        ),
        SizedBox(height: height * 0.08),
        // Subtle orange swoosh underline (mirrors the real mark's brand line).
        SizedBox(
          width: height * 4.4,
          height: height * 0.12,
          child: CustomPaint(painter: _SwooshPainter()),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Painters
// ─────────────────────────────────────────────────────────────────────────────

class _MarkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // 1. Flame swoosh — orange gradient ribbon coming out from behind the W.
    final flame = Path()
      ..moveTo(w * 0.50, h * 0.92)
      ..cubicTo(
        w * 0.78,
        h * 0.95,
        w * 0.96,
        h * 0.55,
        w * 0.82,
        h * 0.10,
      )
      ..cubicTo(
        w * 0.78,
        h * 0.32,
        w * 0.66,
        h * 0.46,
        w * 0.55,
        h * 0.55,
      )
      ..cubicTo(
        w * 0.42,
        h * 0.66,
        w * 0.40,
        h * 0.82,
        w * 0.50,
        h * 0.92,
      )
      ..close();

    final flamePaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.bottomLeft,
        end: Alignment.topRight,
        colors: [Color(0xFFFF6A00), Color(0xFFF97316), Color(0xFFFFA968)],
      ).createShader(Rect.fromLTWH(0, 0, w, h));
    canvas.drawPath(flame, flamePaint);

    // 2. The W — bold, slightly forward-leaning, white fill + orange edge.
    final wPath = _buildWPath(w, h);

    // soft drop shadow under the W for depth
    canvas.drawPath(
      wPath.shift(Offset(0, h * 0.012)),
      Paint()
        ..color = const Color(0x33F97316)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4),
    );

    // white fill
    canvas.drawPath(wPath, Paint()..color = Colors.white);

    // orange outer edge highlight (gives the 3D faceted look)
    canvas.drawPath(
      wPath,
      Paint()
        ..color = WigopeColors.orange600
        ..style = PaintingStyle.stroke
        ..strokeWidth = w * 0.018
        ..strokeJoin = StrokeJoin.round,
    );

    // 3. Sparkle — 4-point star, top-right
    _drawSparkle(canvas, Offset(w * 0.74, h * 0.16), w * 0.07);
  }

  Path _buildWPath(double w, double h) {
    // A slightly stylized "W" — like the reference mark.
    // Coordinates are tuned visually, not from a vector source.
    return Path()
      ..moveTo(w * 0.10, h * 0.18)
      ..lineTo(w * 0.26, h * 0.18)
      ..lineTo(w * 0.36, h * 0.62)
      ..lineTo(w * 0.45, h * 0.36)
      ..lineTo(w * 0.55, h * 0.36)
      ..lineTo(w * 0.64, h * 0.62)
      ..lineTo(w * 0.74, h * 0.18)
      ..lineTo(w * 0.90, h * 0.18)
      ..lineTo(w * 0.66, h * 0.86)
      ..lineTo(w * 0.55, h * 0.86)
      ..lineTo(w * 0.50, h * 0.62)
      ..lineTo(w * 0.45, h * 0.86)
      ..lineTo(w * 0.34, h * 0.86)
      ..close();
  }

  void _drawSparkle(Canvas canvas, Offset c, double r) {
    final p = Paint()
      ..shader = const RadialGradient(
        colors: [Colors.white, Color(0xFFFFE4B5)],
      ).createShader(Rect.fromCircle(center: c, radius: r));
    final path = Path()
      ..moveTo(c.dx, c.dy - r)
      ..quadraticBezierTo(c.dx + r * 0.25, c.dy - r * 0.25, c.dx + r, c.dy)
      ..quadraticBezierTo(c.dx + r * 0.25, c.dy + r * 0.25, c.dx, c.dy + r)
      ..quadraticBezierTo(c.dx - r * 0.25, c.dy + r * 0.25, c.dx - r, c.dy)
      ..quadraticBezierTo(c.dx - r * 0.25, c.dy - r * 0.25, c.dx, c.dy - r)
      ..close();
    canvas.drawPath(path, p);
    // small glow
    canvas.drawCircle(
      c,
      r * 0.3,
      Paint()..color = Colors.white,
    );
  }

  @override
  bool shouldRepaint(_) => false;
}

class _SwooshPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = WigopeColors.orange600
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = size.height * 0.6;

    final path = Path()
      ..moveTo(0, size.height * 0.5)
      ..quadraticBezierTo(
          size.width * 0.5, size.height * -0.3, size.width, size.height * 0.5);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_) => false;
}
