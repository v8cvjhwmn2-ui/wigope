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
    final res = await _client.raw.get('/wallet');
    final data = unwrapApiData(res.data)['wallet'] as Map<String, dynamic>;
    return WalletSummary.fromJson(data);
  }

  Future<List<WalletLedgerItem>> ledger() async {
    final res = await _client.raw.get('/wallet/ledger');
    final rows =
        (unwrapApiData(res.data)['ledger'] as List<dynamic>? ?? const []);
    return rows
        .cast<Map<String, dynamic>>()
        .map(WalletLedgerItem.fromJson)
        .toList();
  }

  Future<AddMoneyOrder> createAddMoneyOrder(num amount) async {
    final res = await _client.raw.post(
      '/wallet/add-money/order',
      data: {'amount': amount},
    );
    return AddMoneyOrder.fromJson(
      unwrapApiData(res.data)['order'] as Map<String, dynamic>,
    );
  }
}
