import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../buttons/wigope_button.dart';

/// Every error path in the app should land here — never a raw red banner.
class WigopeErrorState extends StatelessWidget {
  const WigopeErrorState({
    super.key,
    this.title = 'Something went wrong',
    this.message = "We couldn't reach our servers. Please try again.",
    this.onRetry,
  });

  final String title;
  final String message;
  final VoidCallback? onRetry;

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
              decoration: BoxDecoration(
                color: WigopeColors.errorBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                PhosphorIconsDuotone.warningCircle,
                size: 48,
                color: WigopeColors.error,
              ),
            ),
            const SizedBox(height: 20),
            Text(title, style: WigopeText.h2, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(message, style: WigopeText.bodyS, textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: 20),
              WigopeButton(label: 'Try again', onPressed: onRetry, fullWidth: false),
            ],
          ],
        ),
      ),
    );
  }
}
