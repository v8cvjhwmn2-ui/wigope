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
    final res = await _client.raw.get('/notifications');
    final data = unwrapApiData(res.data);
    final rows = (data['notifications'] as List<dynamic>? ?? const []);
    return rows
        .cast<Map<String, dynamic>>()
        .map(WigopeNotification.fromJson)
        .toList();
  }

  Future<int> unreadCount() async {
    final res = await _client.raw.get('/notifications');
    return (unwrapApiData(res.data)['unreadCount'] as num?)?.toInt() ?? 0;
  }

  Future<void> markAllRead() async {
    try {
      await _client.raw.post('/notifications/read-all');
    } catch (_) {}
  }
}
