import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';
import '../../shared/states/wigope_empty_state.dart';
import 'data/notification_models.dart';
import 'data/notification_repository.dart';

class NotificationCenterScreen extends ConsumerWidget {
  const NotificationCenterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationsProvider);
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: WigopeAppBar(
        title: 'Notifications',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(PhosphorIconsRegular.arrowLeft),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              await ref.read(notificationRepositoryProvider).markAllRead();
              ref.invalidate(notificationsProvider);
              ref.invalidate(unreadNotificationCountProvider);
            },
            child: const Text('Mark read'),
          ),
        ],
      ),
      body: notifications.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: WigopeColors.orange600),
        ),
        error: (_, __) => const WigopeEmptyState(
          icon: PhosphorIconsDuotone.bell,
          title: 'No notifications',
          scriptTagline:
              'Recharge, cashback and wallet alerts will appear here.',
        ),
        data: (items) {
          if (items.isEmpty) {
            return const WigopeEmptyState(
              icon: PhosphorIconsDuotone.bell,
              title: 'No notifications',
              scriptTagline:
                  'Recharge, cashback and wallet alerts will appear here.',
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemBuilder: (_, i) => _NotificationTile(item: items[i]),
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemCount: items.length,
          );
        },
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.item});
  final WigopeNotification item;

  @override
  Widget build(BuildContext context) {
    final color = switch (item.type) {
      'recharge_success' => WigopeColors.success,
      'recharge_failed' => WigopeColors.error,
      'cashback_credit' => WigopeColors.orange600,
      _ => WigopeColors.navy700,
    };
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceBase,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color:
              item.unread ? const Color(0xFFFFC39A) : WigopeColors.borderSoft,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(_icon(item.type), color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: WigopeText.bodyStrong.copyWith(
                    color: WigopeColors.navy900,
                    fontWeight: item.unread ? FontWeight.w800 : FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  item.body,
                  style: WigopeText.bodyS.copyWith(
                    color: WigopeColors.textSecondary,
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  DateFormat('dd MMM, h:mm a').format(item.createdAt),
                  style: WigopeText.caption.copyWith(
                    color: WigopeColors.textTertiary,
                    letterSpacing: 0,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _icon(String type) {
    return switch (type) {
      'recharge_success' => PhosphorIconsBold.checkCircle,
      'recharge_failed' => PhosphorIconsBold.warningCircle,
      'cashback_credit' => PhosphorIconsBold.gift,
      _ => PhosphorIconsBold.bell,
    };
  }
}
