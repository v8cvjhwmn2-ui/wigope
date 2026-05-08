import 'package:flutter/material.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/cards/wigope_operator_row.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';

class MarginListScreen extends StatelessWidget {
  const MarginListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: const WigopeAppBar(title: 'Margin List'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: const [
          _Section(
            title: 'Mobile Recharges',
            rows: [
              WigopeOperatorRow(
                  name: 'Airtel',
                  commission: 'Upto 3.0%',
                  brandColor: Color(0xFFF20B16)),
              WigopeOperatorRow(
                  name: 'Jio',
                  commission: 'Upto 3.0%',
                  brandColor: Color(0xFF062C9B)),
              WigopeOperatorRow(
                  name: 'Vi',
                  commission: 'Upto 3.0%',
                  brandColor: Color(0xFFF52938)),
              WigopeOperatorRow(
                  name: 'BSNL',
                  commission: 'Upto 3.0%',
                  brandColor: Color(0xFF062B3F)),
            ],
          ),
          SizedBox(height: 16),
          _Section(
            title: 'DTH Recharges',
            rows: [
              WigopeOperatorRow(
                  name: 'Tata Play',
                  commission: 'Upto 4.05%',
                  brandColor: Color(0xFFE1008A)),
              WigopeOperatorRow(
                  name: 'Dish TV',
                  commission: 'Upto 4.05%',
                  brandColor: Color(0xFFE75A2C)),
              WigopeOperatorRow(
                  name: 'Airtel TV',
                  commission: 'Upto 4.05%',
                  brandColor: Color(0xFFFF3B24)),
              WigopeOperatorRow(
                  name: 'D2H',
                  commission: 'Upto 4.05%',
                  brandColor: Color(0xFF55286F)),
              WigopeOperatorRow(
                  name: 'Sun Direct',
                  commission: 'Upto 4.05%',
                  brandColor: Color(0xFFFFFF68)),
            ],
          ),
          SizedBox(height: 16),
          _Section(
            title: 'Other Services',
            rows: [
              WigopeOperatorRow(
                  name: 'Google Play',
                  commission: 'Upto 2.05%',
                  brandColor: Color(0xFFFFE49A)),
              WigopeOperatorRow(
                  name: 'FASTag',
                  commission: 'Upto 0.10%',
                  brandColor: Color(0xFFD0FFD2)),
            ],
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.rows});
  final String title;
  final List<Widget> rows;

  @override
  Widget build(BuildContext context) {
    final children = <Widget>[];
    for (var i = 0; i < rows.length; i++) {
      children.add(rows[i]);
      if (i != rows.length - 1) {
        children.add(const Divider(
          height: 1,
          thickness: 1,
          indent: 70,
          color: WigopeColors.borderSoft,
        ));
      }
    }

    return Container(
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: WigopeColors.borderSoft),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(title, style: WigopeText.h3),
          ),
          ...children,
          const SizedBox(height: 4),
        ],
      ),
    );
  }
}
