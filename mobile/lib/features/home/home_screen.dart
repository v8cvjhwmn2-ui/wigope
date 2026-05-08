import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/router/router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/branding/wigope_logo.dart';
import '../../shared/cards/wigope_footer.dart';
import '../../shared/cards/wigope_tier_badge.dart';
import '../../shared/decoration/grid_pattern.dart';
import '../../shared/decoration/shine_sweep.dart';
import '../rewards/hubble_sdk.dart';
import '../notifications/data/notification_repository.dart';
import '../wallet/data/wallet_repository.dart';

/// Home tab. Light surface, orange-soft wallet hero, services grid,
/// reward offers, referral banner, trust footer.
///
/// All grids use `mainAxisExtent` instead of aspect ratios — this is what
/// fixed the overflow seen on narrow Android devices in v0.1.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({
    super.key,
    this.userName = 'Keshav',
    this.mobile = '+91 9568654684',
  });

  final String userName;
  final String mobile;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wallet = ref.watch(walletSummaryProvider);
    return Container(
      color: WigopeColors.surfaceSoft,
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
          children: [
            _BrandHeader(),
            const SizedBox(height: 14),
            _Greeting(userName: userName, mobile: mobile),
            const SizedBox(height: 14),
            const _WelcomeBonusCard(),
            const SizedBox(height: 14),
            _WalletCard(
              balance: wallet.valueOrNull?.balance ?? 0,
              loading: wallet.isLoading,
              onRefresh: () => ref.refresh(walletSummaryProvider.future),
            ),
            const SizedBox(height: 16),
            const _TopServicesBox(),
            const SizedBox(height: 14),
            const _ReferralSlider(),
            const SizedBox(height: 14),
            const _RechargeBillsPanel(),
            const SizedBox(height: 16),
            const _GiftCardsBox(),
            const SizedBox(height: 16),
            const _OttGiftCardsBox(),
            const SizedBox(height: 16),
            const _ReferralBonusCard(),
            const WigopeFooter(),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand header — small wordmark left, notification on right
// ─────────────────────────────────────────────────────────────────────────────

class _BrandHeader extends ConsumerWidget {
  const _BrandHeader();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unread = ref.watch(unreadNotificationCountProvider).valueOrNull ?? 0;
    return Row(
      children: [
        const WigopeLogo.full(height: 26),
        const Spacer(),
        _IconBubble(
          icon: PhosphorIconsRegular.bell,
          onTap: () => context.push(AppRoutes.notifications),
          dot: unread > 0,
        ),
      ],
    );
  }
}

class _IconBubble extends StatelessWidget {
  const _IconBubble(
      {required this.icon, required this.onTap, this.dot = false});
  final IconData icon;
  final VoidCallback onTap;
  final bool dot;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: WigopeColors.surfaceCard,
              shape: BoxShape.circle,
              border: Border.all(color: WigopeColors.borderSoft),
            ),
            alignment: Alignment.center,
            child: Icon(icon, size: 20, color: WigopeColors.navy900),
          ),
          if (dot)
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: WigopeColors.orange600,
                  shape: BoxShape.circle,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Greeting strip
// ─────────────────────────────────────────────────────────────────────────────

class _Greeting extends StatelessWidget {
  const _Greeting({required this.userName, required this.mobile});
  final String userName;
  final String mobile;

  @override
  Widget build(BuildContext context) {
    final initials = userName.trim().substring(0, 1).toUpperCase();
    return Row(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: const BoxDecoration(
            gradient: WigopeColors.gradOrange,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            initials,
            style: WigopeText.h2.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Flexible(
                  child: Text(
                    'Good morning, $userName',
                    overflow: TextOverflow.ellipsis,
                    style: WigopeText.h3.copyWith(fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(width: 8),
                const WigopeTierBadge(tier: WigopeTier.gold),
              ]),
              const SizedBox(height: 2),
              Text(mobile,
                  style: WigopeText.bodyS
                      .copyWith(color: WigopeColors.textSecondary)),
            ],
          ),
        ),
      ],
    );
  }
}

