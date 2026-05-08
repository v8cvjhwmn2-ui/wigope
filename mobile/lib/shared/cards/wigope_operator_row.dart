import 'package:flutter/material.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

/// Margin-list row: operator logo (or letter avatar) + name + green commission %.
class WigopeOperatorRow extends StatelessWidget {
  const WigopeOperatorRow({
    super.key,
    required this.name,
    required this.commission,
    this.brandColor,
    this.logoText,
    this.onTap,
  });

  final String name;
  final String commission; // e.g. "Upto 3.0%"
  final Color? brandColor;
  final String? logoText;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            _OperatorLogo(
              name: name,
              brandColor: brandColor ?? WigopeColors.orange50,
              logoText: logoText,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                name,
                style: WigopeText.bodyStrong.copyWith(
                  color: WigopeColors.navy900,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            Text(
              commission,
              style: WigopeText.bodyStrong.copyWith(
                color: WigopeColors.success,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OperatorLogo extends StatelessWidget {
  const _OperatorLogo({
    required this.name,
    required this.brandColor,
    this.logoText,
  });

  final String name;
  final Color brandColor;
  final String? logoText;

  @override
  Widget build(BuildContext context) {
    final key = name.toLowerCase();
    final textColor = brandColor.computeLuminance() > 0.55
        ? WigopeColors.navy900
        : Colors.white;

    Widget logo;
    if (key.contains('airtel') && !key.contains('tv')) {
      logo = _BrandText('airtel', color: Colors.white, size: 9.5);
    } else if (key == 'jio') {
      logo = const _BrandText('Jio', color: Colors.white, size: 18);
    } else if (key == 'vi') {
      logo = const Stack(
        alignment: Alignment.center,
        children: [
          _BrandText('VI', color: Colors.white, size: 18),
          Positioned(
            right: 9,
            bottom: 8,
            child:
                CircleAvatar(radius: 3.5, backgroundColor: Color(0xFFFFD51B)),
          ),
        ],
      );
    } else if (key.contains('bsnl')) {
      logo = Stack(
        alignment: Alignment.center,
        children: [
          Transform.rotate(
            angle: -0.65,
            child: Container(
              width: 35,
              height: 2.4,
              color: const Color(0xFFE2252D),
            ),
          ),
          Transform.rotate(
            angle: -0.65,
            child: Container(
              width: 28,
              height: 2.4,
              color: const Color(0xFF2B96D3),
            ),
          ),
          const Icon(Icons.open_in_full_rounded, color: Colors.white, size: 17),
        ],
      );
    } else if (key.contains('tata')) {
      logo = const _BrandText('TATA\nPLAY', color: Colors.white, size: 10);
    } else if (key.contains('dish')) {
      logo = const _BrandText('dishtv', color: Colors.white, size: 12);
    } else if (key.contains('airtel tv')) {
      logo = const _BrandText('airtel\ndigital tv',
          color: Colors.white, size: 8.6);
    } else if (key == 'd2h') {
      logo = const _BrandText('d2h', color: Colors.white, size: 18);
    } else if (key.contains('sun')) {
      logo = const _BrandText('SUN', color: Colors.red, size: 14);
    } else if (key.contains('google')) {
      logo = const Icon(Icons.play_arrow_rounded,
          color: Color(0xFF19A15F), size: 30);
    } else if (key.contains('fastag')) {
      logo = const _BrandText('FASTag', color: Color(0xFF15A24A), size: 10.5);
    } else {
      logo = _BrandText(
        (logoText ?? name).trim().substring(0, 1).toUpperCase(),
        color: textColor,
        size: 18,
      );
    }

    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: brandColor,
        shape: BoxShape.circle,
        boxShadow: const [
          BoxShadow(
            color: Color(0x120A1628),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      alignment: Alignment.center,
      clipBehavior: Clip.antiAlias,
      child: logo,
    );
  }
}

class _BrandText extends StatelessWidget {
  const _BrandText(this.text, {required this.color, required this.size});

  final String text;
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return FittedBox(
      fit: BoxFit.scaleDown,
      child: Text(
        text,
        maxLines: 2,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: color,
          fontSize: size,
          fontWeight: FontWeight.w900,
          height: 0.95,
          letterSpacing: -0.4,
        ),
      ),
    );
  }
}
