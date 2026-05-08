import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/dio_client.dart';
import '../../auth/application/auth_controller.dart';

final rechargeRepositoryProvider = Provider<RechargeRepository>((ref) {
  return RechargeRepository(ref.watch(dioClientProvider));
});

class RechargeRepository {
  RechargeRepository(this._client);

  final DioClient _client;

  Future<OperatorDetection> detectOperator(String number) async {
    try {
      final res = await _client.raw.get(
        '/recharge/detect-operator',
        queryParameters: {'number': number},
      );
      return OperatorDetection.fromJson(
        (res.data['data'] as Map).cast<String, dynamic>(),
      );
    } on DioException {
      final clean = number.replaceAll(RegExp(r'\D'), '');
      final operator = clean.startsWith('9')
          ? 'Jio'
          : clean.startsWith('8')
              ? 'Airtel'
              : 'Vi';
      return OperatorDetection(
        opid: operator == 'Jio'
            ? '11'
            : operator == 'Airtel'
                ? '1'
                : '4',
        operatorName: operator,
        circleCode: '5',
        circleName: 'Delhi NCR',
      );
    }
  }

  Future<List<MobilePlan>> mobilePlans({
    required String opid,
    required String circleCode,
  }) async {
    try {
      final res = await _client.raw.get(
        '/recharge/mobile-plans',
        queryParameters: {'opid': opid, 'circle': circleCode},
      );
      final rows = (res.data['data']['plans'] as List<dynamic>? ?? const []);
      final plans = rows
          .cast<Map<String, dynamic>>()
          .map(MobilePlan.fromJson)
          .where((p) => p.amount > 0)
          .toList();
      return plans.isEmpty ? mockPlans() : plans;
    } on DioException {
      return mockPlans();
    }
  }

  Future<RechargeTransaction> rechargeMobile({
    required String number,
    required num amount,
  }) async {
    final res = await _client.raw.post(
      '/recharge/mobile',
      data: {
        'number': number,
        'amount': amount,
        'paymentMode': 'wallet',
      },
    );
    return RechargeTransaction.fromJson(
      (res.data['data']['transaction'] as Map).cast<String, dynamic>(),
    );
  }

  Future<RechargeTransaction> submitService({
    required String service,
    required String title,
    required String number,
    required num amount,
  }) async {
    final res = await _client.raw.post(
      '/recharge/bill-payment',
      data: {
        'service': service,
        'opid': title,
        'number': number,
        'amount': amount,
        'mobile': '9568654684',
        'paymentMode': 'wallet',
      },
    );
    return RechargeTransaction.fromJson(
      (res.data['data']['transaction'] as Map).cast<String, dynamic>(),
    );
  }
}

class OperatorDetection {
  const OperatorDetection({
    required this.opid,
    required this.operatorName,
    required this.circleCode,
    required this.circleName,
  });

  factory OperatorDetection.fromJson(Map<String, dynamic> json) {
    return OperatorDetection(
      opid: '${json['opid'] ?? ''}',
      operatorName: '${json['operatorName'] ?? 'Operator'}',
      circleCode: '${json['circleCode'] ?? ''}',
      circleName: '${json['circleName'] ?? ''}',
    );
  }

  final String opid;
  final String operatorName;
  final String circleCode;
  final String circleName;
}

class MobilePlan {
  const MobilePlan({
    required this.id,
    required this.amount,
    required this.description,
    required this.category,
    this.validity,
  });

  factory MobilePlan.fromJson(Map<String, dynamic> json) {
    return MobilePlan(
      id: '${json['id'] ?? json['amount'] ?? ''}',
      amount: num.tryParse('${json['amount'] ?? 0}') ?? 0,
      description: '${json['description'] ?? 'Recharge plan'}',
      category: '${json['category'] ?? 'Popular'}',
      validity: json['validity'] == null ? null : '${json['validity']}',
    );
  }

  final String id;
  final num amount;
  final String description;
  final String category;
  final String? validity;
}

class RechargeTransaction {
  const RechargeTransaction({
    required this.id,
    required this.orderId,
    required this.amount,
    required this.status,
    this.operator,
    this.recipient,
    this.failureReason,
  });

  factory RechargeTransaction.fromJson(Map<String, dynamic> json) {
    return RechargeTransaction(
      id: '${json['id'] ?? ''}',
      orderId: '${json['orderId'] ?? ''}',
      amount: num.tryParse('${json['amount'] ?? 0}') ?? 0,
      status: '${json['status'] ?? 'pending'}',
      operator: json['operator'] == null ? null : '${json['operator']}',
      recipient: json['recipient'] == null ? null : '${json['recipient']}',
      failureReason:
          json['failureReason'] == null ? null : '${json['failureReason']}',
    );
  }

  final String id;
  final String orderId;
  final num amount;
  final String status;
  final String? operator;
  final String? recipient;
  final String? failureReason;
}

List<MobilePlan> mockPlans() {
  return const [
    MobilePlan(
      id: 'mock_199',
      amount: 199,
      validity: '28 days',
      description: '1.5GB/day, unlimited calls, 100 SMS/day',
      category: 'Popular',
    ),
    MobilePlan(
      id: 'mock_239',
      amount: 239,
      validity: '28 days',
      description: '2GB/day, unlimited calls, 100 SMS/day',
      category: 'Unlimited',
    ),
    MobilePlan(
      id: 'mock_299',
      amount: 299,
      validity: '28 days',
      description: '2.5GB/day, unlimited calls, OTT benefits',
      category: 'Popular',
    ),
    MobilePlan(
      id: 'mock_666',
      amount: 666,
      validity: '84 days',
      description: '1.5GB/day, unlimited calls, long validity',
      category: 'Value',
    ),
  ];
}