class _WelcomeBonusCard extends StatelessWidget {
  const _WelcomeBonusCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 15, 16, 15),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF09182A),
            Color(0xFF13294A),
            Color(0xFFFA7116),
          ],
          stops: [0, 0.68, 1],
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: const [
          BoxShadow(
            color: Color(0x2B0A1628),
            blurRadius: 24,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: GridPatternBackground(
        color: Colors.white,
        opacity: 0.035,
        spacing: 18,
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.14),
                borderRadius: BorderRadius.circular(17),
                border: Border.all(color: Colors.white.withOpacity(0.18)),
              ),
              child: const Icon(
                PhosphorIconsBold.sparkle,
                color: Colors.white,
                size: 26,
              ),
            ),
            const SizedBox(width: 13),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome bonus · upto ₹200',
                    maxLines: 2,
                    overflow: TextOverflow.visible,
                    style: WigopeText.h3.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Cashback on your first successful recharge.',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: WigopeText.bodyS.copyWith(
                      color: const Color(0xFFE3E9F5),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Wallet hero
// ─────────────────────────────────────────────────────────────────────────────

class _WalletCard extends StatefulWidget {
  const _WalletCard({
    required this.balance,
    required this.loading,
    required this.onRefresh,
  });

  final num balance;
  final bool loading;
  final Future<void> Function() onRefresh;

  @override
  State<_WalletCard> createState() => _WalletCardState();
}

class _WalletCardState extends State<_WalletCard> {
  Timer? _autoRefreshTimer;
  bool _refreshing = false;
  int _refreshCount = 0;

