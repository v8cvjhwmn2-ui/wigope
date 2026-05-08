import 'package:flutter/material.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

/// Consistent top bar — white surface, hairline bottom border, navy title.
class WigopeAppBar extends StatelessWidget implements PreferredSizeWidget {
  const WigopeAppBar({
    super.key,
    this.title,
    this.leading,
    this.actions,
    this.showBack = true,
  });

  final String? title;
  final Widget? leading;
  final List<Widget>? actions;
  final bool showBack;

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: WigopeColors.surfaceBase,
        border: Border(bottom: BorderSide(color: WigopeColors.borderSoft)),
      ),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: 56,
          child: Row(
            children: [
              const SizedBox(width: 8),
              if (leading != null)
                leading!
              else if (showBack && Navigator.of(context).canPop())
                IconButton(
                  icon: const Icon(Icons.arrow_back_rounded, color: WigopeColors.navy900),
                  onPressed: () => Navigator.of(context).maybePop(),
                )
              else
                const SizedBox(width: 8),
              Expanded(
                child: title == null
                    ? const SizedBox.shrink()
                    : Text(title!, style: WigopeText.h3),
              ),
              if (actions != null) ...actions!,
              const SizedBox(width: 8),
            ],
          ),
        ),
      ),
    );
  }
}
