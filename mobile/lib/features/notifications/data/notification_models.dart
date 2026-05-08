class WigopeNotification {
  const WigopeNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.createdAt,
    this.readAt,
  });

  final String id;
  final String type;
  final String title;
  final String body;
  final DateTime createdAt;
  final DateTime? readAt;

  bool get unread => readAt == null;

  factory WigopeNotification.fromJson(Map<String, dynamic> json) =>
      WigopeNotification(
        id: json['id'] as String,
        type: (json['type'] as String?) ?? 'system',
        title: (json['title'] as String?) ?? 'Wigope update',
        body: (json['body'] as String?) ?? '',
        createdAt:
            DateTime.tryParse('${json['createdAt'] ?? ''}') ?? DateTime.now(),
        readAt: DateTime.tryParse('${json['readAt'] ?? ''}'),
      );
}
