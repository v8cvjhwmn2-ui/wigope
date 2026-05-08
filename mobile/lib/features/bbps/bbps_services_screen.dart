import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/router/router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';

class BbpsServicesScreen extends StatelessWidget {
  const BbpsServicesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: AppBar(
        backgroundColor: WigopeColors.surfaceBase,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 72,
        leadingWidth: 88,
        leading: Padding(
          padding: const EdgeInsets.only(left: 22),
          child:
              _HeaderBackButton(onTap: () => Navigator.of(context).maybePop()),
        ),
        titleSpacing: 0,
        title: Text(
          'BBPS Services',
          style: WigopeText.h2.copyWith(fontWeight: FontWeight.w800),
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: WigopeColors.borderSoft),
        ),
      ),
      body: const _BbpsServicesBody(),
    );
  }
}

class _BbpsServicesBody extends StatelessWidget {
  const _BbpsServicesBody();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: const [
        _ServiceSection(
          title: 'Popular Services',
          columns: 4,
          services: [
            _BbpsService('Mobile\nRecharge', 'prepaid_recharges.png'),
            _BbpsService('DTH/TV\nRecharge', 'dth_d2h_recharges.png'),
            _BbpsService('Postpaid\nBill', 'postpaid_payments.png'),
            _BbpsService('FASTag\nRecharge', 'fastag_recharges.png'),
          ],
        ),
        SizedBox(height: 16),
        _ServiceSection(
          title: 'Utility Services',
          services: [
            _BbpsService('eChallan', 'echallan.png'),
            _BbpsService('EV\nRecharge', 'ev_recharge.png'),
            _BbpsService('Electricity\nBill', 'electricity_payments.png'),
            _BbpsService('Prepaid\nMeter', 'prepaid_meter.png'),
            _BbpsService('Piped\nGas', 'gas_payments.png'),
            _BbpsService('Water\nBill', 'water_payments.png'),
            _BbpsService('Broadband/\nLandline', 'broadband_landline.png'),
            _BbpsService('LPG\nBooking', 'gas_cylinder_booking.png'),
          ],
        ),
        SizedBox(height: 16),
        _ServiceSection(
          title: 'Payments',
          services: [
            _BbpsService('Insurance\nPremium', 'insurance_payments.png'),
            _BbpsService('Cable TV\nBill', 'cable_tv_payments.png'),
            _BbpsService('Credit Card\nBill', 'credit_card_payment.png'),
          ],
        ),
      ],
    );
  }
}

class _HeaderBackButton extends StatelessWidget {
  const _HeaderBackButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFDCEBFF)),
          ),
          child: const Icon(
            PhosphorIconsBold.arrowLeft,
            color: WigopeColors.navy900,
            size: 23,
          ),
        ),
      ),
    );
  }
}

class _ServiceSection extends StatelessWidget {
  const _ServiceSection({
    required this.title,
    required this.services,
    this.columns = 4,
  });

  final String title;
  final List<_BbpsService> services;
  final int columns;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 18, 14, 16),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: WigopeColors.borderSoft),
        boxShadow: const [
          BoxShadow(
            color: Color(0x080A1628),
            blurRadius: 16,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 2),
            child: Text(
              title,
              style: WigopeText.h2.copyWith(fontWeight: FontWeight.w900),
            ),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            padding: EdgeInsets.zero,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: services.length,
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: columns,
              crossAxisSpacing: 12,
              mainAxisSpacing: 18,
              mainAxisExtent: 112,
            ),
            itemBuilder: (_, i) => _BbpsServiceTile(service: services[i]),
          ),
        ],
      ),
    );
  }
}

class _BbpsServiceTile extends StatelessWidget {
  const _BbpsServiceTile({required this.service});

  final _BbpsService service;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        if (service.asset == 'prepaid_recharges.png') {
          context.push(AppRoutes.mobileRecharge);
          return;
        }
        final title = service.label.replaceAll('\n', ' ');
        final key = service.asset.replaceAll('.png', '');
        context.push(
          '${AppRoutes.serviceFlow}?service=$key&title=${Uri.encodeComponent(title)}',
        );
      },
      borderRadius: BorderRadius.circular(18),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ServiceIconShell(
            asset: service.asset,
          ),
          const SizedBox(height: 8),
          Text(
            service.label,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: WigopeText.bodyS.copyWith(
              color: WigopeColors.navy900,
              fontWeight: FontWeight.w700,
              fontSize: 12,
              height: 1.15,
            ),
          ),
        ],
      ),
    );
  }
}

class _ServiceIconShell extends StatelessWidget {
  const _ServiceIconShell({required this.asset});

  final String asset;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 62,
      height: 62,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x12F97316),
            blurRadius: 12,
            offset: Offset(0, 6),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Image.asset(
        'assets/services/$asset',
        width: 62,
        height: 62,
        fit: BoxFit.cover,
        filterQuality: FilterQuality.high,
      ),
    );
  }
}

class _BbpsService {
  const _BbpsService(this.label, this.asset);

  final String label;
  final String asset;
}
