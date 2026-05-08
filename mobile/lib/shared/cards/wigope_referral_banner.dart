import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../buttons/wigope_button.dart';

/// Orange-soft banner with a "gift" illustration on the right and CTA on the left.
/// Used on Home (matches §4.5 F).
class WigopeReferralBanner extends StatelessWidget {
  const WigopeReferralBanner({super.key, required this.onInvite});

  final VoidCallback onInvite;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 12, 20),
      decoration: BoxDecoration(
        gradient: WigopeColors.gradOrangeSoft,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: WigopeColors.orange50),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D0A1628),
            blurRadius: 18,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            flex: 7,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    'FIXED REWARD',
                    style: WigopeText.caption.copyWith(
                      color: WigopeColors.orange600,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.05 * 11,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Invite friends, earn ₹7',
                  style: WigopeText.h2.copyWith(color: WigopeColors.navy900),
                ),
                const SizedBox(height: 6),
                Text(
                  '₹7 per verified invite. Build your audience chain and unlock extra earning opportunities.',
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: WigopeText.bodyS
                      .copyWith(color: WigopeColors.textSecondary),
                ),
                const SizedBox(height: 14),
                WigopeButton(
                  label: 'Invite Now',
                  onPressed: onInvite,
                  fullWidth: false,
                  icon: PhosphorIconsBold.arrowRight,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 3,
            child: AspectRatio(
              aspectRatio: 1,
              child: _GiftIllustration(),
            ),
          ),
        ],
      ),
    );
  }
}

/// Lightweight CSS-style gift illustration (no asset dependency).
/// Replace with `lottie/gift.json` once design hands one over.
class _GiftIllustration extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // pedestal
        Positioned(
          bottom: 12,
          child: Container(
            width: 86,
            height: 18,
            decoration: BoxDecoration(
              gradient: WigopeColors.gradOrange,
              borderRadius: BorderRadius.circular(40),
            ),
          ),
        ),
        // small gift top-left
        Positioned(
          top: 12,
          left: 4,
          child:
              _GiftBox(size: 26, rotate: -.18, color: WigopeColors.orange400),
        ),
        // big gift center
        _GiftBox(size: 56, rotate: .04, color: WigopeColors.orange600),
        // small gift right
        Positioned(
          top: 22,
          right: 4,
          child: _GiftBox(size: 28, rotate: .22, color: WigopeColors.orange500),
        ),
        // sparkle
        const Positioned(
          top: 0,
          right: 18,
          child: Icon(
            PhosphorIconsFill.sparkle,
            size: 16,
            color: WigopeColors.orange600,
          ),
        ),
      ],
    );
  }
}

class _GiftBox extends StatelessWidget {
  const _GiftBox(
      {required this.size, required this.rotate, required this.color});
  final double size;
  final double rotate;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: rotate,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.35),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Stack(
          children: [
            // ribbon vertical
            Positioned.fill(
              child: Center(
                child: Container(width: size * 0.16, color: Colors.white),
              ),
            ),
            // ribbon horizontal
            Positioned.fill(
              child: Center(
                child: Container(height: size * 0.16, color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