  @override
  void initState() {
    super.initState();
    _autoRefreshTimer = Timer.periodic(
      const Duration(seconds: 15),
      (_) {
        _refreshBalance();
      },
    );
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _refreshBalance() async {
    if (_refreshing || !mounted) return;
    setState(() => _refreshing = true);
    await widget.onRefresh();
    if (!mounted) return;
    setState(() {
      _refreshing = false;
      _refreshCount++;
    });
  }

  @override
  Widget build(BuildContext context) {
    final refreshText = _refreshing
        ? 'Refreshing balance'
        : widget.loading
            ? 'Loading wallet'
            : _refreshCount == 0
                ? 'Auto refresh on'
                : 'Refreshed just now';
    final rupees = widget.balance.floor();
    final paise = ((widget.balance - rupees) * 100).round().abs();

    final items = const [
      _WAItem('Add Money', PhosphorIconsRegular.wallet, _WAAction.addMoney),
      _WAItem('Margin List', PhosphorIconsRegular.percent, _WAAction.margin),
      _WAItem('History', PhosphorIconsRegular.clockCounterClockwise,
          _WAAction.history),
    ];

    return ShineSweep(
      borderRadius: BorderRadius.circular(22),
      child: Container(
        decoration: BoxDecoration(
          color: WigopeColors.surfaceCard,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: WigopeColors.borderSoft),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0D0A1628),
              blurRadius: 18,
              offset: Offset(0, 6),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          children: [
            Stack(
              children: [
                Positioned.fill(
                  child: GridPatternBackground(
                    color: WigopeColors.navy900,
                    opacity: 0.035,
                    spacing: 18,
                    child: const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Colors.white, Color(0xFFFFF3EA)],
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: -62,
                  right: -42,
                  child: Container(
                    width: 176,
                    height: 176,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: WigopeColors.orange400.withOpacity(0.22),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 18, 18, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        'AVAILABLE BALANCE',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: WigopeText.caption.copyWith(
                                          color: WigopeColors.navy800,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 1.3,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    _LowBadge(),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                FittedBox(
                                  fit: BoxFit.scaleDown,
                                  alignment: Alignment.centerLeft,
                                  child: Text.rich(
                                    TextSpan(
                                      children: [
                                        TextSpan(
                                          text: '₹$rupees',
                                          style: WigopeText.amount(
                                            48,
                                            w: FontWeight.w800,
                                            color: WigopeColors.navy900,
                                          ),
                                        ),
                                        TextSpan(
                                          text:
                                              '.${paise.toString().padLeft(2, '0')}',
                                          style: WigopeText.amount(
                                            26,
                                            w: FontWeight.w700,
                                            color: WigopeColors.navy700,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          _WalletPlusButton(
                            onTap: () => context.push(AppRoutes.walletTopup),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.86),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              PhosphorIconsRegular.shieldCheck,
                              size: 15,
                              color: WigopeColors.success,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '$refreshText  ·  Secure wallet',
                              overflow: TextOverflow.ellipsis,
                              style: WigopeText.caption.copyWith(
                                color: WigopeColors.textSecondary,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                letterSpacing: 0,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          _AutoRefreshButton(
                            refreshing: _refreshing,
                            onTap: _refreshBalance,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            Container(height: 1, color: WigopeColors.borderSoft),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 14),
              child: Row(
                children: [
                  for (final it in items)
                    Expanded(child: _QuickActionItem(item: it)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LowBadge extends StatelessWidget {
  const _LowBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.84),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        'LOW',
        style: WigopeText.caption.copyWith(
          color: WigopeColors.orange600,
          fontSize: 10,
          fontWeight: FontWeight.w900,
          letterSpacing: 0,
        ),
      ),
    );
  }
}

class _WalletPlusButton extends StatelessWidget {
  const _WalletPlusButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        width: 54,
        height: 54,
        decoration: BoxDecoration(
          gradient: WigopeColors.gradOrange,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: WigopeColors.orange600.withOpacity(0.24),
              blurRadius: 18,
              offset: const Offset(0, 7),
            ),
          ],
        ),
        child: const Icon(
          PhosphorIconsBold.plus,
          color: Colors.white,
          size: 27,
        ),
      ),
    );
  }
}

class _AutoRefreshButton extends StatelessWidget {
  const _AutoRefreshButton({required this.refreshing, required this.onTap});

  final bool refreshing;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: refreshing ? null : onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        height: 32,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.78),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: Colors.white.withOpacity(0.92)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x100A1628),
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            refreshing
                ? const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: WigopeColors.orange600,
                    ),
                  )
                : const Icon(
                    PhosphorIconsBold.arrowsClockwise,
                    size: 15,
                    color: WigopeColors.orange600,
                  ),
            const SizedBox(width: 5),
            Text(
              'Auto',
              style: WigopeText.caption.copyWith(
                color: WigopeColors.navy900,
                fontWeight: FontWeight.w800,
                letterSpacing: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

Future<void> showAddMoneySheet(BuildContext context) async {
  final amount = await showModalBottomSheet<num>(
    context: context,
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    builder: (_) => const _AddMoneySheet(),
  );
  if (amount == null || !context.mounted) return;

  final repo =
      ProviderScope.containerOf(context).read(walletRepositoryProvider);
  final order = await repo.createAddMoneyOrder(amount);
  if (!context.mounted) return;
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: WigopeColors.navy900,
        content: Text(
          order.provider == 'razorpay'
              ? 'Razorpay order ready: ${order.orderId}'
              : 'Mock Razorpay order ready: ${order.orderId}',
          style: WigopeText.bodyS.copyWith(color: Colors.white),
        ),
      ),
    );
  ProviderScope.containerOf(context).invalidate(walletSummaryProvider);
}

class _AddMoneySheet extends StatelessWidget {
  const _AddMoneySheet();

  static const _amounts = [100, 250, 500, 1000];

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 22),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceBase,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: WigopeColors.borderSoft),
        boxShadow: const [
          BoxShadow(
            color: Color(0x220A1628),
            blurRadius: 24,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _PremiumIconShell(
                  color: WigopeColors.orange600,
                  size: 46,
                  radius: 16,
                  child: const Icon(
                    PhosphorIconsBold.wallet,
                    color: WigopeColors.orange600,
                    size: 23,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Add money to wallet',
                    style: WigopeText.h3.copyWith(fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              'Choose an amount. Razorpay order will be created securely from backend.',
              style: WigopeText.bodyS.copyWith(
                color: WigopeColors.textSecondary,
                height: 1.35,
              ),
            ),
            const SizedBox(height: 18),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                for (final amount in _amounts)
                  InkWell(
                    borderRadius: BorderRadius.circular(999),
                    onTap: () => Navigator.of(context).pop(amount),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18, vertical: 12),
                      decoration: BoxDecoration(
                        color: WigopeColors.orange50,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: const Color(0xFFFFD7BF)),
                      ),
                      child: Text(
                        '₹$amount',
                        style: WigopeText.bodyStrong.copyWith(
                          color: WigopeColors.navy900,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

enum _WAAction { addMoney, margin, history }

class _WAItem {
  const _WAItem(this.label, this.icon, this.action);
  final String label;
  final IconData icon;
  final _WAAction action;
}

class _QuickActionItem extends StatelessWidget {
  const _QuickActionItem({required this.item});
  final _WAItem item;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        switch (item.action) {
          case _WAAction.margin:
            context.push(AppRoutes.margin);
            break;
          case _WAAction.addMoney:
            context.push(AppRoutes.walletTopup);
            break;
          case _WAAction.history:
            context.push(AppRoutes.walletHistory);
            break;
        }
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Column(
          children: [
            Icon(
              item.icon,
              size: 26,
              color: WigopeColors.navy900,
            ),
            const SizedBox(height: 8),
            Text(item.label,
                style: WigopeText.caption.copyWith(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0,
                  color: WigopeColors.navy900,
                )),
          ],
        ),
      ),
    );
  }
}

class _TopServicesBox extends StatelessWidget {
  const _TopServicesBox();

  static const _items = [
    _HomeService(
      'Mobile\nRecharge',
      PhosphorIconsDuotone.deviceMobile,
      Color(0xFFF97316),
      asset: 'prepaid_recharges.png',
      badge: '3.8% Off',
    ),
    _HomeService(
      'DTH/D2H\nRecharge',
      PhosphorIconsDuotone.television,
      Color(0xFF2563EB),
      asset: 'dth_d2h_recharges.png',
      badge: '4.1% Off',
    ),
    _HomeService(
      'Electricity\nPayment',
      PhosphorIconsDuotone.lightbulbFilament,
      Color(0xFFF59E0B),
      asset: 'electricity_payments.png',
      badge: '1.5% Off',
    ),
    _HomeService(
      'FASTag\nRecharge',
      PhosphorIconsDuotone.car,
      Color(0xFF10B981),
      asset: 'fastag_recharges.png',
      badge: '2% Off',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 14, 12, 12),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: WigopeColors.borderSoft),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A0A1628),
            blurRadius: 16,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          for (final item in _items)
            Expanded(child: _PrimaryServiceTile(item: item)),
        ],
      ),
    );
  }
}

class _PremiumIconShell extends StatelessWidget {
  const _PremiumIconShell({
    required this.color,
    required this.child,
    this.size = 54,
    this.radius = 17,
  });

  final Color color;
  final Widget child;
  final double size;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: size,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white,
              color.withOpacity(0.13),
              const Color(0xFFF8FBFF),
            ],
            stops: const [0, 0.62, 1],
          ),
          borderRadius: BorderRadius.circular(radius),
          border: Border.all(color: color.withOpacity(0.2)),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.14),
              blurRadius: 14,
              offset: const Offset(0, 7),
            ),
            const BoxShadow(
              color: Color(0x08FFFFFF),
              blurRadius: 3,
              offset: Offset(0, -1),
            ),
          ],
        ),
        child: Stack(
          clipBehavior: Clip.hardEdge,
          alignment: Alignment.center,
          children: [
            Positioned(
              top: size * 0.16,
              left: size * 0.18,
              child: Container(
                width: size * 0.34,
                height: size * 0.08,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.75),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            Positioned(
              right: size * 0.16,
              bottom: size * 0.16,
              child: Container(
                width: size * 0.13,
                height: size * 0.13,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.16),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            child,
          ],
        ),
      ),
    );
  }
}

