import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';
import '../../shared/states/wigope_empty_state.dart';
import 'data/wallet_models.dart';
import 'data/wallet_repository.dart';

class WalletHistoryScreen extends ConsumerWidget {
  const WalletHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ledger = ref.watch(walletLedgerProvider);
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: WigopeAppBar(
        title: 'Wallet History',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(PhosphorIconsRegular.arrowLeft),
        ),
      ),
      body: ledger.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: WigopeColors.orange600),
        ),
        error: (_, __) => const WigopeEmptyState(
          icon: PhosphorIconsDuotone.receipt,
          title: 'No wallet activity',
          scriptTagline: 'Your wallet credits and debits will appear here.',
        ),
        data: (items) {
          if (items.isEmpty) {
            return const WigopeEmptyState(
              icon: PhosphorIconsDuotone.receipt,
              title: 'No wallet activity',
              scriptTagline: 'Your wallet credits and debits will appear here.',
            );
          }
          return RefreshIndicator(
            color: WigopeColors.orange600,
            onRefresh: () => ref.refresh(walletLedgerProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              itemBuilder: (_, i) => _LedgerTile(item: items[i]),
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemCount: items.length,
            ),
          );
        },
      ),
    );
  }
}

class _LedgerTile extends StatelessWidget {
  const _LedgerTile({required this.item});

  final WalletLedgerItem item;

  @override
  Widget build(BuildContext context) {
    final credit = item.type == 'credit';
    final date = DateFormat('dd MMM, h:mm a').format(item.createdAt);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceBase,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: WigopeColors.borderSoft),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: credit ? const Color(0xFFEAFBF1) : WigopeColors.orange50,
              borderRadius: BorderRadius.circular(15),
            ),
            child: Icon(
              credit ? PhosphorIconsBold.arrowDown : PhosphorIconsBold.arrowUp,
              color: credit ? WigopeColors.success : WigopeColors.orange600,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.note ?? _label(item.source),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: WigopeText.bodyStrong.copyWith(
                    color: WigopeColors.navy900,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '$date · Balance ₹${item.balanceAfter.toStringAsFixed(2)}',
                  style: WigopeText.caption.copyWith(
                    color: WigopeColors.textSecondary,
                    letterSpacing: 0,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Text(
            '${credit ? '+' : '-'}₹${item.amount.toStringAsFixed(2)}',
            style: WigopeText.bodyStrong.copyWith(
              color: credit ? WigopeColors.success : WigopeColors.navy900,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  String _label(String source) {
    return source
        .split('_')
        .map((part) => part.isEmpty
            ? part
            : '${part[0].toUpperCase()}${part.substring(1)}')
        .join(' ');
  }
}
