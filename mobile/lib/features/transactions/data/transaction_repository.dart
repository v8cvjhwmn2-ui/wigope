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
  }

  Future<WigopeTransaction> detail(String id) async {
    final res = await _client.raw.get('/transactions/$id');
    return WigopeTransaction.fromJson(
      res.data['data']['transaction'] as Map<String, dynamic>,
    );
  }

  Uri receiptUri(String id) {
    return _client.raw.options.baseUrl.endsWith('/')
        ? Uri.parse(
            '${_client.raw.options.baseUrl}transactions/$id/receipt.pdf')
        : Uri.parse(
            '${_client.raw.options.baseUrl}/transactions/$id/receipt.pdf');
  }
}
