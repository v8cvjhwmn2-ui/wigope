import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/dio_client.dart';
import '../../auth/application/auth_controller.dart';

final kycRepositoryProvider = Provider<KycRepository>((ref) {
  return KycRepository(ref.watch(dioClientProvider));
});

final kycStatusProvider = FutureProvider.autoDispose<KycStatus>((ref) {
  return ref.watch(kycRepositoryProvider).status();
});

class KycRepository {
  KycRepository(this._client);

  final DioClient _client;

  Future<KycStatus> status() async {
    try {
      final res = await _client.raw.get('/kyc/status');
      return KycStatus.fromJson(unwrapApiData(res.data));
    } on DioException {
      return const KycStatus(status: 'none');
    }
  }

  Future<KycStatus> submit({
    required String pan,
    required String aadhaarLast4,
    required String aadhaarName,
    String? dob,
    String? address,
    double? ocrConfidence,
  }) async {
    final res = await _client.raw.post(
      '/kyc/submit',
      data: {
        'pan': pan,
        'aadhaarLast4': aadhaarLast4,
        'aadhaarName': aadhaarName,
        if (dob != null && dob.isNotEmpty) 'dob': dob,
        if (address != null && address.isNotEmpty) 'address': address,
        if (ocrConfidence != null) 'ocrConfidence': ocrConfidence,
      },
    );
    return KycStatus.fromJson(unwrapApiData(res.data));
  }
}

class KycStatus {
  const KycStatus({
    required this.status,
    this.submittedAt,
    this.reviewedAt,
    this.aadhaarLast4,
    this.rejectionReason,
  });

  factory KycStatus.fromJson(Map<String, dynamic> json) {
    return KycStatus(
      status: '${json['status'] ?? 'none'}',
      submittedAt:
          json['submittedAt'] == null ? null : '${json['submittedAt']}',
      reviewedAt: json['reviewedAt'] == null ? null : '${json['reviewedAt']}',
      aadhaarLast4:
          json['aadhaarLast4'] == null ? null : '${json['aadhaarLast4']}',
      rejectionReason:
          json['rejectionReason'] == null ? null : '${json['rejectionReason']}',
    );
  }

  final String status;
  final String? submittedAt;
  final String? reviewedAt;
  final String? aadhaarLast4;
  final String? rejectionReason;
}
