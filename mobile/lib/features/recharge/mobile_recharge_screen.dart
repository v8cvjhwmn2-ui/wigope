import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/router/router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import 'data/recharge_repository.dart';

class MobileRechargeScreen extends ConsumerStatefulWidget {
  const MobileRechargeScreen({super.key});

  @override
  ConsumerState<MobileRechargeScreen> createState() =>
      _MobileRechargeScreenState();
}

class _MobileRechargeScreenState extends ConsumerState<MobileRechargeScreen> {
  final _number = TextEditingController();
  final _customAmount = TextEditingController();
  Timer? _debounce;
  OperatorDetection? _detection;
  List<MobilePlan> _plans = const [];
  MobilePlan? _selectedPlan;
  RechargeTransaction? _result;
  bool _detecting = false;
  bool _loadingPlans = false;
  bool _paying = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _number.addListener(_onNumberChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _number.dispose();
    _customAmount.dispose();
    super.dispose();
  }

  void _onNumberChanged() {
    final clean = _number.text.replaceAll(RegExp(r'\D'), '');
    _debounce?.cancel();
    setState(() {
      _error = null;
      if (clean.length != 10) {
        _detection = null;
        _plans = const [];
        _selectedPlan = null;
      }
    });
    if (clean.length == 10) {
      _debounce = Timer(const Duration(milliseconds: 450), () {
        _detectAndLoad(clean);
      });
    }
  }

  Future<void> _detectAndLoad(String number) async {
    setState(() {
      _detecting = true;
      _loadingPlans = true;
      _error = null;
    });
    try {
      final repo = ref.read(rechargeRepositoryProvider);
      final detection = await repo.detectOperator(number);
      final plans = await repo.mobilePlans(
        opid: detection.opid,
        circleCode: detection.circleCode,
      );
      if (!mounted) return;
      setState(() {
        _detection = detection;
        _plans = plans;
        _selectedPlan = plans.isEmpty ? null : plans.first;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Operator detect nahi ho paya. Dobara try karein.');
    } finally {
      if (!mounted) return;
      setState(() {
        _detecting = false;
        _loadingPlans = false;
      });
    }
  }

  Future<void> _pay() async {
    final amount = _selectedPlan?.amount ??
        num.tryParse(_customAmount.text.replaceAll(RegExp(r'\D'), ''));
    final number = _number.text.replaceAll(RegExp(r'\D'), '');
    if (amount == null || amount < 10 || number.length != 10) {
      setState(() => _error = 'Valid number aur amount select karein.');
      return;
    }
    setState(() {
      _paying = true;
      _error = null;
      _result = null;
    });
    try {
      final txn = await ref.read(rechargeRepositoryProvider).rechargeMobile(
            number: number,
            amount: amount,
          );
      if (!mounted) return;
      setState(() => _result = txn);
    } on DioException catch (e) {
      if (!mounted) return;
      final appError = e.error;
      final message = appError is Object ? appError.toString() : null;
      setState(() {
        _error = message?.contains('INSUFFICIENT_WALLET_BALANCE') == true
            ? 'Wallet balance low hai. Add money ya UPI se pay karein.'
            : 'Recharge submit nahi ho paya. Please try again.';
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'Recharge submit nahi ho paya. Please try again.');
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: AppBar(
        backgroundColor: WigopeColors.surfaceBase,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 70,
        leadingWidth: 78,
        leading: Padding(
          padding: const EdgeInsets.only(left: 18),
          child: _BackButton(onTap: () => context.pop()),
        ),
        titleSpacing: 0,
        title: Text(
          'Mobile Recharge',
          style: WigopeText.h2.copyWith(fontWeight: FontWeight.w900),
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: WigopeColors.borderSoft),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 18, 18, 112),
        children: [
          _NumberCard(
            controller: _number,
            detecting: _detecting,
            detection: _detection,
          ),
          const SizedBox(height: 14),
          if (_loadingPlans) const _LoadingPlans(),
          if (!_loadingPlans && _plans.isNotEmpty) ...[
            _PlanSection(
              plans: _plans,
              selected: _selectedPlan,
              onSelect: (plan) {
                setState(() {
                  _selectedPlan = plan;
                  _customAmount.clear();
                });
              },
            ),
            const SizedBox(height: 14),
            _ConfirmCard(
              detection: _detection,
              number: _number.text.replaceAll(RegExp(r'\D'), ''),
              amount: _selectedPlan?.amount,
              customController: _customAmount,
              onCustomFocus: () => setState(() => _selectedPlan = null),
            ),
          ],
          if (_result != null) ...[
            const SizedBox(height: 14),
            _ResultCard(result: _result!),
          ],
          if (_error != null) ...[
            const SizedBox(height: 14),
            _ErrorCard(message: _error!),
          ],
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 16),
          child: SizedBox(
            height: 56,
            child: FilledButton(
              onPressed: _paying || _detection == null ? null : _pay,
              style: FilledButton.styleFrom(
                backgroundColor: WigopeColors.orange500,
                disabledBackgroundColor: const Color(0xFFFFD7BF),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                ),
              ),
              child: _paying
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.4,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      'Pay & Recharge',
                      style: WigopeText.bodyStrong.copyWith(
                        color: Colors.white,
                        fontSize: 16,
                      ),
                    ),
            ),
          ),
        ),
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
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFDCEBFF)),
          ),
          child: const Icon(
            PhosphorIconsBold.arrowLeft,
            color: WigopeColors.navy900,
            size: 22,
          ),
        ),
      ),
    );
  }
}

