import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';
import 'data/kyc_repository.dart';

class KycScreen extends ConsumerStatefulWidget {
  const KycScreen({super.key});

  @override
  ConsumerState<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends ConsumerState<KycScreen> {
  final _pan = TextEditingController();
  final _aadhaar = TextEditingController();
  final _name = TextEditingController();
  final _address = TextEditingController();
  bool _loading = false;
  String? _message;

  @override
  void dispose() {
    _pan.dispose();
    _aadhaar.dispose();
    _name.dispose();
    _address.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      await ref.read(kycRepositoryProvider).submit(
            pan: _pan.text.trim(),
            aadhaarLast4: _aadhaar.text.trim(),
            aadhaarName: _name.text.trim(),
            address: _address.text.trim(),
            ocrConfidence: 0.82,
          );
      ref.invalidate(kycStatusProvider);
      if (!mounted) return;
      setState(() => _message = 'KYC submitted. Admin approval pending.');
    } catch (_) {
      if (!mounted) return;
      setState(() => _message =
          'KYC submit nahi ho paya. PAN/Aadhaar details check karein.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = ref.watch(kycStatusProvider);
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: const WigopeAppBar(title: 'KYC Verification'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 110),
        children: [
          _StatusCard(status: status.valueOrNull?.status ?? 'none'),
          const SizedBox(height: 14),
          _Card(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('PAN + Aadhaar',
                    style: WigopeText.h2.copyWith(fontWeight: FontWeight.w900)),
                const SizedBox(height: 6),
                Text(
                  'Enter your PAN and Aadhaar details securely. OCR scan will be enabled from the Android ML Kit module.',
                  style: WigopeText.bodyS,
                ),
                const SizedBox(height: 14),
                _Field(
                    controller: _pan,
                    label: 'PAN number',
                    icon: PhosphorIconsRegular.identificationCard),
                const SizedBox(height: 12),
                _Field(
                  controller: _aadhaar,
                  label: 'Aadhaar last 4 digits',
                  icon: PhosphorIconsRegular.fingerprint,
                  keyboardType: TextInputType.number,
                  maxLength: 4,
                ),
                const SizedBox(height: 12),
                _Field(
                    controller: _name,
                    label: 'Name as per Aadhaar',
                    icon: PhosphorIconsRegular.user),
                const SizedBox(height: 12),
                _Field(
                    controller: _address,
                    label: 'Address',
                    icon: PhosphorIconsRegular.mapPin),
              ],
            ),
          ),
          if (_message != null) ...[
            const SizedBox(height: 14),
            _InfoStrip(message: _message!),
          ],
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
          child: SizedBox(
            height: 56,
            child: FilledButton(
              onPressed: _loading ? null : _submit,
              style: FilledButton.styleFrom(
                backgroundColor: WigopeColors.orange600,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18)),
              ),
              child: Text(
                _loading ? 'Submitting...' : 'Submit KYC',
                style: WigopeText.bodyStrong
                    .copyWith(color: Colors.white, fontSize: 16),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'verified' || 'approved' => WigopeColors.success,
      'pending' => WigopeColors.warning,
      'rejected' => WigopeColors.error,
      _ => WigopeColors.orange600,
    };
    return _Card(
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: color.withOpacity(0.12),
            child: Icon(PhosphorIconsBold.shieldCheck, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('KYC status', style: WigopeText.caption),
                Text(status.toUpperCase(),
                    style: WigopeText.h3.copyWith(fontWeight: FontWeight.w900)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({
    required this.controller,
    required this.label,
    required this.icon,
    this.keyboardType,
    this.maxLength,
  });

  final TextEditingController controller;
  final String label;
  final IconData icon;
  final TextInputType? keyboardType;
  final int? maxLength;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLength: maxLength,
      textCapitalization: TextCapitalization.characters,
      decoration: InputDecoration(
        counterText: '',
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
          borderSide:
              const BorderSide(color: WigopeColors.orange600, width: 1.4),
        ),
      ),
    );
  }
}

class _InfoStrip extends StatelessWidget {
  const _InfoStrip({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: WigopeColors.infoBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFD7E7FF)),
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
