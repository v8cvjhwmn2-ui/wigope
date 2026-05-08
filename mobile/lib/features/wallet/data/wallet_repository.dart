import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/dio_client.dart';
import '../../auth/application/auth_controller.dart';
import 'wallet_models.dart';

final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  return WalletRepository(ref.watch(dioClientProvider));
});

final walletSummaryProvider = FutureProvider.autoDispose<WalletSummary>((ref) {
  return ref.watch(walletRepositoryProvider).summary();
});

final walletLedgerProvider =
    FutureProvider.autoDispose<List<WalletLedgerItem>>((ref) {
  return ref.watch(walletRepositoryProvider).ledger();
});

class WalletRepository {
  WalletRepository(this._client);

  final DioClient _client;

  Future<WalletSummary> summary() async {
    try {
      final res = await _client.raw.get('/wallet');
      final data = (res.data['data']['wallet']) as Map<String, dynamic>;
      return WalletSummary.fromJson(data);
    } on DioException {
      return const WalletSummary(
        balance: 0,
        lockedBalance: 0,
        lifetimeAdded: 0,
        lifetimeSpent: 0,
      );
    }
  }

  Future<List<WalletLedgerItem>> ledger() async {
    try {
      final res = await _client.raw.get('/wallet/ledger');
      final rows = (res.data['data']['ledger'] as List<dynamic>? ?? const []);
      return rows
          .cast<Map<String, dynamic>>()
          .map(WalletLedgerItem.fromJson)
          .toList();
    } on DioException {
      return mockLedger();
    }
  }

  Future<AddMoneyOrder> createAddMoneyOrder(num amount) async {
    try {
      final res = await _client.raw.post(
        '/wallet/add-money/order',
        data: {'amount': amount},
      );
      return AddMoneyOrder.fromJson(
        res.data['data']['order'] as Map<String, dynamic>,
      );
    } on DioException {
      return AddMoneyOrder(
        orderId: 'order_mock_${DateTime.now().millisecondsSinceEpoch}',
        amount: amount,
        amountPaise: (amount * 100).round(),
        currency: 'INR',
        keyId: 'rzp_test_mock',
        provider: 'mock',
      );
    }
  }
}

List<WalletLedgerItem> mockLedger() {
  final now = DateTime.now();
  return [
    WalletLedgerItem(
      id: 'mock_1',
      type: 'credit',
      amount: 500,
      source: 'add_money',
      balanceAfter: 500,
      note: 'Wallet top-up order created',
      createdAt: now.subtract(const Duration(hours: 2)),
    ),
    WalletLedgerItem(
      id: 'mock_2',
      type: 'credit',
      amount: 200,
      source: 'cashback',
      balanceAfter: 700,
      note: 'Welcome bonus up to ₹200',
      createdAt: now.subtract(const Duration(days: 1)),
    ),
  ];
}
