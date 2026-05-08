import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

/// Profile / settings row. Icon halo + label + optional trailing.
/// Tone controls the icon halo color (default = orange-soft).
enum WigopeTileTone { brand, info, success, warning, danger, neutral }

class WigopeListTile extends StatelessWidget {
  const WigopeListTile({
    super.key,
    required this.icon,
    required this.label,
    this.trailing,
    this.onTap,
    this.tone = WigopeTileTone.brand,
    this.subtitle,
    this.danger = false,
  });

  final IconData icon;
  final String label;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final WigopeTileTone tone;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (danger ? WigopeTileTone.danger : tone) {
      WigopeTileTone.brand => (WigopeColors.orange50, WigopeColors.orange600),
      WigopeTileTone.info => (WigopeColors.infoBg, WigopeColors.info),
      WigopeTileTone.success => (WigopeColors.successBg, WigopeColors.success),
      WigopeTileTone.warning => (WigopeColors.warningBg, WigopeColors.warning),
      WigopeTileTone.danger => (WigopeColors.errorBg, WigopeColors.error),
      WigopeTileTone.neutral => (WigopeColors.surfaceMuted, WigopeColors.textSecondary),
    };

    final labelColor = danger ? WigopeColors.error : WigopeColors.navy900;

    return InkWell(
      onTap: onTap == null
          ? null
          : () {
              HapticFeedback.selectionClick();
              onTap!();
            },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
              child: Icon(icon, color: fg, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: WigopeText.bodyStrong.copyWith(
                        color: labelColor,
                        fontWeight: FontWeight.w600,
                      )),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(subtitle!, style: WigopeText.bodyS),
                  ],
                ],
              ),
            ),
            trailing ??
                Icon(
                  PhosphorIconsRegular.caretRight,
                  size: 18,
                  color: danger ? WigopeColors.error : WigopeColors.textTertiary,
                ),
          ],
        ),
      ),
    );
  }
}

/// Group of [WigopeListTile]s with a section title — used heavily on the profile.
class WigopeTileSection extends StatelessWidget {
  const WigopeTileSection({super.key, this.title, required this.children});

  final String? title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final tiles = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      tiles.add(children[i]);
      if (i != children.length - 1) {
        tiles.add(const Divider(
          height: 1,
          thickness: 1,
          indent: 70,
          color: WigopeColors.borderSoft,
        ));
      }
    }

    return Container(
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: WigopeColors.borderSoft),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Text(title!, style: WigopeText.h3),
            ),
          ...tiles,
          const SizedBox(height: 4),
        ],
      ),
    );
  }
}