class _PrimaryServiceTile extends StatelessWidget {
  const _PrimaryServiceTile({required this.item});

  final _HomeService item;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        if (item.asset == 'prepaid_recharges.png') {
          context.push(AppRoutes.mobileRecharge);
          return;
        }
        context.push(_serviceFlowUrl(item));
      },
      borderRadius: BorderRadius.circular(18),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 3),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _ServiceIconWithBadge(item: item),
            const SizedBox(height: 8),
            Text(
              item.label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: WigopeText.caption.copyWith(
                color: WigopeColors.navy900,
                fontWeight: FontWeight.w700,
                fontSize: 12,
                letterSpacing: 0,
                height: 1.08,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ServiceIconWithBadge extends StatelessWidget {
  const _ServiceIconWithBadge({required this.item});

  final _HomeService item;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 68,
      height: 66,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.center,
        children: [
          item.asset == null
              ? _PremiumIconShell(
                  color: item.color,
                  size: 56,
                  radius: 18,
                  child: Icon(
                    item.icon,
                    color: item.color,
                    size: 25,
                  ),
                )
              : _ServiceAssetTile(asset: item.asset!, size: 58, radius: 18),
          if (item.badge != null)
            Positioned(
              top: 0,
              right: -2,
              child: Container(
                height: 19,
                padding: const EdgeInsets.symmetric(horizontal: 7),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFF8A1D), Color(0xFFFF5A0A)],
                  ),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: Colors.white, width: 1.4),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x2AF97316),
                      blurRadius: 8,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Text(
                  item.badge!,
                  style: WigopeText.caption.copyWith(
                    color: Colors.white,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0,
                    height: 1,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ServiceAssetTile extends StatelessWidget {
  const _ServiceAssetTile({
    required this.asset,
    required this.size,
    required this.radius,
  });

  final String asset;
  final double size;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(radius),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0F0A1628),
            blurRadius: 12,
            offset: Offset(0, 5),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Image.asset(
        'assets/services/$asset',
        width: size,
        height: size,
        fit: BoxFit.cover,
        filterQuality: FilterQuality.high,
      ),
    );
  }
}

