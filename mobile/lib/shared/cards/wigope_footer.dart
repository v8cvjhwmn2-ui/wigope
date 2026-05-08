import 'package:flutter/material.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

/// Trust footer used at the bottom of Home — company, partners, and India line.
class WigopeFooter extends StatelessWidget {
  const WigopeFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 8),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'WIGOPE',
                style: WigopeText.displayL.copyWith(
                  color: WigopeColors.navy900,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.02 * 32,
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                '♥',
                style: TextStyle(
                  color: Color(0xFFE11D48),
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  height: 1,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'INDIA',
                style: WigopeText.displayL.copyWith(
                  color: WigopeColors.navy900,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.02 * 32,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Divider(color: WigopeColors.borderSoft, height: 1),
          const SizedBox(height: 14),
          Text(
            'Our Official Partners',
            style: WigopeText.bodyS.copyWith(color: WigopeColors.textSecondary),
          ),
          const SizedBox(height: 12),
          const _PartnerStrip(),
          const SizedBox(height: 16),
          Text(
            'Wigope Technologies Pvt Ltd',
            style: WigopeText.bodyStrong,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            'CIN U63999UP2025PTC238367',
            style: WigopeText.bodyS.copyWith(color: WigopeColors.textTertiary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'MADE IN INDIA',
            style:
                WigopeText.caption.copyWith(color: WigopeColors.textTertiary),
          ),
        ],
      ),
    );
  }
}

class _PartnerStrip extends StatelessWidget {
  const _PartnerStrip();

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/partners/official_partner_strip.png',
      height: 44,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
    );
  }
}