class _NumberCard extends StatelessWidget {
  const _NumberCard({
    required this.controller,
    required this.detecting,
    required this.detection,
  });

  final TextEditingController controller;
  final bool detecting;
  final OperatorDetection? detection;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Recharge any number',
              style: WigopeText.h2.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),
          Container(
            height: 64,
            decoration: BoxDecoration(
              color: WigopeColors.surfaceBase,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: WigopeColors.borderSoft),
            ),
            child: Row(
              children: [
                const SizedBox(width: 16),
                Text('+91', style: WigopeText.h3.copyWith(fontWeight: FontWeight.w900)),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: controller,
                    maxLength: 10,
                    keyboardType: TextInputType.phone,
                    style: WigopeText.h3.copyWith(fontWeight: FontWeight.w900),
                    decoration: const InputDecoration(
                      counterText: '',
                      border: InputBorder.none,
                      hintText: '98765 43210',
                    ),
                  ),
                ),
                if (detecting)
                  const Padding(
                    padding: EdgeInsets.only(right: 14),
                    child: SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                else
                  const Padding(
                    padding: EdgeInsets.only(right: 14),
                    child: Icon(PhosphorIconsRegular.addressBook,
                        color: WigopeColors.textTertiary),
                  ),
              ],
            ),
          ),
          if (detection != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF3EA),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '${detection!.operatorName} · ${detection!.circleName}',
                style: WigopeText.bodyS.copyWith(
                  color: WigopeColors.orange600,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PlanSection extends StatelessWidget {
  const _PlanSection({
    required this.plans,
    required this.selected,
    required this.onSelect,
  });

  final List<MobilePlan> plans;
  final MobilePlan? selected;
  final ValueChanged<MobilePlan> onSelect;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Select plan',
                  style: WigopeText.h2.copyWith(fontWeight: FontWeight.w900)),
              const Spacer(),
              Text('KwikAPI UAT',
                  style: WigopeText.caption.copyWith(color: WigopeColors.textTertiary)),
            ],
          ),
          const SizedBox(height: 12),
          for (final plan in plans.take(6))
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: InkWell(
                onTap: () => onSelect(plan),
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: selected?.id == plan.id
                        ? const Color(0xFFFFF3EA)
                        : WigopeColors.surfaceBase,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: selected?.id == plan.id
                          ? WigopeColors.orange500
                          : WigopeColors.borderSoft,
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(
                        '₹${plan.amount.round()}',
                        style: WigopeText.h3.copyWith(fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              plan.validity ?? plan.category,
                              style: WigopeText.bodyS.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              plan.description,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: WigopeText.caption.copyWith(
                                color: WigopeColors.textTertiary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ConfirmCard extends StatelessWidget {
  const _ConfirmCard({
    required this.detection,
    required this.number,
    required this.amount,
    required this.customController,
    required this.onCustomFocus,
  });

  final OperatorDetection? detection;
  final String number;
  final num? amount;
  final TextEditingController customController;
  final VoidCallback onCustomFocus;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Confirm recharge',
              style: WigopeText.h2.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),
          _SummaryRow('Operator', detection?.operatorName ?? '-'),
          _SummaryRow('Number', number.isEmpty ? '-' : '+91 $number'),
          _SummaryRow('Amount', amount == null ? 'Custom' : '₹${amount!.round()}'),
          const SizedBox(height: 10),
          TextField(
            controller: customController,
            onTap: onCustomFocus,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              hintText: 'Or enter custom amount',
              prefixText: '₹ ',
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(color: WigopeColors.borderSoft),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(color: WigopeColors.borderSoft),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Text(label, style: WigopeText.bodyS.copyWith(color: WigopeColors.textTertiary)),
          const Spacer(),
          Text(value, style: WigopeText.bodyS.copyWith(fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({required this.result});

  final RechargeTransaction result;

  @override
  Widget build(BuildContext context) {
    final success = result.status == 'success' || result.status == 'SUCCESS';
    final pending = result.status == 'pending' || result.status == 'PENDING';
    final color = success
        ? const Color(0xFF10B981)
        : pending
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444);
    return _Panel(
      child: Row(
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: color.withOpacity(0.12),
            child: Icon(
              success
                  ? PhosphorIconsBold.check
                  : pending
                      ? PhosphorIconsBold.clock
                      : PhosphorIconsBold.warning,
              color: color,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  success
                      ? 'Recharge successful'
                      : pending
                          ? 'Recharge pending'
                          : 'Recharge failed',
                  style: WigopeText.h3.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 3),
                Text(
                  '${result.orderId} · ₹${result.amount.round()}',
                  style: WigopeText.caption.copyWith(color: WigopeColors.textTertiary),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () => context.push(AppRoutes.transactions),
            child: const Text('History'),
          ),
        ],
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F2),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFFCDD5)),
      ),
      child: Text(
        message,
        style: WigopeText.bodyS.copyWith(
          color: const Color(0xFFBE123C),
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _LoadingPlans extends StatelessWidget {
  const _LoadingPlans();

  @override
  Widget build(BuildContext context) {
    return const _Panel(
      child: Center(
        child: Padding(
          padding: EdgeInsets.all(18),
          child: CircularProgressIndicator(),
        ),
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: WigopeColors.borderSoft),
        boxShadow: const [
          BoxShadow(
            color: Color(0x080A1628),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: child,
    );
  }
}
