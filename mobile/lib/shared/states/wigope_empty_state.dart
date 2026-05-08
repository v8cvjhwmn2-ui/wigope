import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../buttons/wigope_button.dart';

/// Generic empty state. Always pass [scriptTagline] — that's the brand voice.
/// e.g. "Your recharge history will appear here."
class WigopeEmptyState extends StatelessWidget {
  const WigopeEmptyState({
    super.key,
    required this.title,
    required this.scriptTagline,
    this.icon,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String scriptTagline;
  final IconData? icon;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 96,
              height: 96,
              decoration: const BoxDecoration(
                gradient: WigopeColors.gradOrangeSoft,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon ?? PhosphorIconsDuotone.sparkle,
                size: 44,
                color: WigopeColors.orange600,
              ),
            ),
            const SizedBox(height: 20),
            Text(title, style: WigopeText.h2, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(
              scriptTagline,
              style: WigopeText.script.copyWith(color: WigopeColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 20),
              WigopeButton(
                label: actionLabel!,
                onPressed: onAction,
                fullWidth: false,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
