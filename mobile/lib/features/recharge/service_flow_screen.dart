import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import 'data/recharge_repository.dart';

class ServiceFlowScreen extends ConsumerStatefulWidget {
  const ServiceFlowScreen({
    super.key,
    required this.title,
    required this.service,
  });

  final String title;
  final String service;

  @override
  ConsumerState<ServiceFlowScreen> createState() => _ServiceFlowScreenState();
}

class _ServiceFlowScreenState extends ConsumerState<ServiceFlowScreen> {
  final _id = TextEditingController();
  final _amount = TextEditingController();
  String? _message;
  bool _loading = false;

  @override
  void dispose() {
    _id.dispose();
    _amount.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isBill = !widget.service.contains('dth') &&
        !widget.service.contains('fastag') &&
        !widget.service.contains('voucher');
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
          child: Center(
            child: InkWell(
              onTap: () => context.pop(),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFDCEBFF)),
                ),
                child: const Icon(PhosphorIconsBold.arrowLeft,
                    color: WigopeColors.navy900, size: 22),
              ),
            ),
          ),
        ),
        titleSpacing: 0,
        title: Text(
          widget.title,
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
          _Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isBill ? 'Enter consumer details' : 'Enter recharge details',
                  style: WigopeText.h2.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 12),
                _Field(
                  controller: _id,
                  label: isBill ? 'Consumer / account number' : 'Subscriber ID',
                  icon: isBill
                      ? PhosphorIconsRegular.receipt
                      : PhosphorIconsRegular.identificationCard,
                ),
                const SizedBox(height: 12),
                _Field(
                  controller: _amount,
                  label:
                      isBill ? 'Amount (optional before bill fetch)' : 'Amount',
                  icon: PhosphorIconsRegular.currencyInr,
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: WigopeColors.orange50,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      const Icon(PhosphorIconsBold.lightning,
                          color: WigopeColors.orange600, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'KwikAPI UAT flow connected. Provider/operator mapping will settle from backend catalog.',
                          style: WigopeText.caption.copyWith(
                            color: WigopeColors.navy800,
                            letterSpacing: 0,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (_message != null) ...[
            const SizedBox(height: 14),
            _Panel(
              child: Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: WigopeColors.successBg,
                    child: Icon(PhosphorIconsBold.check,
                        color: WigopeColors.success),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _message!,
                      style: WigopeText.bodyS
                          .copyWith(fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 16),
          child: SizedBox(
            height: 56,
            child: FilledButton(
              onPressed: _loading ? null : () => _submit(isBill),
              style: FilledButton.styleFrom(
                backgroundColor: WigopeColors.orange600,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                ),
              ),
              child: Text(
                _loading
                    ? 'Processing...'
                    : isBill
                        ? 'Fetch Bill'
                        : 'Continue',
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

  Future<void> _submit(bool isBill) async {
    final amount = num.tryParse(_amount.text.trim()) ?? 100;
    final number = _id.text.trim().isEmpty
        ? (isBill ? 'WIGOPE-UAT-001' : '2222222222')
        : _id.text.trim();

    setState(() {
      _loading = true;
      _message = null;
    });

    try {
      final txn = await ref.read(rechargeRepositoryProvider).submitService(
            service: widget.service,
            title: widget.title,
            number: number,
            amount: amount,
          );
      if (!mounted) return;
      setState(() {
        _message =
            '${widget.title} UAT request submitted. Order ${txn.orderId} is ${txn.status.toUpperCase()}.';
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _message =
            '${widget.title} UAT request queued. Backend/provider response pending.';
      });
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }
}

class _Field extends StatelessWidget {
  const _Field({
    required this.controller,
    required this.label,
    required this.icon,
    this.keyboardType,
  });

  final TextEditingController controller;
  final String label;
  final IconData icon;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: WigopeColors.orange600),
        hintText: label,
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
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide:
              const BorderSide(color: WigopeColors.orange600, width: 1.4),
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
