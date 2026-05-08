import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/dio_client.dart';
import '../../auth/application/auth_controller.dart';
import 'notification_models.dart';

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository(ref.watch(dioClientProvider));
});

final notificationsProvider =
    FutureProvider.autoDispose<List<WigopeNotification>>((ref) {
  return ref.watch(notificationRepositoryProvider).list();
});

final unreadNotificationCountProvider = FutureProvider.autoDispose<int>((ref) {
  return ref.watch(notificationRepositoryProvider).unreadCount();
});

class NotificationRepository {
  NotificationRepository(this._client);

  final DioClient _client;

  Future<List<WigopeNotification>> list() async {
    try {
      final res = await _client.raw.get('/notifications');
      final rows =
          (res.data['data']['notifications'] as List<dynamic>? ?? const []);
      return rows
          .cast<Map<String, dynamic>>()
          .map(WigopeNotification.fromJson)
          .toList();
    } on DioException {
      return mockNotifications();
    }
  }

  Future<int> unreadCount() async {
    try {
      final res = await _client.raw.get('/notifications');
      return (res.data['data']['unreadCount'] as num?)?.toInt() ?? 0;
    } on DioException {
      return mockNotifications().where((n) => n.unread).length;
    }
  }

  Future<void> markAllRead() async {
    try {
      await _client.raw.post('/notifications/read-all');
    } catch (_) {}
  }
}

List<WigopeNotification> mockNotifications() {
  final now = DateTime.now();
  return [
    WigopeNotification(
      id: 'mock_n1',
      type: 'recharge_success',
      title: 'Recharge successful',
      body: 'Your Jio recharge of ₹199 is successful.',
      createdAt: now.subtract(const Duration(minutes: 18)),
    ),
    WigopeNotification(
      id: 'mock_n2',
      type: 'cashback_credit',
      title: 'Cashback credited',
      body: '₹10 cashback has been credited to your Wigope wallet.',
      createdAt: now.subtract(const Duration(hours: 3)),
      readAt: now.subtract(const Duration(hours: 2)),
    ),
    WigopeNotification(
      id: 'mock_n3',
      type: 'recharge_failed',
      title: 'Recharge failed',
      body: 'Your FASTag recharge failed. Any debited amount will be refunded.',
      createdAt: now.subtract(const Duration(days: 1)),
    ),
  ];
}