class _ReferralSlider extends StatelessWidget {
  const _ReferralSlider();

  static const _items = [
    _RewardSlide(
      'Refer',
      'Flat ₹7',
      PhosphorIconsBold.currencyInr,
      Color(0xFFF97316),
    ),
    _RewardSlide(
      'Amazon',
      'Flat 2% Off',
      PhosphorIconsBold.shoppingCart,
      Color(0xFF081B2D),
      assetPath: 'assets/brands/slider_amazon.jpg',
    ),
    _RewardSlide(
      'Flipkart',
      'Flat 1.25% Off',
      PhosphorIconsBold.shoppingCart,
      Color(0xFFFFC400),
      assetPath: 'assets/brands/slider_flipkart.png',
    ),
    _RewardSlide(
      'Myntra',
      'Flat 2% Off',
      PhosphorIconsBold.shoppingCart,
      Color(0xFFFF3F6C),
      assetPath: 'assets/brands/slider_myntra.jpg',
    ),
    _RewardSlide(
      'Gift cards',
      'Rewards',
      PhosphorIconsBold.gift,
      Color(0xFF7C3AED),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 30,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 1),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) => _RewardSlideChip(
          item: _items[i],
          onTap: () {
            if (_items[i].title == 'Refer') {
              const link = 'https://wigope.com/refer/WIGOPE7';
              Clipboard.setData(const ClipboardData(text: link));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('Referral link copied'),
                  behavior: SnackBarBehavior.floating,
                  backgroundColor: WigopeColors.navy900,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              );
              return;
            }
            HubbleSdkLauncher.open(context);
          },
        ),
      ),
    );
  }
}

class _RewardSlideChip extends StatelessWidget {
  const _RewardSlideChip({required this.item, required this.onTap});

