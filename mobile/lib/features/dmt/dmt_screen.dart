import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';
import 'data/dmt_repository.dart';

class DmtScreen extends ConsumerStatefulWidget {
  const DmtScreen({super.key});

  @override
  ConsumerState<DmtScreen> createState() => _DmtScreenState();
}

class _DmtScreenState extends ConsumerState<DmtScreen> {
  final _senderMobile = TextEditingController(text: '9568654684');
  final _senderName = TextEditingController(text: 'Keshav Swami');
  final _beneName = TextEditingController();
  final _account = TextEditingController();
  final _ifsc = TextEditingController();
  final _bank = TextEditingController();
  final _amount = TextEditingController(text: '500');
  bool _loading = false;
  String? _selectedBeneficiary;
  String? _message;

  @override
  void dispose() {
    _senderMobile.dispose();
    _senderName.dispose();
    _beneName.dispose();
    _account.dispose();
    _ifsc.dispose();
    _bank.dispose();
    _amount.dispose();
    super.dispose();
  }

  Future<void> _run(Future<void> Function(DmtRepository repo) task) async {
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      await task(ref.read(dmtRepositoryProvider));
      ref.invalidate(dmtSnapshotProvider);
    } catch (_) {
      if (mounted)
        setState(() => _message = 'DMT request failed. Details check karein.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final snap = ref.watch(dmtSnapshotProvider);
    final data = snap.valueOrNull;
    final beneficiaries = data?.beneficiaries ?? const <DmtBeneficiary>[];
    _selectedBeneficiary ??=
        beneficiaries.isNotEmpty ? beneficiaries.first.id : null;

    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: const WigopeAppBar(title: 'DMT Money Transfer'),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(dmtSnapshotProvider.future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          children: [
            _HeroCard(sender: data?.sender),
            const SizedBox(height: 14),
            _Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Sender register',
                      style:
                          WigopeText.h3.copyWith(fontWeight: FontWeight.w900)),
                  const SizedBox(height: 12),
                  _Field(
                      controller: _senderMobile,
                      label: 'Sender mobile',
                      icon: PhosphorIconsRegular.phone),
                  const SizedBox(height: 10),
                  _Field(
                      controller: _senderName,
                      label: 'Sender name',
                      icon: PhosphorIconsRegular.user),
                  const SizedBox(height: 12),
                  _Button(
                    label: 'Register sender',
                    loading: _loading,
                    onTap: () => _run((repo) async {
                      final sender = await repo.registerSender(
                          mobile: _senderMobile.text, name: _senderName.text);
                      if (mounted)
                        setState(() =>
                            _message = 'Sender ${sender.name} registered.');
                    }),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            _Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Beneficiary',
                      style:
                          WigopeText.h3.copyWith(fontWeight: FontWeight.w900)),
                  const SizedBox(height: 12),
                  _Field(
                      controller: _beneName,
                      label: 'Beneficiary name',
                      icon: PhosphorIconsRegular.userCircle),
                  const SizedBox(height: 10),
                  _Field(
                      controller: _account,
                      label: 'Account number',
                      icon: PhosphorIconsRegular.bank),
                  const SizedBox(height: 10),
                  _Field(
                      controller: _ifsc,
                      label: 'IFSC code',
                      icon: PhosphorIconsRegular.buildings),
                  const SizedBox(height: 10),
                  _Field(
                      controller: _bank,
                      label: 'Bank name optional',
                      icon: PhosphorIconsRegular.creditCard),
                  const SizedBox(height: 12),
                  _Button(
                    label: 'Add beneficiary',
                    loading: _loading,
                    onTap: () => _run((repo) async {
                      final b = await repo.addBeneficiary(
                        name: _beneName.text,
                        accountNumber: _account.text,
                        ifsc: _ifsc.text,
                        bankName: _bank.text,
                      );
                      if (mounted) {
                        setState(() {
                          _selectedBeneficiary = b.id;
                          _message = '${b.name} added as beneficiary.';
                        });
                      }
                    }),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            _Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Transfer',
                      style:
                          WigopeText.h3.copyWith(fontWeight: FontWeight.w900)),
                  const SizedBox(height: 12),
                  if (beneficiaries.isEmpty)
                    Text('Add a beneficiary first.', style: WigopeText.bodyS)
                  else
                    DropdownButtonFormField<String>(
                      value: _selectedBeneficiary,
                      items: beneficiaries
                          .map((b) => DropdownMenuItem(
                                value: b.id,
                                child: Text(
                                    '${b.name} · ${b.accountNumberMasked}'),
                              ))
                          .toList(),
                      onChanged: (v) =>
                          setState(() => _selectedBeneficiary = v),
                      decoration: _inputDecoration(
                          'Select beneficiary', PhosphorIconsRegular.users),
                    ),
                  const SizedBox(height: 10),
                  _Field(
                      controller: _amount,
                      label: 'Amount',
                      icon: PhosphorIconsRegular.currencyInr),
                  const SizedBox(height: 12),
                  _Button(
                    label: 'Transfer money',
                    loading: _loading,
                    onTap: _selectedBeneficiary == null
                        ? null
                        : () => _run((repo) async {
                              final t = await repo.transfer(
                                beneficiaryId: _selectedBeneficiary!,
                                amount: num.tryParse(_amount.text) ?? 0,
                                remarks: 'Wigope DMT UAT',
                              );
                              if (mounted) {
                                setState(() => _message =
                                    'Transfer ${t.orderId} is ${t.status}.');
                              }
                            }),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            _Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Recent transfers',
                      style:
                          WigopeText.h3.copyWith(fontWeight: FontWeight.w900)),
                  const SizedBox(height: 10),
                  if ((data?.transfers ?? const []).isEmpty)
                    Text('No DMT transfers yet.', style: WigopeText.bodyS)
                  else
                    for (final t in data!.transfers)
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(t.beneficiaryName,
                            style: WigopeText.bodyStrong),
                        subtitle: Text('${t.orderId} · ${t.status}',
                            style: WigopeText.caption),
                        trailing:
                            Text('₹${t.amount.round()}', style: WigopeText.h3),
                      ),
                ],
              ),
            ),
            if (_message != null) ...[
              const SizedBox(height: 14),
              _Info(message: _message!),
            ],
          ],
        ),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.sender});
  final DmtSender? sender;

  @override
  Widget build(BuildContext context) {
    final activeSender = sender;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: WigopeColors.gradOrangeSoft,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFFFD8BE)),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 26,
            backgroundColor: Colors.white,
            child: Icon(PhosphorIconsBold.paperPlaneTilt,
                color: WigopeColors.orange600),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Domestic Money Transfer',
                    style: WigopeText.h3.copyWith(fontWeight: FontWeight.w900)),
                const SizedBox(height: 3),
                Text(
                  activeSender == null
                      ? 'Register sender to start transfers.'
                      : '${activeSender.name} · ${activeSender.kycStatus}',
                  style: WigopeText.bodyS,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field(
      {required this.controller, required this.label, required this.icon});
  final TextEditingController controller;
  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return TextField(
        controller: controller, decoration: _inputDecoration(label, icon));
  }
}

InputDecoration _inputDecoration(String label, IconData icon) {
  return InputDecoration(
    prefixIcon: Icon(icon, color: WigopeColors.orange600),
    hintText: label,
    filled: true,
    fillColor: const Color(0xFFF8FAFC),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: WigopeColors.borderSoft),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: WigopeColors.orange600, width: 1.4),
    ),
  );
}

class _Button extends StatelessWidget {
  const _Button(
      {required this.label, required this.loading, required this.onTap});
  final String label;
  final bool loading;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 48,
      child: FilledButton(
        onPressed: loading ? null : onTap,
        style: FilledButton.styleFrom(
          backgroundColor: WigopeColors.orange600,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: Text(loading ? 'Please wait...' : label,
            style: const TextStyle(color: Colors.white)),
      ),
    );
  }
}

class _Info extends StatelessWidget {
  const _Info({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: WigopeColors.successBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFCFF6E4)),
      ),
      child: Text(message,
          style: WigopeText.bodyS.copyWith(fontWeight: FontWeight.w800)),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.child});
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
              color: Color(0x0A0A1628), blurRadius: 16, offset: Offset(0, 4)),
        ],
      ),
      child: child,
    );
  }
}
