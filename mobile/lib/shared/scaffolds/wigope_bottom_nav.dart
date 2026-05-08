import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

/// Compact premium dock treatment.
class WigopeBottomNav extends StatelessWidget {
  const WigopeBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: WigopeColors.surfaceBase,
        border: Border(top: BorderSide(color: WigopeColors.borderSoft)),
        boxShadow: [
          BoxShadow(
            color: Color(0x0D0A1628),
            blurRadius: 18,
            offset: Offset(0, -5),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _Tab(
              icon: PhosphorIconsRegular.house,
              label: 'Home',
              selected: currentIndex == 0,
              onTap: () => onTap(0),
            ),
            _CenterGift(selected: currentIndex == 1, onTap: () => onTap(1)),
            _Tab(
              icon: PhosphorIconsRegular.clockCounterClockwise,
              label: 'History',
              selected: currentIndex == 2,
              onTap: () => onTap(2),
            ),
            _Tab(
              icon: PhosphorIconsRegular.user,
              label: 'Profile',
              selected: currentIndex == 3,
              onTap: () => onTap(3),
            ),
          ],
        ),
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? const Color(0xFF1463F3) : const Color(0xFF243244);
    return InkWell(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      borderRadius: BorderRadius.circular(999),
      child: SizedBox(
        width: selected ? 104 : 46,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 2),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 160),
                curve: Curves.easeOutCubic,
                height: 42,
                padding: EdgeInsets.symmetric(horizontal: selected ? 13 : 0),
                decoration: BoxDecoration(
                  color:
                      selected ? const Color(0xFFEAF4FF) : Colors.transparent,
                  borderRadius: BorderRadius.circular(999),
                  border: selected
                      ? Border.all(color: const Color(0xFFD8EAFF))
                      : null,
                  boxShadow: selected
                      ? const [
                          BoxShadow(
                            color: Color(0x140F62FE),
                            blurRadius: 10,
                            offset: Offset(0, 5),
                          ),
                        ]
                      : null,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(icon, size: 23, color: color),
                    if (selected) ...[
                      const SizedBox(width: 7),
                      Text(
                        label,
                        style: WigopeText.caption.copyWith(
                          color: color,
                          letterSpacing: 0,
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CenterGift extends StatelessWidget {
  const _CenterGift({required this.selected, required this.onTap});
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        onTap();
      },
      child: Container(
        width: 58,
        height: 50,
        decoration: BoxDecoration(
          gradient: WigopeColors.gradOrange,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFFFC39A)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x28F97316),
              blurRadius: 14,
              offset: Offset(0, 6),
            ),
          ],
        ),
        child:
            const Icon(PhosphorIconsBold.gift, size: 27, color: Colors.white),
      ),
    );
  }
}