  final _RewardSlide item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        width: 144,
        height: 30,
        padding: const EdgeInsets.fromLTRB(7, 3, 10, 3),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FBFF),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: const Color(0xFFE6EFFC)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x080A1628),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 23,
              height: 23,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: item.color.withOpacity(0.18)),
              ),
              clipBehavior: Clip.antiAlias,
              child: item.assetPath == null
                  ? Icon(item.icon, color: item.color, size: 14)
                  : Image.asset(
                      item.assetPath!,
                      fit: BoxFit.cover,
                      filterQuality: FilterQuality.high,
                    ),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: Text.rich(
                TextSpan(
                  children: [
                    TextSpan(
                      text: '${item.title} | ',
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    TextSpan(text: item.value),
                  ],
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: WigopeText.caption.copyWith(
                  color: WigopeColors.navy900,
                  fontWeight: FontWeight.w600,
                  fontSize: 11.2,
                  height: 1,
                  letterSpacing: 0,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReferralBonusCard extends StatelessWidget {
  const _ReferralBonusCard();

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {},
      borderRadius: BorderRadius.circular(22),
      child: Container(
        padding: const EdgeInsets.fromLTRB(18, 16, 12, 16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFFFFFFF),
              Color(0xFFFFF4EC),
              Color(0xFFFFEEE2),
            ],
            stops: [0, 0.56, 1],
          ),
          borderRadius: BorderRadius.circular(22),
          boxShadow: const [
            BoxShadow(
              color: Color(0x120A1628),
              blurRadius: 22,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Introducing Referral Bonus',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: WigopeText.h3.copyWith(
                      color: WigopeColors.navy900,
                      fontSize: 21,
                      fontWeight: FontWeight.w800,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Earn ₹7 fixed per verified invite. Chain rewards unlock as your audience grows.',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: WigopeText.bodyS.copyWith(
                      color: WigopeColors.textSecondary,
                      fontSize: 12.5,
                      height: 1.32,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    height: 38,
                    padding: const EdgeInsets.symmetric(horizontal: 17),
                    decoration: BoxDecoration(
                      gradient: WigopeColors.gradOrange,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x2AF97316),
                          blurRadius: 14,
                          offset: Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Start Now',
                          style: WigopeText.bodyS.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(
                          PhosphorIconsBold.arrowRight,
                          color: Colors.white,
                          size: 17,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 110,
              height: 110,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.62),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: Colors.white.withOpacity(0.9)),
              ),
              clipBehavior: Clip.antiAlias,
              child: Image.asset(
                'assets/illustrations/referral_bonus.jpg',
                fit: BoxFit.contain,
                filterQuality: FilterQuality.high,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GiftCardsBox extends StatelessWidget {
  const _GiftCardsBox();

  static const _offers = [
    _Offer('Flipkart', Color(0xFF2F88C9), 'voucher_flipkart_new.png',
        badge: '1.25%'),
    _Offer('Amazon', Color(0xFF081B2D), 'voucher_amazon_new.png', badge: '2%'),
    _Offer('Myntra', Color(0xFFFF3F6C), 'voucher_myntra_new.png', badge: '2%'),
    _Offer('Domino’s', Color(0xFF20759C), 'voucher_dominos_new.png',
        badge: '10%'),
    _Offer('Swiggy', Color(0xFFFC8019), 'voucher_swiggy_new.png', badge: '3%'),
    _Offer('Zomato', Color(0xFFE23744), 'voucher_zomato_new.png', badge: '1%'),
    _Offer('BigBasket', Color(0xFFA6CE39), 'voucher_bigbasket.png',
        badge: '2%'),
    _Offer('PVR', Color(0xFF6A4D32), 'voucher_pvr.png', badge: '5%'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: WigopeColors.borderSoft),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A0A1628),
            blurRadius: 16,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Text(
                'Gift & Voucher Deals',
                style: WigopeText.h2.copyWith(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const Spacer(),
              _TextPillButton(
                label: 'View all',
                onTap: () => HubbleSdkLauncher.open(context),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GridView.builder(
            padding: EdgeInsets.zero,
            physics: const NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            itemCount: _offers.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              crossAxisSpacing: 12,
              mainAxisSpacing: 17,
              mainAxisExtent: 106,
            ),
            itemBuilder: (_, i) {
              final offer = _offers[i];
              return _CompactGiftOfferTile(
                offer: offer,
                onTap: () => HubbleSdkLauncher.open(context),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _OttGiftCardsBox extends StatelessWidget {
  const _OttGiftCardsBox();

  static const _offers = [
    _Offer('Sony LIV', Color(0xFF7C3AED), 'ott_sonyliv.png', badge: '5%'),
    _Offer('Spotify', Color(0xFF1DB954), 'ott_spotify.png', badge: '3%'),
    _Offer('Hotstar', Color(0xFF082F49), 'ott_hotstar.png', badge: '4%'),
    _Offer('Prime Video', Color(0xFF1E3A5F), 'ott_prime.png', badge: '2%'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: WigopeColors.borderSoft),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A0A1628),
            blurRadius: 16,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Text(
                'OTT Gift Cards',
                style: WigopeText.h2.copyWith(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const Spacer(),
              _TextPillButton(
                label: 'View all',
                onTap: () => HubbleSdkLauncher.open(context),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GridView.builder(
            padding: EdgeInsets.zero,
            physics: const NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            itemCount: _offers.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              crossAxisSpacing: 12,
              mainAxisSpacing: 0,
              mainAxisExtent: 106,
            ),
            itemBuilder: (_, i) {
              final offer = _offers[i];
              return _CompactGiftOfferTile(
                offer: offer,
                onTap: () => HubbleSdkLauncher.open(context),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _CompactGiftOfferTile extends StatelessWidget {
  const _CompactGiftOfferTile({required this.offer, required this.onTap});

  final _Offer offer;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 76,
            height: 76,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Positioned.fill(
                  child: Image.asset(
                    'assets/brands/${offer.tileAsset}',
                    fit: BoxFit.contain,
                    filterQuality: FilterQuality.high,
                  ),
                ),
                if (offer.badge != null)
                  Positioned(
                    top: -2,
                    left: 5,
                    right: 5,
                    child: Container(
                      height: 18,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            offer.color.withOpacity(0.94),
                            const Color(0xFFFF6B12),
                          ],
                        ),
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(16),
                          bottom: Radius.circular(999),
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x240A1628),
                            blurRadius: 5,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        '${offer.badge} Off',
                        style: WigopeText.caption.copyWith(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0,
                          height: 1,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Text(
            offer.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: WigopeText.caption.copyWith(
              color: WigopeColors.navy900,
              fontSize: 12.8,
              fontWeight: FontWeight.w800,
              letterSpacing: 0,
              height: 1.05,
            ),
          ),
        ],
      ),
    );
  }
}

class _RechargeBillsPanel extends StatelessWidget {
  const _RechargeBillsPanel();

  static const _items = [
    _HomeService(
        'Postpaid\nBill', PhosphorIconsDuotone.simCard, Color(0xFF7C3AED),
        asset: 'postpaid_payments.png'),
    _HomeService('LPG\nBooking', PhosphorIconsDuotone.gasCan, Color(0xFFF97316),
        asset: 'gas_cylinder_booking.png'),
    _HomeService('Piped\nGas', PhosphorIconsDuotone.gasPump, Color(0xFFF97316),
        asset: 'gas_payments.png'),
    _HomeService('Water\nBill', PhosphorIconsDuotone.drop, Color(0xFF0EA5E9),
        asset: 'water_payments.png'),
    _HomeService('Insurance\nPayment', PhosphorIconsDuotone.shieldCheck,
        Color(0xFF10B981),
        asset: 'insurance_payments.png'),
    _HomeService(
        'Broadband\nLandline', PhosphorIconsDuotone.wifiHigh, Color(0xFF2563EB),
        asset: 'broadband_landline.png'),
    _HomeService('Credit Card\nPayment', PhosphorIconsDuotone.creditCard,
        Color(0xFF0EA5E9),
        asset: 'credit_card_payment.png'),
    _HomeService('See All', PhosphorIconsDuotone.squaresFour, Color(0xFF2563EB),
        isBbps: true, asset: 'see_all.png'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 15, 14, 12),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: WigopeColors.borderSoft),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A0A1628),
            blurRadius: 16,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Text(
                'Recharge & Bills',
                style: WigopeText.h2.copyWith(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const Spacer(),
              _TextPillButton(
                label: 'View all',
                onTap: () => context.push(AppRoutes.bbpsServices),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GridView.builder(
            padding: EdgeInsets.zero,
            physics: const NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            itemCount: _items.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              crossAxisSpacing: 10,
              mainAxisSpacing: 12,
              mainAxisExtent: 92,
            ),
            itemBuilder: (_, i) => _BillServiceTile(item: _items[i]),
          ),
        ],
      ),
    );
  }
}

class _BillServiceTile extends StatelessWidget {
  const _BillServiceTile({required this.item});

  final _HomeService item;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        if (item.asset == 'prepaid_recharges.png') {
          context.push(AppRoutes.mobileRecharge);
          return;
        }
        if (item.isBbps) {
          context.push(AppRoutes.bbpsServices);
          return;
        }
        context.push(_serviceFlowUrl(item));
      },
      borderRadius: BorderRadius.circular(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          item.asset == null
              ? _PremiumIconShell(
                  color: item.color,
                  size: 52,
                  radius: 16,
                  child: Icon(item.icon, color: item.color, size: 22),
                )
              : _ServiceAssetTile(asset: item.asset!, size: 52, radius: 16),
          const SizedBox(height: 6),
          Flexible(
            child: Text(
              item.label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: WigopeText.caption.copyWith(
                color: WigopeColors.navy900,
                fontWeight: FontWeight.w700,
                fontSize: 11.5,
                letterSpacing: 0,
                height: 1.1,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String _serviceFlowUrl(_HomeService item) {
  final title = item.label.replaceAll('\n', ' ');
  final service = (item.asset ?? title)
      .replaceAll('.png', '')
      .replaceAll(RegExp(r'[^a-zA-Z0-9_]+'), '_')
      .toLowerCase();
  return '${AppRoutes.serviceFlow}?service=$service&title=${Uri.encodeComponent(title)}';
}

class _BbpsMark extends StatelessWidget {
  const _BbpsMark();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 42,
      height: 42,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 6,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                _BbpsDot(color: Color(0xFF2563EB)),
                SizedBox(width: 4),
                _BbpsDot(color: WigopeColors.orange600),
              ],
            ),
          ),
          Positioned(
            top: 16,
            child: Text(
              'BBPS',
              style: WigopeText.caption.copyWith(
                color: WigopeColors.navy900,
                fontSize: 9,
                fontWeight: FontWeight.w900,
                letterSpacing: 0,
              ),
            ),
          ),
          Positioned(
            bottom: 7,
            child: Container(
              width: 22,
              height: 3,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2563EB), WigopeColors.orange600],
                ),
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BbpsDot extends StatelessWidget {
  const _BbpsDot({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 7,
      height: 7,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.26),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
    );
  }
}

class _TextPillButton extends StatelessWidget {
  const _TextPillButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: WigopeColors.orange50,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: WigopeText.bodyS.copyWith(
            color: WigopeColors.orange600,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}

class _HomeService {
  const _HomeService(
    this.label,
    this.icon,
    this.color, {
    this.isBbps = false,
    this.asset,
    this.badge,
  });

  final String label;
  final IconData icon;
  final Color color;
  final bool isBbps;
  final String? asset;
  final String? badge;
}

class _RewardSlide {
  const _RewardSlide(this.title, this.value, this.icon, this.color,
      {this.assetPath});

  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String? assetPath;
}

class _Offer {
  const _Offer(this.name, this.color, this.tileAsset, {this.badge});

  final String name;
  final Color color;
  final String tileAsset;
  final String? badge;
}
