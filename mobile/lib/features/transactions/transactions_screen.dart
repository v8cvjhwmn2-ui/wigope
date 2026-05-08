import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/router/router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import 'data/transaction_models.dart';
import 'data/transaction_repository.dart';

class TransactionsScreen extends ConsumerStatefulWidget {
  const TransactionsScreen({super.key, this.showBack = false});

  final bool showBack;

  @override
  ConsumerState<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends ConsumerState<TransactionsScreen> {
  String _range = 'Recent';
  String _category = 'Recharges';
  String _status = 'all';
  DateTime? _pickedDate;

  static const _ranges = [
    _HistoryFilter('Recent', PhosphorIconsRegular.clock),
    _HistoryFilter('Today', PhosphorIconsRegular.calendarBlank),
    _HistoryFilter('Pick Date', PhosphorIconsRegular.calendarBlank),
    _HistoryFilter('Filter', PhosphorIconsRegular.slidersHorizontal),
  ];

  static const _categories = [
    'Recharges',
    'Deposits',
    'Referrals',
    'Complaints',
  ];

  @override
  Widget build(BuildContext context) {
    final transactions = ref.watch(transactionsProvider);
    return Scaffold(
      backgroundColor: WigopeColors.surfaceBase,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _HistoryHeader(showBack: widget.showBack),
            _FilterPanel(
              ranges: _ranges,
              selectedRange: _range,
              rangeLabel: _rangeLabel,
              onRange: _handleRange,
              categories: _categories,
              selectedCategory: _category,
              onCategory: (value) => setState(() => _category = value),
            ),
            Expanded(
              child: transactions.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(
                    color: WigopeColors.orange600,
                  ),
                ),
                error: (_, __) => _HistoryContent(
                  category: _category,
                  items: const [],
                ),
                data: (items) => RefreshIndicator(
                  color: WigopeColors.orange600,
                  onRefresh: () => ref.refresh(transactionsProvider.future),
                  child: _HistoryContent(
                    category: _category,
                    items: _itemsForCategory(_filteredItems(items), _category),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String get _rangeLabel {
    if (_range == 'Pick Date' && _pickedDate != null) {
      return DateFormat('dd MMM').format(_pickedDate!);
    }
    if (_range == 'Filter' && _status != 'all') {
      return _status[0].toUpperCase() + _status.substring(1);
    }
    return _range;
  }

  Future<void> _handleRange(String value) async {
    if (value == 'Pick Date') {
      final selected = await showDatePicker(
        context: context,
        initialDate: _pickedDate ?? DateTime.now(),
        firstDate: DateTime.now().subtract(const Duration(days: 365)),
        lastDate: DateTime.now(),
        builder: (context, child) => Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: WigopeColors.orange600,
              onPrimary: Colors.white,
              onSurface: WigopeColors.navy900,
            ),
          ),
          child: child!,
        ),
      );
      if (selected != null) {
        setState(() {
          _range = 'Pick Date';
          _pickedDate = selected;
          _status = 'all';
        });
      }
      return;
    }

    if (value == 'Filter') {
      final selected = await showModalBottomSheet<String>(
        context: context,
        backgroundColor: Colors.transparent,
        builder: (_) => _StatusFilterSheet(selected: _status),
      );
      if (selected != null) {
        setState(() {
          _range = 'Filter';
          _status = selected;
        });
      }
      return;
    }

    setState(() {
      _range = value;
      _status = 'all';
    });
  }

  List<WigopeTransaction> _filteredItems(List<WigopeTransaction> items) {
    var output = [...items]..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    if (_status != 'all') {
      output = output.where((item) => item.status == _status).toList();
    }

    if (_range == 'Today') {
      final now = DateTime.now();
      output = output.where((item) => _sameDay(item.createdAt, now)).toList();
    }

    if (_range == 'Pick Date' && _pickedDate != null) {
      output = output
          .where((item) => _sameDay(item.createdAt, _pickedDate!))
          .toList();
    }

    return output;
  }

  bool _sameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  List<WigopeTransaction> _itemsForCategory(
    List<WigopeTransaction> items,
    String category,
  ) {
    return switch (category) {
      'Deposits' => items.where((item) => item.type == 'deposit').toList(),
      'Referrals' => items.where((item) => item.type == 'cashback').toList(),
      'Complaints' => const <WigopeTransaction>[],
      _ => items.where((item) => item.type == 'recharge').toList(),
    };
  }
}

class _HistoryHeader extends StatelessWidget {
  const _HistoryHeader({required this.showBack});

  final bool showBack;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 92,
      padding: const EdgeInsets.fromLTRB(20, 14, 16, 12),
      decoration: const BoxDecoration(
        color: WigopeColors.surfaceBase,
        border: Border(bottom: BorderSide(color: WigopeColors.borderSoft)),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: () {
              if (showBack) {
                context.pop();
              } else {
                context.go(AppRoutes.home);
              }
            },
            borderRadius: BorderRadius.circular(18),
            child: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: WigopeColors.infoBg,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFD6E7FF)),
              ),
              child: const Icon(
                PhosphorIconsBold.arrowLeft,
                color: WigopeColors.navy900,
                size: 25,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              'Transaction Histories',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: WigopeText.h1.copyWith(
                fontSize: 21,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterPanel extends StatelessWidget {
  const _FilterPanel({
    required this.ranges,
    required this.selectedRange,
    required this.rangeLabel,
    required this.onRange,
    required this.categories,
    required this.selectedCategory,
    required this.onCategory,
  });

  final List<_HistoryFilter> ranges;
  final String selectedRange;
  final String rangeLabel;
  final ValueChanged<String> onRange;
  final List<String> categories;
  final String selectedCategory;
  final ValueChanged<String> onCategory;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(22),
          bottomRight: Radius.circular(22),
        ),
        boxShadow: [
          BoxShadow(
            color: Color(0x080A1628),
            blurRadius: 14,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          SizedBox(
            height: 40,
            child: Row(
              children: [
                for (var i = 0; i < ranges.length; i++) ...[
                  Expanded(
                    flex: ranges[i].label == 'Pick Date' ? 12 : 10,
                    child: _FilterChipButton(
                      label: ranges[i].label == selectedRange
                          ? rangeLabel
                          : ranges[i].label,
                      icon: ranges[i].icon,
                      selected: ranges[i].label == selectedRange,
                      onTap: () => onRange(ranges[i].label),
                    ),
                  ),
                  if (i != ranges.length - 1) const SizedBox(width: 7),
                ],
              ],
            ),
          ),
          const SizedBox(height: 14),
          Container(
            height: 62,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFFFFBF8),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: WigopeColors.borderSoft),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x080A1628),
                  blurRadius: 12,
                  offset: Offset(0, 5),
                ),
              ],
            ),
            child: Row(
              children: [
                for (var i = 0; i < categories.length; i++) ...[
                  Expanded(
                    child: _CategoryPill(
                      label: categories[i],
                      selected: categories[i] == selectedCategory,
                      onTap: () => onCategory(categories[i]),
                    ),
                  ),
                  if (i != categories.length - 1) const SizedBox(width: 8),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChipButton extends StatelessWidget {
  const _FilterChipButton({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        height: 40,
        padding: const EdgeInsets.symmetric(horizontal: 7),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFFFF0E8) : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: selected ? const Color(0xFFFFB98F) : WigopeColors.borderSoft,
            width: selected ? 1.2 : 1,
          ),
          boxShadow: selected
              ? const [
                  BoxShadow(
                    color: Color(0x16FF6B10),
                    blurRadius: 12,
                    offset: Offset(0, 5),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 16,
              color: selected ? WigopeColors.orange600 : WigopeColors.navy900,
            ),
            const SizedBox(width: 4),
            Flexible(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: WigopeText.caption.copyWith(
                  color:
                      selected ? WigopeColors.orange600 : WigopeColors.navy900,
                  fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                  fontSize: 12.1,
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

class _CategoryPill extends StatelessWidget {
  const _CategoryPill({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? WigopeColors.orange600 : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? WigopeColors.orange600 : WigopeColors.borderSoft,
          ),
          boxShadow: selected
              ? const [
                  BoxShadow(
                    color: Color(0x20FF6B10),
                    blurRadius: 14,
                    offset: Offset(0, 6),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: WigopeText.bodyS.copyWith(
            color: selected ? Colors.white : WigopeColors.navy900,
            fontWeight: selected ? FontWeight.w800 : FontWeight.w700,
            fontSize: 13.8,
          ),
        ),
      ),
    );
  }
}

class _HistoryContent extends StatelessWidget {
  const _HistoryContent({required this.category, required this.items});

  final String category;
  final List<WigopeTransaction> items;

  @override
  Widget build(BuildContext context) {
    final spent = items
        .where((item) => item.type != 'cashback')
        .fold<double>(0, (sum, item) => sum + item.amount);
    final cashback = items
        .where((item) => item.type == 'cashback')
        .fold<double>(0, (sum, item) => sum + item.amount);

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      children: [
        _TotalsStrip(spent: spent, cashback: cashback),
        if (items.isEmpty)
          SizedBox(
            height: MediaQuery.sizeOf(context).height * 0.42,
            child: Center(
              child: Text(
                'No ${category.toLowerCase()} found',
                style: WigopeText.h3.copyWith(
                  fontSize: 17,
                  fontWeight: FontWeight.w500,
                  color: WigopeColors.navy900,
                ),
              ),
            ),
          )
        else
          ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 28),
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemBuilder: (_, i) => _TransactionTile(item: items[i]),
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemCount: items.length,
          ),
      ],
    );
  }
}

class _TotalsStrip extends StatelessWidget {
  const _TotalsStrip({required this.spent, required this.cashback});

  final double spent;
  final double cashback;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      decoration: const BoxDecoration(
        color: Color(0xFFFFF4EC),
        border: Border.symmetric(
          horizontal: BorderSide(color: Color(0xFFFFE1CF)),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _MetricBadge(
            icon: PhosphorIconsBold.arrowUp,
            color: WigopeColors.orange600,
            label: 'Total Spent: ₹${spent.toStringAsFixed(0)}',
          ),
          const SizedBox(width: 12),
          _MetricBadge(
            icon: PhosphorIconsBold.arrowDown,
            color: WigopeColors.success,
            label: 'Total Cashback: ₹${cashback.toStringAsFixed(0)}',
          ),
        ],
      ),
    );
  }
}

class _MetricBadge extends StatelessWidget {
  const _MetricBadge({
    required this.icon,
    required this.color,
    required this.label,
  });

  final IconData icon;
  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Flexible(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            child: Icon(icon, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 7),
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: WigopeText.bodyS.copyWith(
                color: WigopeColors.navy900,
                fontWeight: FontWeight.w800,
                fontSize: 12.2,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TransactionTile extends StatelessWidget {
  const _TransactionTile({required this.item});

  final WigopeTransaction item;

  @override
  Widget build(BuildContext context) {
    final date = DateFormat('dd MMM, h:mm a').format(item.createdAt);
    final color = switch (item.status) {
      'success' => WigopeColors.success,
      'failed' => WigopeColors.error,
      'refunded' => const Color(0xFF2563EB),
      _ => WigopeColors.orange600,
    };
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: () => context.push('${AppRoutes.transactionDetail}/${item.id}'),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: WigopeColors.surfaceBase,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: WigopeColors.borderSoft),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(_icon(item), color: color, size: 22),
            ),
            const SizedBox(width: 11),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _title(item),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: WigopeText.bodyStrong.copyWith(
                      color: WigopeColors.navy900,
                      fontWeight: FontWeight.w800,
                      fontSize: 14.4,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '$date · ${item.status.toUpperCase()}',
                    style: WigopeText.caption.copyWith(
                      color: WigopeColors.textSecondary,
                      letterSpacing: 0,
                      fontSize: 11.4,
                    ),
                  ),
                ],
              ),
            ),
            Text(
              '₹${item.amount.toStringAsFixed(2)}',
              style: WigopeText.bodyStrong.copyWith(
                color: WigopeColors.navy900,
                fontWeight: FontWeight.w800,
                fontSize: 14.6,
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _icon(WigopeTransaction tx) {
    if (tx.type == 'cashback') return PhosphorIconsBold.gift;
    if (tx.type == 'deposit') return PhosphorIconsBold.wallet;
    return PhosphorIconsBold.lightning;
  }

  String _title(WigopeTransaction tx) {
    if (tx.type == 'cashback') return 'Referral cashback credited';
    if (tx.type == 'deposit') return 'Wallet top-up';
    return '${tx.operator ?? 'Recharge'} ${tx.recipient ?? ''}'.trim();
  }
}

class _StatusFilterSheet extends StatelessWidget {
  const _StatusFilterSheet({required this.selected});

  final String selected;

  static const _statuses = [
    ('all', 'All transactions', PhosphorIconsRegular.listBullets),
    ('success', 'Success', PhosphorIconsRegular.checkCircle),
    ('pending', 'Pending', PhosphorIconsRegular.clock),
    ('failed', 'Failed', PhosphorIconsRegular.xCircle),
    ('refunded', 'Refunded', PhosphorIconsRegular.arrowCounterClockwise),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 12, 12, 10),
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 14),
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
              'Filter by status',
              style: WigopeText.h2.copyWith(
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 10),
            for (final status in _statuses)
              InkWell(
                onTap: () => Navigator.of(context).pop(status.$1),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  height: 48,
                  margin: const EdgeInsets.only(top: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: selected == status.$1
                        ? WigopeColors.orange50
                        : WigopeColors.surfaceSoft,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: selected == status.$1
                          ? const Color(0xFFFFC39A)
                          : WigopeColors.borderSoft,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        status.$3,
                        size: 20,
                        color: selected == status.$1
                            ? WigopeColors.orange600
                            : WigopeColors.navy900,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          status.$2,
                          style: WigopeText.bodyS.copyWith(
                            color: WigopeColors.navy900,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      if (selected == status.$1)
                        const Icon(
                          PhosphorIconsBold.check,
                          size: 18,
                          color: WigopeColors.orange600,
                        ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _HistoryFilter {
  const _HistoryFilter(this.label, this.icon);
  final String label;
  final IconData icon;
}
