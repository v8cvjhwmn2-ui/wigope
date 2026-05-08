import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';
import 'data/transaction_repository.dart';

class TransactionDetailScreen extends ConsumerWidget {
  const TransactionDetailScreen({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detail = ref.watch(transactionDetailProvider(id));
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: WigopeAppBar(
        title: 'Transaction Detail',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(PhosphorIconsRegular.arrowLeft),
        ),
      ),
      body: detail.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: WigopeColors.orange600),
        ),
        error: (_, __) => const Center(child: Text('Transaction not found')),
        data: (tx) {
          final date = DateFormat('dd MMM yyyy, h:mm a').format(tx.createdAt);
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: WigopeColors.surfaceBase,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: WigopeColors.borderSoft),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '₹${tx.amount.toStringAsFixed(2)}',
                      style: WigopeText.amount(42, w: FontWeight.w800),
                    ),
                    const SizedBox(height: 8),
                    _Status(status: tx.status),
                    const SizedBox(height: 18),
                    _Row('Type', tx.type),
                    _Row('Service', tx.service ?? '-'),
                    _Row('Operator', tx.operator ?? '-'),
                    _Row('Recipient', tx.recipient ?? '-'),
                    _Row('Payment mode', tx.paymentMode),
                    _Row('Gateway order', tx.gatewayOrderId ?? '-'),
                    _Row('Date', date),
                    if (tx.failureReason != null)
                      _Row('Failure', tx.failureReason!),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              ElevatedButton.icon(
                onPressed: () {
                  final uri =
                      ref.read(transactionRepositoryProvider).receiptUri(id);
                  launchUrl(uri, webOnlyWindowName: '_blank');
                },
                icon: const Icon(PhosphorIconsBold.filePdf),
                label: const Text('Open receipt PDF'),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _Status extends StatelessWidget {
  const _Status({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'success' => WigopeColors.success,
      'failed' => WigopeColors.error,
      _ => WigopeColors.orange600,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.toUpperCase(),
        style: WigopeText.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w800,
          letterSpacing: 0,
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style:
                  WigopeText.bodyS.copyWith(color: WigopeColors.textSecondary),
            ),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: WigopeText.bodyS.copyWith(
                color: WigopeColors.navy900,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
