class WigopeTransaction {
  const WigopeTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.paymentMode,
    required this.status,
    required this.createdAt,
    this.service,
    this.operator,
    this.recipient,
    this.cashbackAmount = 0,
    this.failureReason,
    this.gatewayOrderId,
  });

  final String id;
  final String type;
  final String? service;
  final String? operator;
  final String? recipient;
  final num amount;
  final num cashbackAmount;
  final String paymentMode;
  final String status;
  final String? failureReason;
  final String? gatewayOrderId;
  final DateTime createdAt;

  factory WigopeTransaction.fromJson(Map<String, dynamic> json) =>
      WigopeTransaction(
        id: json['id'] as String,
        type: (json['type'] as String?) ?? 'recharge',
        service: json['service'] as String?,
        operator: json['operator'] as String?,
        recipient: json['recipient'] as String?,
        amount: (json['amount'] as num?) ?? 0,
        cashbackAmount: (json['cashbackAmount'] as num?) ?? 0,
        paymentMode: (json['paymentMode'] as String?) ?? 'wallet',
        status: (json['status'] as String?) ?? 'pending',
        failureReason: json['failureReason'] as String?,
        gatewayOrderId: json['gatewayOrderId'] as String?,
        createdAt:
            DateTime.tryParse('${json['createdAt'] ?? ''}') ?? DateTime.now(),
      );
}
