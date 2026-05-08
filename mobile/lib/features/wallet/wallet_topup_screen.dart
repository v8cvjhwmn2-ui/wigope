import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/router/router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/decoration/grid_pattern.dart';

class WalletTopupScreen extends ConsumerStatefulWidget {
  const WalletTopupScreen({super.key});

  @override
  ConsumerState<WalletTopupScreen> createState() => _WalletTopupScreenState();
}

class _WalletTopupScreenState extends ConsumerState<WalletTopupScreen> {
  final _amountCtrl = TextEditingController();
  int _amount = 0;
  bool _loading = false;

  static const _quickAmounts = [100, 500, 1000, 2000, 5000, 10000];
  static const _bonuses = [
    _DepositBonus(100, 'Get additional bonus of ₹1 to ₹10'),
    _DepositBonus(500, 'Get additional bonus of ₹5 to ₹50'),
    _DepositBonus(1000, 'Get additional bonus of ₹10 to ₹100'),
    _DepositBonus(2000, 'Get additional bonus of ₹2 to ₹20'),
    _DepositBonus(5000, 'Get additional bonus of ₹5 to ₹50'),
    _DepositBonus(10000, 'Get additional bonus of ₹10 to ₹100'),
  ];

  @override
  void dispose() {
    _amountCtrl.dispose();
    super.dispose();
  }

  void _setAmount(int amount) {
    setState(() => _amount = amount);
    _amountCtrl.text = amount == 0 ? '' : amount.toString();
  }

  Future<void> _makePayment() async {
    if (_amount <= 0 || _loading) return;
    context.push('${AppRoutes.walletPaymentProcessing}?amount=$_amount');
  }

  @override
  Widget build(BuildContext context) {
    final enabled = _amount > 0 && !_loading;
    return Scaffold(
      backgroundColor: WigopeColors.surfaceBase,
      appBar: AppBar(
        backgroundColor: WigopeColors.surfaceBase,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leadingWidth: 82,
        toolbarHeight: 86,
        leading: Padding(
          padding: const EdgeInsets.only(left: 18),
          child: _BackButton(onTap: () => context.pop()),
        ),
        titleSpacing: 0,
        title: Text(
          'Wallet Topup',
          style: WigopeText.h1.copyWith(
            fontSize: 22,
            fontWeight: FontWeight.w800,
          ),
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: WigopeColors.borderSoft),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _AmountPanel(
                  controller: _amountCtrl,
                  amount: _amount,
                  onChanged: (value) {
                    final parsed = int.tryParse(value) ?? 0;
                    setState(() => _amount = parsed);
                  },
                ),
                if (_amount > 0) _OfferAppliedStrip(amount: _amount),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        height: 36,
                        child: ListView.separated(
                          padding: EdgeInsets.zero,
                          scrollDirection: Axis.horizontal,
                          itemCount: _quickAmounts.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: 10),
                          itemBuilder: (_, i) {
                            final amount = _quickAmounts[i];
                            return _AmountChip(
                              amount: amount,
                              selected: amount == _amount,
                              onTap: () => _setAmount(amount),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 14),
                      _TopupHero(
                        onAdd2000: () => _setAmount(2000),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'More Deposit Bonuses',
                        style: WigopeText.h2.copyWith(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Column(
                        children: [
                          for (final bonus in _bonuses) ...[
                            _BonusTile(
                              bonus: bonus,
                              active: _amount >= bonus.amount,
                              onTap: () => _setAmount(bonus.amount),
                            ),
                            const SizedBox(height: 10),
                          ],
                        ],
                      ),
                      const SizedBox(height: 84),
                    ],
                  ),
                ),
              ],
            ),
          ),
          _BottomPayBar(
            enabled: enabled,
            loading: _loading,
            onTap: _makePayment,
          ),
        ],
      ),
    );
  }
}

class _BackButton extends StatelessWidget {
  const _BackButton({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            color: WigopeColors.infoBg,
            borderRadius: BorderRadius.circular(18),
          ),
          child: const Icon(
            PhosphorIconsBold.arrowLeft,
            color: WigopeColors.navy900,
            size: 25,
          ),
        ),
      ),
    );
  }
}

class _AmountPanel extends StatelessWidget {
  const _AmountPanel({
    required this.controller,
    required this.amount,
    required this.onChanged,
  });

