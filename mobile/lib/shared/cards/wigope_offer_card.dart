import 'package:flutter/material.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

/// Brand offer tile used in the reward deals grid + Hubble Rewards screen.
///
/// Logo resolution order:
///   1. `tileAssetPath` if the bundled PNG is a complete square tile.
///   2. `assetPath` if the bundled PNG is a logo to place on the brand color.
///   3. Painted text fallback in the brand's own typography style.
///
/// Wrap in a GridView with `mainAxisExtent ≥ 132` so the label never clips.
class WigopeOfferCard extends StatelessWidget {
  const WigopeOfferCard({
    super.key,
    required this.brand,
    required this.discount,
    required this.brandColor,
    this.logoText,
    this.logoStyle,
    this.tileAssetPath,
    this.assetPath,
    this.tileSize = 84,
    this.onTap,
  });

  final String brand;
  final String discount;
  final Color brandColor;
  final String? logoText;
  final TextStyle? logoStyle;
  final String? tileAssetPath;
  final String? assetPath;
  final double tileSize;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox.square(
            dimension: tileSize,
            child: _TileVisual(
              brand: brand,
              discount: discount,
              brandColor: brandColor,
              logoText: logoText,
              logoStyle: logoStyle,
              tileAssetPath: tileAssetPath,
              assetPath: assetPath,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            brand,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: WigopeText.bodyS.copyWith(
              color: WigopeColors.navy900,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _TileVisual extends StatelessWidget {
  const _TileVisual({
    required this.brand,
    required this.discount,
    required this.brandColor,
    this.logoText,
    this.logoStyle,
    this.tileAssetPath,
    this.assetPath,
  });

  final String brand;
  final String discount;
  final Color brandColor;
  final String? logoText;
  final TextStyle? logoStyle;
  final String? tileAssetPath;
  final String? assetPath;

  @override
  Widget build(BuildContext context) {
    if (tileAssetPath != null) {
      return AspectRatio(
        aspectRatio: 1,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Image.asset(
            tileAssetPath!,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _FallbackTile(
              brand: brand,
              discount: discount,
              brandColor: brandColor,
              logoText: logoText,
              logoStyle: logoStyle,
              assetPath: assetPath,
            ),
          ),
        ),
      );
    }

    return _FallbackTile(
      brand: brand,
      discount: discount,
      brandColor: brandColor,
      logoText: logoText,
      logoStyle: logoStyle,
      assetPath: assetPath,
    );
  }
}

class _FallbackTile extends StatelessWidget {
  const _FallbackTile({
    required this.brand,
    required this.discount,
    required this.brandColor,
    this.logoText,
    this.logoStyle,
    this.assetPath,
  });

  final String brand;
  final String discount;
  final Color brandColor;
  final String? logoText;
  final TextStyle? logoStyle;
  final String? assetPath;

  @override
  Widget build(BuildContext context) {
    final fallback = _PaintedWordmark(
      text: logoText ?? brand,
      style: logoStyle ?? _defaultLogoStyleFor(brand, _readableOn(brandColor)),
    );

    Widget logo = fallback;
    if (assetPath != null) {
      logo = Image.asset(
        assetPath!,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => fallback,
      );
    }

    return AspectRatio(
      aspectRatio: 1,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    brandColor,
                    Color.lerp(brandColor, Colors.black, 0.18)!,
                  ],
                ),
              ),
              alignment: Alignment.center,
              padding: const EdgeInsets.all(10),
              child: logo,
            ),
            Positioned.fill(
              child: IgnorePointer(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.white.withOpacity(0.18),
                        Colors.white.withOpacity(0.0),
                        Colors.white.withOpacity(0.0),
                      ],
                      stops: const [0.0, 0.45, 1.0],
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 0,
              left: 0,
              child: ClipPath(
                clipper: _RibbonClipper(),
                child: Container(
                  width: 60,
                  height: 22,
                  decoration: const BoxDecoration(
                    gradient: WigopeColors.gradOrange,
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x55F97316),
                        blurRadius: 8,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  alignment: const Alignment(-0.2, 0),
                  child: Text(
                    discount,
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 0.2,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

TextStyle _defaultLogoStyleFor(String brand, Color color) {
  final b = brand.toLowerCase();
  TextStyle base(TextStyle override) =>
      TextStyle(color: color, height: 1).merge(override);
  if (b.contains('lifestyle')) {
    return base(const TextStyle(
        fontSize: 22,
        fontStyle: FontStyle.italic,
        fontWeight: FontWeight.w400));
  }
  if (b.contains('cleartrip')) {
    return base(const TextStyle(
        fontSize: 18,
        fontStyle: FontStyle.italic,
        fontWeight: FontWeight.w700));
  }
  if (b.contains('decathlon') ||
      b.contains('myntra') ||
      b.contains('tanishq') ||
      b.contains('chumbak') ||
      b.contains('reliance')) {
    return base(const TextStyle(
        fontSize: 17, fontWeight: FontWeight.w900, letterSpacing: -0.4));
  }
  if (b.contains('prime')) {
    return base(const TextStyle(
        fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: -0.6));
  }
  if (b.contains('hotstar') || b.contains('disney')) {
    return base(const TextStyle(
        fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: -0.3));
  }
  return base(const TextStyle(
      fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: -0.5));
}

Color _readableOn(Color bg) {
  return bg.computeLuminance() > 0.55 ? WigopeColors.navy900 : Colors.white;
}

class _PaintedWordmark extends StatelessWidget {
  const _PaintedWordmark({required this.text, required this.style});
  final String text;
  final TextStyle style;

  @override
  Widget build(BuildContext context) {
    return FittedBox(
      fit: BoxFit.scaleDown,
      child: Text(
        text,
        maxLines: 1,
        textAlign: TextAlign.center,
        style: style,
      ),
    );
  }
}

class _RibbonClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) => Path()
    ..moveTo(0, 0)
    ..lineTo(size.width, 0)
    ..lineTo(size.width - 10, size.height)
    ..lineTo(0, size.height)
    ..close();

  @override
  bool shouldReclip(covariant CustomClipper<Path> _) => false;
}
