import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/buttons/wigope_button.dart';
import '../../shared/cards/wigope_card.dart';
import '../../shared/cards/wigope_chip.dart';
import '../../shared/cards/wigope_service_tile.dart';
import '../../shared/cards/wigope_status_pill.dart';
import '../../shared/inputs/wigope_input.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';
import '../../shared/scaffolds/wigope_bottom_nav.dart';
import '../../shared/sheets/wigope_bottom_sheet.dart';
import '../../shared/states/wigope_empty_state.dart';
import '../../shared/states/wigope_error_state.dart';
import '../../shared/states/wigope_skeleton.dart';
import '../../shared/states/wigope_success_animation.dart';

/// Live catalog of every Wigope widget. Ship-blocked off the production router —
/// reachable only from a long-press on the splash logo (debug builds).
/// Used by design + engineering to verify token compliance per ADR-0002.
class ComponentsScreen extends StatefulWidget {
  const ComponentsScreen({super.key});

  @override
  State<ComponentsScreen> createState() => _ComponentsScreenState();
}

class _ComponentsScreenState extends State<ComponentsScreen> {
  final _input = TextEditingController();
  int _navIndex = 0;
  bool _chipSelected = true;

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: const WigopeAppBar(title: 'Wigope · Component Library'),
      bottomNavigationBar: WigopeBottomNav(
        currentIndex: _navIndex,
        onTap: (i) => setState(() => _navIndex = i),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          _Section('Typography', [
            Text('Recharge & Bills.', style: WigopeText.displayL),
            const SizedBox(height: 4),
            Text('simple. secure. recharge-first.',
                style: WigopeText.script.copyWith(color: WigopeColors.orange600)),
            const SizedBox(height: 12),
            Text('H1 — Recharge any number', style: WigopeText.h1),
            Text('H2 — Choose your plan', style: WigopeText.h2),
            Text('H3 — Confirm payment', style: WigopeText.h3),
            const SizedBox(height: 8),
            Text('Body — Pay smart, earn cashback, every time.', style: WigopeText.body),
            Text('Body S — secondary copy', style: WigopeText.bodyS),
            Text('CAPTION', style: WigopeText.caption),
            const SizedBox(height: 8),
            Text('₹ 1,234.50',
                style: WigopeText.amount(28, color: WigopeColors.navy900)),
          ]),
          _Section('Buttons', [
            WigopeButton(label: 'Send OTP', onPressed: () {}),
            const SizedBox(height: 12),
            WigopeButton(
                label: 'Continue securely',
                onPressed: () {},
                icon: PhosphorIconsRegular.arrowRight),
            const SizedBox(height: 12),
            WigopeButton(
                label: 'Secondary',
                variant: WigopeButtonVariant.secondary,
                onPressed: () {}),
            const SizedBox(height: 12),
            WigopeButton(
                label: 'Tertiary',
                variant: WigopeButtonVariant.tertiary,
                onPressed: () {}),
            const SizedBox(height: 12),
            WigopeButton(label: 'Loading…', loading: true, onPressed: () {}),
            const SizedBox(height: 12),
            WigopeButton(label: 'Disabled', onPressed: null),
          ]),
          _Section('Inputs', [
            WigopeInput(
              controller: _input,
              label: 'MOBILE NUMBER',
              hint: '10-digit number',
              keyboardType: TextInputType.phone,
              maxLength: 10,
              prefix: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 12),
                child: Center(widthFactor: 1, child: Text('+91')),
              ),
            ),
          ]),
          _Section('Chips', [
            Wrap(spacing: 8, runSpacing: 8, children: [
              WigopeChip(
                label: 'Popular',
                selected: _chipSelected,
                onTap: () => setState(() => _chipSelected = true),
              ),
              WigopeChip(
                label: 'Data',
                selected: !_chipSelected,
                onTap: () => setState(() => _chipSelected = false),
              ),
              const WigopeChip(label: 'Unlimited'),
              const WigopeChip(label: 'Topup'),
            ]),
          ]),
          _Section('Cards', [
            WigopeCard(
              child: Row(children: [
                const WigopeSkeleton.circle(size: 40),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Vi Prepaid · 9568XXXXXX', style: WigopeText.bodyStrong),
                    const SizedBox(height: 2),
                    Text('Today, 6:42 PM', style: WigopeText.bodyS),
                  ]),
                ),
                Text('₹ 299', style: WigopeText.amount(15)),
              ]),
            ),
            const SizedBox(height: 12),
            WigopeCard(
              hero: true,
              padding: const EdgeInsets.all(20),
              child: Container(
                decoration: const BoxDecoration(
                  gradient: WigopeColors.gradNavy,
                  borderRadius: BorderRadius.all(Radius.circular(20)),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('WALLET BALANCE',
                      style:
                          WigopeText.caption.copyWith(color: Colors.white70)),
                  const SizedBox(height: 8),
                  Text('₹ 1,250.00',
                      style: WigopeText.amount(32, color: Colors.white)),
                ]),
              ),
            ),
          ]),
          _Section('Service tiles', [
            GridView.count(
              crossAxisCount: 4,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              children: [
                WigopeServiceTile(
                    icon: PhosphorIconsDuotone.deviceMobile,
                    label: 'Mobile',
                    onTap: () {}),
                WigopeServiceTile(
                    icon: PhosphorIconsDuotone.television,
                    label: 'DTH',
                    onTap: () {}),
                WigopeServiceTile(
                    icon: PhosphorIconsDuotone.lightbulbFilament,
                    label: 'Electricity',
                    onTap: () {}),
                WigopeServiceTile(
                    icon: PhosphorIconsDuotone.car,
                    label: 'FASTag',
                    onTap: () {}),
              ],
            ),
          ]),
          _Section('Status pills', [
            Wrap(spacing: 8, runSpacing: 8, children: const [
              WigopeStatusPill(kind: WigopeStatusKind.success, label: 'Success'),
              WigopeStatusPill(kind: WigopeStatusKind.pending, label: 'Pending'),
              WigopeStatusPill(kind: WigopeStatusKind.failed, label: 'Failed'),
              WigopeStatusPill(kind: WigopeStatusKind.info, label: 'Refund'),
            ]),
          ]),
          _Section('Skeletons', [
            const WigopeSkeleton.card(),
            const SizedBox(height: 12),
            Row(children: const [
              WigopeSkeleton.circle(),
              SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  WigopeSkeleton(width: 160),
                  SizedBox(height: 8),
                  WigopeSkeleton(width: 100, height: 12),
                ]),
              ),
            ]),
          ]),
          _Section('Empty / Error states', [
            SizedBox(
              height: 280,
              child: WigopeEmptyState(
                title: 'No transactions yet',
                scriptTagline: 'Your recharge history will appear here.',
                icon: PhosphorIconsDuotone.receipt,
                actionLabel: 'Recharge now',
                onAction: () {},
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 280,
              child: WigopeErrorState(onRetry: () {}),
            ),
          ]),
          _Section('Bottom sheet', [
            WigopeButton(
              label: 'Show plan picker sheet',
              variant: WigopeButtonVariant.secondary,
              onPressed: () => WigopeBottomSheet.show(
                context,
                title: 'Choose a plan',
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    for (final amt in const [199, 299, 399, 499])
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: WigopeCard(
                          onTap: () => Navigator.pop(context, amt),
                          child: Row(children: [
                            Expanded(
                                child: Text('Validity 28 days · 1.5GB/day',
                                    style: WigopeText.bodyStrong)),
                            Text('₹ $amt', style: WigopeText.amount(15)),
                          ]),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ]),
          _Section('Success animation', [
            SizedBox(
              height: 320,
              child: WigopeSuccessAnimation(
                title: 'All done!',
                subtitle: 'Recharge of ₹ 299 successful',
                confetti: true,
              ),
            ),
          ]),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.title, this.children);
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title.toUpperCase(),
              style: WigopeText.caption.copyWith(color: WigopeColors.orange600)),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}
