import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/dio_client.dart';
import '../../auth/application/auth_controller.dart';
import 'transaction_models.dart';

final transactionRepositoryProvider = Provider<TransactionRepository>((ref) {
  return TransactionRepository(ref.watch(dioClientProvider));
});

final transactionFilterProvider = StateProvider<String>((_) => 'all');

final transactionsProvider =
    FutureProvider.autoDispose<List<WigopeTransaction>>((ref) {
  final filter = ref.watch(transactionFilterProvider);
  return ref.watch(transactionRepositoryProvider).list(
        status: filter == 'all' ? null : filter,
      );
});

final transactionDetailProvider =
    FutureProvider.autoDispose.family<WigopeTransaction, String>((ref, id) {
  return ref.watch(transactionRepositoryProvider).detail(id);
});

class TransactionRepository {
  TransactionRepository(this._client);

  final DioClient _client;

  Future<List<WigopeTransaction>> list({String? status}) async {
    try {
      final res = await _client.raw.get(
        '/transactions',
        queryParameters: {if (status != null) 'status': status},
      );
      final rows =
          (res.data['data']['transactions'] as List<dynamic>? ?? const []);
      return rows
          .cast<Map<String, dynamic>>()
          .map(WigopeTransaction.fromJson)
          .toList();
    } on DioException {
      return mockTransactions();
    }
  }

  Future<WigopeTransaction> detail(String id) async {
    try {
      final res = await _client.raw.get('/transactions/$id');
      return WigopeTransaction.fromJson(
        res.data['data']['transaction'] as Map<String, dynamic>,
      );
    } on DioException {
      return mockTransactions().firstWhere(
        (tx) => tx.id == id,
        orElse: () => mockTransactions().first,
      );
    }
  }

  Uri receiptUri(String id) {
    return _client.raw.options.baseUrl.endsWith('/')
        ? Uri.parse(
            '${_client.raw.options.baseUrl}transactions/$id/receipt.pdf')
        : Uri.parse(
            '${_client.raw.options.baseUrl}/transactions/$id/receipt.pdf');
  }
}

List<WigopeTransaction> mockTransactions() {
  final now = DateTime.now();
  return [
    WigopeTransaction(
      id: 'mock_tx_success',
      type: 'recharge',
      service: 'mobile_prepaid',
      operator: 'Jio',
      recipient: '9568654684',
      amount: 199,
      paymentMode: 'wallet',
      status: 'success',
      createdAt: now.subtract(const Duration(minutes: 18)),
    ),
    WigopeTransaction(
      id: 'mock_tx_failed',
      type: 'recharge',
      service: 'fastag',
      operator: 'FASTag',
      recipient: 'UP16AB1234',
      amount: 500,
      paymentMode: 'upi',
      status: 'failed',
      failureReason: 'Operator timeout',
      createdAt: now.subtract(const Duration(hours: 4)),
    ),
    WigopeTransaction(
      id: 'mock_tx_cashback',
      type: 'cashback',
      service: 'wallet_topup',
      amount: 10,
      cashbackAmount: 10,
      paymentMode: 'wallet',
      status: 'success',
      createdAt: now.subtract(const Duration(days: 1)),
    ),
  ];
}