  final TextEditingController controller;
  final int amount;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 18),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEFE4),
        border: const Border(
          bottom: BorderSide(color: Color(0xFFFFD8BE)),
        ),
      ),
      child: GridPatternBackground(
        color: WigopeColors.orange600,
        opacity: 0.035,
        spacing: 18,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    PhosphorIconsBold.wallet,
                    color: WigopeColors.orange600,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Wallet Topup',
                  style: WigopeText.caption.copyWith(
                    color: WigopeColors.orange600,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Enter amount',
              style: WigopeText.h3.copyWith(
                color: WigopeColors.navy900,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 9),
            TextField(
              controller: controller,
              autofocus: true,
              keyboardType: TextInputType.number,
              cursorColor: WigopeColors.orange600,
              cursorWidth: 2.4,
              cursorHeight: 48,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(6),
              ],
              onChanged: onChanged,
              style: WigopeText.amount(
                43,
                w: FontWeight.w900,
                color: WigopeColors.navy900,
              ),
              decoration: InputDecoration(
                isDense: true,
                isCollapsed: true,
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: EdgeInsets.zero,
                prefixText: '₹',
                prefixStyle: WigopeText.amount(
                  43,
                  w: FontWeight.w900,
                  color: WigopeColors.textTertiary,
                ),
                hintText: '0',
                hintStyle: WigopeText.amount(
                  43,
                  w: FontWeight.w900,
                  color: WigopeColors.textTertiary,
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              amount > 0 ? _amountWords(amount) : 'Enter a topup amount',
              style: WigopeText.bodyS.copyWith(
                color: amount > 0
                    ? WigopeColors.navy900
                    : WigopeColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(
                  PhosphorIconsRegular.shieldCheck,
                  size: 14,
                  color: WigopeColors.success,
                ),
                const SizedBox(width: 6),
                Text(
                  'Secure wallet payment',
                  style: WigopeText.caption.copyWith(
                    color: WigopeColors.textSecondary,
                    letterSpacing: 0,
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

String _amountWords(int amount) {
  const names = {
    100: 'One Hundred Rupees',
    500: 'Five Hundred Rupees',
    1000: 'One Thousand Rupees',
    2000: 'Two Thousand Rupees',
    5000: 'Five Thousand Rupees',
    10000: 'Ten Thousand Rupees',
  };
  return names[amount] ?? '₹$amount Rupees';
}

class _OfferAppliedStrip extends StatelessWidget {
  const _OfferAppliedStrip({required this.amount});

  final int amount;

  @override
  Widget build(BuildContext context) {
    final copy =
        'Offer Applied! You will get extra ${_bonusRange(amount)} on this transaction';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 11, 18, 11),
      color: const Color(0xFF18B85B),
      child: Row(
        children: [
          Container(
            width: 26,
            height: 26,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.95),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              PhosphorIconsBold.sealCheck,
              color: Color(0xFF18B85B),
              size: 17,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              copy,
              style: WigopeText.bodyS.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String _bonusRange(int amount) {
  if (amount >= 10000) return '₹10 - ₹100';
  if (amount >= 5000) return '₹5 - ₹50';
  if (amount >= 2000) return '₹2 - ₹20';
  if (amount >= 1000) return '₹10 - ₹100';
  if (amount >= 500) return '₹5 - ₹50';
  return '₹1 - ₹10';
}

class _AmountChip extends StatelessWidget {
  const _AmountChip({
    required this.amount,
    required this.selected,
    required this.onTap,
  });

  final int amount;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? WigopeColors.orange600 : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: selected ? WigopeColors.orange600 : WigopeColors.info,
            width: 1.2,
          ),
        ),
        child: Text(
          '₹$amount',
          style: WigopeText.bodyStrong.copyWith(
            color: selected ? Colors.white : WigopeColors.info,
            fontWeight: FontWeight.w800,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class _TopupHero extends StatelessWidget {
  const _TopupHero({required this.onAdd2000});

  final VoidCallback onAdd2000;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 142,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFF97316), Color(0xFF0A4AD8)],
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x220A4AD8),
            blurRadius: 22,
            offset: Offset(0, 10),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          Positioned.fill(
            child: GridPatternBackground(
              color: Colors.white,
              opacity: 0.04,
              spacing: 18,
              child: const SizedBox.expand(),
            ),
          ),
          Positioned(
            right: -50,
            bottom: -54,
            child: Container(
              width: 168,
              height: 168,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF082B78).withOpacity(0.55),
              ),
            ),
          ),
          Positioned(
            right: 20,
            bottom: 30,
            child: Column(
              children: [
                Text(
                  'X2',
                  style: WigopeText.amount(
                    31,
                    w: FontWeight.w900,
                    color: const Color(0xFFFFD43B),
                  ),
                ),
                Text(
                  'Bonus',
                  style: WigopeText.bodyS.copyWith(
                    color: Colors.white,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 16, 112, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Add More & Earn More',
                  style: WigopeText.h1.copyWith(
                    color: Colors.white,
                    fontSize: 21,
                    fontWeight: FontWeight.w900,
                    height: 1.08,
                  ),
                ),
                const SizedBox(height: 7),
                Text(
                  'Get additional bonus up to twice of the topup amount when you add ₹2000 or more',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: WigopeText.body.copyWith(
                    fontSize: 13,
                    color: Colors.white.withOpacity(0.94),
                    height: 1.28,
                  ),
                ),
                const Spacer(),
                InkWell(
                  onTap: onAdd2000,
                  borderRadius: BorderRadius.circular(999),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      'Add ₹2000',
                      style: WigopeText.bodyS.copyWith(
                        color: WigopeColors.navy900,
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BonusTile extends StatelessWidget {
  const _BonusTile({
    required this.bonus,
    required this.active,
    required this.onTap,
  });

  final _DepositBonus bonus;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.fromLTRB(12, 11, 12, 11),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: active ? WigopeColors.orange400 : WigopeColors.borderSoft,
            width: active ? 1.4 : 1,
          ),
          boxShadow: const [
            BoxShadow(
              color: Color(0x080A1628),
              blurRadius: 12,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: const BoxDecoration(
                color: WigopeColors.infoBg,
                shape: BoxShape.circle,
              ),
              child: Icon(
                PhosphorIconsBold.gift,
                color: active ? WigopeColors.orange600 : WigopeColors.info,
                size: 23,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Add ₹${bonus.amount} or more',
                    style: WigopeText.h3.copyWith(
                      fontSize: 15.5,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    bonus.subtitle,
                    style: WigopeText.bodyS.copyWith(
                      color: WigopeColors.navy800,
                      fontSize: 12.2,
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

class _BottomPayBar extends StatelessWidget {
  const _BottomPayBar({
    required this.enabled,
    required this.loading,
    required this.onTap,
  });

  final bool enabled;
  final bool loading;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 14, 18, 18),
      decoration: const BoxDecoration(
        color: WigopeColors.surfaceBase,
        border: Border(top: BorderSide(color: WigopeColors.borderSoft)),
      ),
      child: SafeArea(
        top: false,
        child: InkWell(
          onTap: enabled ? onTap : null,
          borderRadius: BorderRadius.circular(16),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            height: 58,
            decoration: BoxDecoration(
              gradient: enabled ? WigopeColors.gradOrange : null,
              color: enabled ? null : const Color(0xFF8FB6FF),
              borderRadius: BorderRadius.circular(16),
              boxShadow: enabled
                  ? [
                      BoxShadow(
                        color: WigopeColors.orange600.withOpacity(0.25),
                        blurRadius: 18,
                        offset: const Offset(0, 7),
                      ),
                    ]
                  : null,
            ),
            child: Center(
              child: loading
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.3,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      'Make Payment',
                      style: WigopeText.h3.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

class WalletPaymentProcessingScreen extends StatefulWidget {
  const WalletPaymentProcessingScreen({super.key, required this.amount});

  final int amount;

  @override
  State<WalletPaymentProcessingScreen> createState() =>
      _WalletPaymentProcessingScreenState();
}

class _WalletPaymentProcessingScreenState
    extends State<WalletPaymentProcessingScreen> {
  String? _selected;

  static const _apps = [
    WigopePaymentMethod(
      'Google Pay',
      Color(0xFF1A73E8),
      assetPath: 'assets/brands/payment_gpay.jpeg',
      cover: true,
    ),
    WigopePaymentMethod(
      'PhonePe',
      Color(0xFF5F259F),
      assetPath: 'assets/brands/payment_phonepe.png',
      cover: true,
    ),
    WigopePaymentMethod(
      'Paytm',
      Color(0xFF00B9F1),
      assetPath: 'assets/brands/payment_paytm.png',
      cover: true,
    ),
    WigopePaymentMethod(
      'Other UPI App',
      WigopeColors.orange600,
      assetPath: 'assets/brands/payment_upi.png',
      cover: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final selectedMethod = _selected == null
        ? _apps.first
        : _apps.firstWhere((app) => app.label == _selected);
    return Scaffold(
      backgroundColor: WigopeColors.surfaceBase,
      appBar: AppBar(
        backgroundColor: WigopeColors.surfaceBase,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leadingWidth: 82,
        toolbarHeight: 86,
        leading: Padding(
          padding: const EdgeInsets.only(left: 18),
          child: _BackButton(onTap: () => context.pop()),
        ),
        titleSpacing: 0,
        title: Text(
          'Payment Processing',
          style: WigopeText.h1.copyWith(
            fontSize: 21,
            fontWeight: FontWeight.w800,
          ),
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: WigopeColors.borderSoft),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
              children: [
                _PaymentIntroCard(method: selectedMethod),
                const SizedBox(height: 16),
                const _PaymentStatusCard(),
                const SizedBox(height: 16),
                _PaymentAppsCard(
                  apps: _apps,
                  selected: _selected,
                  onSelected: (label) => setState(() => _selected = label),
                ),
              ],
            ),
          ),
          if (_selected != null)
            _RetryPaymentBar(
              amount: widget.amount,
              method: selectedMethod.label,
            ),
        ],
      ),
    );
  }
}

class _PaymentIntroCard extends StatelessWidget {
  const _PaymentIntroCard({required this.method});

  final WigopePaymentMethod method;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: _processingCardDecoration(),
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 18, 18, 18),
        child: Row(
          children: [
            _PaymentLogo(method: method, size: 72),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Complete Your Payment',
                    style: WigopeText.h2.copyWith(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Select a preferred UPI app below to continue your wallet topup.',
                    style: WigopeText.bodyS.copyWith(
                      color: WigopeColors.navy800,
                      height: 1.35,
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

class _PaymentStatusCard extends StatelessWidget {
  const _PaymentStatusCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 20),
      decoration: _processingCardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Payment Status',
            style: WigopeText.h2.copyWith(
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: const [
              _StatusDot(done: true),
              Expanded(child: _StatusLine()),
              _StatusDot(active: true),
              Expanded(child: _StatusLine()),
              _StatusDot(),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _StatusLabel('Generating order\nfor payment apps'),
              ),
              Expanded(
                child: _StatusLabel('Select preferred app\nand make payment'),
              ),
              Expanded(
                child: _StatusLabel('Automatically return\nback to Wigope'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatusDot extends StatelessWidget {
  const _StatusDot({this.done = false, this.active = false});

  final bool done;
  final bool active;

  @override
  Widget build(BuildContext context) {
    final color =
        done || active ? const Color(0xFF12B83F) : WigopeColors.borderDefault;
    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: done ? color : Colors.white,
        border: Border.all(color: color, width: 4),
      ),
      child: done
          ? const Icon(
              PhosphorIconsBold.check,
              size: 15,
              color: Colors.white,
            )
          : null,
    );
  }
}

class _StatusLine extends StatelessWidget {
  const _StatusLine();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 2,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      color: const Color(0xFF12B83F),
    );
  }
}

class _StatusLabel extends StatelessWidget {
  const _StatusLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      textAlign: TextAlign.center,
      style: WigopeText.caption.copyWith(
        color: WigopeColors.navy800,
        letterSpacing: 0,
        height: 1.28,
      ),
    );
  }
}

class _PaymentAppsCard extends StatelessWidget {
  const _PaymentAppsCard({
    required this.apps,
    required this.selected,
    required this.onSelected,
  });

  final List<WigopePaymentMethod> apps;
  final String? selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 8),
      decoration: _processingCardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Payment Apps',
            style: WigopeText.h2.copyWith(
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 12),
          for (final app in apps)
            _ProcessingPaymentAppRow(
              method: app,
              selected: selected == app.label,
              onTap: () => onSelected(app.label),
            ),
        ],
      ),
    );
  }
}

class _ProcessingPaymentAppRow extends StatelessWidget {
  const _ProcessingPaymentAppRow({
    required this.method,
    required this.selected,
    required this.onTap,
  });

  final WigopePaymentMethod method;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 9),
        child: Row(
          children: [
            _PaymentLogo(method: method, size: 48),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                method.label,
                style: WigopeText.bodyStrong.copyWith(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: WigopeColors.navy900,
                ),
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 160),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  width: selected ? 6 : 2,
                  color: selected
                      ? WigopeColors.orange600
                      : WigopeColors.borderDefault,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentLogo extends StatelessWidget {
  const _PaymentLogo({required this.method, required this.size});

  final WigopePaymentMethod method;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        border: Border.all(color: WigopeColors.borderSoft),
      ),
      clipBehavior: Clip.antiAlias,
      child: Transform.scale(
        scale: 1.18,
        child: Image.asset(
          method.assetPath,
          fit: method.cover ? BoxFit.cover : BoxFit.contain,
          filterQuality: FilterQuality.high,
        ),
      ),
    );
  }
}

class _RetryPaymentBar extends StatelessWidget {
  const _RetryPaymentBar({required this.amount, required this.method});

  final int amount;
  final String method;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 14, 18, 18),
      decoration: const BoxDecoration(
        color: WigopeColors.surfaceBase,
        border: Border(top: BorderSide(color: WigopeColors.borderSoft)),
      ),
      child: SafeArea(
        top: false,
        child: InkWell(
          onTap: () {},
          borderRadius: BorderRadius.circular(16),
          child: Container(
            height: 56,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: WigopeColors.orange600, width: 1.5),
            ),
            child: Text(
              amount > 0 ? 'Pay ₹$amount with $method' : 'Continue Payment',
              style: WigopeText.h3.copyWith(
                color: WigopeColors.orange600,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

BoxDecoration _processingCardDecoration() {
  return BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(18),
    border: Border.all(color: WigopeColors.borderSoft),
    boxShadow: const [
      BoxShadow(
        color: Color(0x070A1628),
        blurRadius: 16,
        offset: Offset(0, 6),
      ),
    ],
  );
}

Future<WigopePaymentMethod?> showWigopePaymentOptions(BuildContext context) {
  return showModalBottomSheet<WigopePaymentMethod>(
    context: context,
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    builder: (_) => const _PaymentOptionsSheet(),
  );
}

class _PaymentOptionsSheet extends StatelessWidget {
  const _PaymentOptionsSheet();

  static const _methods = [
    WigopePaymentMethod('Paytm', Color(0xFF00B9F1),
        assetPath: 'assets/brands/payment_paytm.png', cover: true),
    WigopePaymentMethod(
      'PhonePe',
      Color(0xFF5F259F),
      assetPath: 'assets/brands/payment_phonepe.png',
      cover: true,
    ),
    WigopePaymentMethod(
      'GPay',
      Color(0xFF1A73E8),
      assetPath: 'assets/brands/payment_gpay.jpeg',
      cover: true,
    ),
    WigopePaymentMethod(
      'Any UPI app',
      WigopeColors.orange600,
      assetPath: 'assets/brands/payment_upi.png',
      cover: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height * 0.72,
      ),
      margin: const EdgeInsets.fromLTRB(12, 12, 12, 10),
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x240A1628),
            blurRadius: 24,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: WigopeColors.borderDefault,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Choose payment app',
                style: WigopeText.h2.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 5),
              Text(
                'Use wallet first. If balance is low, continue with any UPI app.',
                style: WigopeText.bodyS
                    .copyWith(color: WigopeColors.textSecondary),
              ),
              const SizedBox(height: 14),
              for (final method in _methods) ...[
                _PaymentMethodTile(method: method),
                const SizedBox(height: 9),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _PaymentMethodTile extends StatelessWidget {
  const _PaymentMethodTile({required this.method});
  final WigopePaymentMethod method;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => Navigator.of(context).pop(method),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(11),
        decoration: BoxDecoration(
          color: WigopeColors.surfaceSoft,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: WigopeColors.borderSoft),
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: WigopeColors.borderSoft),
              ),
              clipBehavior: Clip.antiAlias,
              child: Image.asset(
                method.assetPath,
                fit: method.cover ? BoxFit.cover : BoxFit.contain,
                filterQuality: FilterQuality.high,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                method.label,
                style: WigopeText.bodyStrong.copyWith(
                  fontWeight: FontWeight.w800,
                  color: WigopeColors.navy900,
                ),
              ),
            ),
            const Icon(
              PhosphorIconsRegular.caretRight,
              color: WigopeColors.textTertiary,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }
}

class WigopePaymentMethod {
  const WigopePaymentMethod(this.label, this.color,
      {required this.assetPath, this.cover = false});
  final String label;
  final Color color;
  final String assetPath;
  final bool cover;
}

class _DepositBonus {
  const _DepositBonus(this.amount, this.subtitle);
  final int amount;
  final String subtitle;
}
