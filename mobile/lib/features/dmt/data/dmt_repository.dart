import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/dio_client.dart';
import '../../auth/application/auth_controller.dart';

final dmtRepositoryProvider = Provider<DmtRepository>((ref) {
  return DmtRepository(ref.watch(dioClientProvider));
});

final dmtSnapshotProvider =
    FutureProvider.autoDispose<DmtSnapshot>((ref) async {
  final repo = ref.watch(dmtRepositoryProvider);
  final sender = await repo.sender();
  final beneficiaries = await repo.beneficiaries();
  final transfers = await repo.transfers();
  return DmtSnapshot(
      sender: sender, beneficiaries: beneficiaries, transfers: transfers);
});

class DmtRepository {
  DmtRepository(this._client);
  final DioClient _client;

  Future<DmtSender?> sender() async {
    try {
      final res = await _client.raw.get('/dmt/sender');
      final raw = res.data['data']['sender'];
      if (raw == null) return null;
      return DmtSender.fromJson((raw as Map).cast<String, dynamic>());
    } on DioException {
      return null;
    }
  }

  Future<DmtSender> registerSender(
      {required String mobile, required String name}) async {
    final res = await _client.raw
        .post('/dmt/sender', data: {'mobile': mobile, 'name': name});
    return DmtSender.fromJson(
        (res.data['data']['sender'] as Map).cast<String, dynamic>());
  }

  Future<List<DmtBeneficiary>> beneficiaries() async {
    final res = await _client.raw.get('/dmt/beneficiaries');
    final rows =
        res.data['data']['beneficiaries'] as List<dynamic>? ?? const [];
    return rows
        .cast<Map>()
        .map((e) => DmtBeneficiary.fromJson(e.cast<String, dynamic>()))
        .toList();
  }

  Future<DmtBeneficiary> addBeneficiary({
    required String name,
    required String accountNumber,
    required String ifsc,
    String? bankName,
  }) async {
    final res = await _client.raw.post('/dmt/beneficiaries', data: {
      'name': name,
      'accountNumber': accountNumber,
      'ifsc': ifsc,
      if (bankName != null && bankName.isNotEmpty) 'bankName': bankName,
    });
    return DmtBeneficiary.fromJson(
        (res.data['data']['beneficiary'] as Map).cast<String, dynamic>());
  }

  Future<DmtTransfer> transfer({
    required String beneficiaryId,
    required num amount,
    String? remarks,
  }) async {
    final res = await _client.raw.post('/dmt/transfers', data: {
      'beneficiaryId': beneficiaryId,
      'amount': amount,
      if (remarks != null) 'remarks': remarks,
    });
    return DmtTransfer.fromJson(
        (res.data['data']['transfer'] as Map).cast<String, dynamic>());
  }

  Future<List<DmtTransfer>> transfers() async {
    final res = await _client.raw.get('/dmt/transfers');
    final rows = res.data['data']['transfers'] as List<dynamic>? ?? const [];
    return rows
        .cast<Map>()
        .map((e) => DmtTransfer.fromJson(e.cast<String, dynamic>()))
        .toList();
  }
}

class DmtSnapshot {
  const DmtSnapshot(
      {required this.sender,
      required this.beneficiaries,
      required this.transfers});
  final DmtSender? sender;
  final List<DmtBeneficiary> beneficiaries;
  final List<DmtTransfer> transfers;
}

class DmtSender {
  const DmtSender(
      {required this.id,
      required this.mobile,
      required this.name,
      required this.kycStatus});
  factory DmtSender.fromJson(Map<String, dynamic> json) {
    return DmtSender(
      id: '${json['id'] ?? ''}',
      mobile: '${json['mobile'] ?? ''}',
      name: '${json['name'] ?? ''}',
      kycStatus: '${json['kycStatus'] ?? 'pending'}',
    );
  }
  final String id;
  final String mobile;
  final String name;
  final String kycStatus;
}

class DmtBeneficiary {
  const DmtBeneficiary({
    required this.id,
    required this.name,
    required this.accountNumberMasked,
    required this.ifsc,
    required this.bankName,
    required this.verified,
  });
  factory DmtBeneficiary.fromJson(Map<String, dynamic> json) {
    return DmtBeneficiary(
      id: '${json['id'] ?? ''}',
      name: '${json['name'] ?? ''}',
      accountNumberMasked: '${json['accountNumberMasked'] ?? ''}',
      ifsc: '${json['ifsc'] ?? ''}',
      bankName: json['bankName'] == null ? null : '${json['bankName']}',
      verified: json['verified'] == true,
    );
  }
  final String id;
  final String name;
  final String accountNumberMasked;
  final String ifsc;
  final String? bankName;
  final bool verified;
}

class DmtTransfer {
  const DmtTransfer({
    required this.id,
    required this.orderId,
    required this.beneficiaryName,
    required this.amount,
    required this.status,
  });
  factory DmtTransfer.fromJson(Map<String, dynamic> json) {
    return DmtTransfer(
      id: '${json['id'] ?? ''}',
      orderId: '${json['orderId'] ?? ''}',
      beneficiaryName: '${json['beneficiaryName'] ?? ''}',
      amount: num.tryParse('${json['amount'] ?? 0}') ?? 0,
      status: '${json['status'] ?? 'pending'}',
    );
  }
  final String id;
  final String orderId;
  final String beneficiaryName;
  final num amount;
  final String status;
}
