class WalletSummary {
  const WalletSummary({
    required this.balance,
    required this.lockedBalance,
    required this.lifetimeAdded,
    required this.lifetimeSpent,
    this.updatedAt,
  });

  final num balance;
  final num lockedBalance;
  final num lifetimeAdded;
  final num lifetimeSpent;
  final DateTime? updatedAt;

  factory WalletSummary.fromJson(Map<String, dynamic> json) => WalletSummary(
        balance: (json['balance'] as num?) ?? 0,
        lockedBalance: (json['lockedBalance'] as num?) ?? 0,
        lifetimeAdded: (json['lifetimeAdded'] as num?) ?? 0,
        lifetimeSpent: (json['lifetimeSpent'] as num?) ?? 0,
        updatedAt: DateTime.tryParse('${json['updatedAt'] ?? ''}'),
      );
}

class WalletLedgerItem {
  const WalletLedgerItem({
    required this.id,
    required this.type,
    required this.amount,
    required this.source,
    required this.balanceAfter,
    required this.createdAt,
    this.note,
  });

  final String id;
  final String type;
  final num amount;
  final String source;
  final num balanceAfter;
  final DateTime createdAt;
  final String? note;

  factory WalletLedgerItem.fromJson(Map<String, dynamic> json) =>
      WalletLedgerItem(
        id: json['id'] as String,
        type: (json['type'] as String?) ?? 'credit',
        amount: (json['amount'] as num?) ?? 0,
        source: (json['source'] as String?) ?? 'add_money',
        balanceAfter: (json['balanceAfter'] as num?) ?? 0,
        createdAt:
            DateTime.tryParse('${json['createdAt'] ?? ''}') ?? DateTime.now(),
        note: json['note'] as String?,
      );
}

class AddMoneyOrder {
  const AddMoneyOrder({
    required this.orderId,
    required this.amount,
    required this.amountPaise,
    required this.currency,
    required this.keyId,
    required this.provider,
  });

  final String orderId;
  final num amount;
  final int amountPaise;
  final String currency;
  final String keyId;
  final String provider;

  factory AddMoneyOrder.fromJson(Map<String, dynamic> json) => AddMoneyOrder(
        orderId: json['orderId'] as String,
        amount: (json['amount'] as num?) ?? 0,
        amountPaise: (json['amountPaise'] as num?)?.toInt() ?? 0,
        currency: (json['currency'] as String?) ?? 'INR',
        keyId: (json['keyId'] as String?) ?? '',
        provider: (json['provider'] as String?) ?? 'razorpay',
      );
}
