import 'package:flutter/material.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

enum WigopeStatusKind { success, pending, failed, info }

/// Small pill used in transaction rows. Always pair color with semantic label.
class WigopeStatusPill extends StatelessWidget {
  const WigopeStatusPill({super.key, required this.kind, required this.label});

  final WigopeStatusKind kind;
  final String label;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (kind) {
      WigopeStatusKind.success => (WigopeColors.successBg, WigopeColors.success),
      WigopeStatusKind.pending => (WigopeColors.warningBg, WigopeColors.warning),
      WigopeStatusKind.failed => (WigopeColors.errorBg, WigopeColors.error),
      WigopeStatusKind.info => (WigopeColors.infoBg, WigopeColors.info),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Text(
        label,
        style: WigopeText.caption.copyWith(color: fg, letterSpacing: 0.04 * 11),
      ),
    );
  }
}
