import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/buttons/wigope_button.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';

class ProfileDetailsScreen extends StatefulWidget {
  const ProfileDetailsScreen({super.key});

  @override
  State<ProfileDetailsScreen> createState() => _ProfileDetailsScreenState();
}

class _ProfileDetailsScreenState extends State<ProfileDetailsScreen> {
  final _name = TextEditingController(text: 'Keshav Swami');
  final _email = TextEditingController(text: 'keshav@wigope.com');
  final _dob = TextEditingController(text: '07 May 1998');
  final _city = TextEditingController(text: 'Noida, Uttar Pradesh');

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _dob.dispose();
    _city.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: const WigopeAppBar(title: 'Profile Details'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: WigopeColors.surfaceCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: WigopeColors.borderSoft),
            ),
            child: Row(
              children: [
                Container(
                  width: 62,
                  height: 62,
                  decoration: const BoxDecoration(
                    gradient: WigopeColors.gradOrange,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    'K',
                    style: WigopeText.h1.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Keshav Swami', style: WigopeText.h3),
                      const SizedBox(height: 3),
                      Text(
                        '+91 9568654684',
                        style: WigopeText.bodyS.copyWith(
                          color: WigopeColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  PhosphorIconsRegular.camera,
                  color: WigopeColors.orange600,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _ProfileField(label: 'Full name', controller: _name),
          _ProfileField(label: 'Email', controller: _email),
          _ProfileField(label: 'Date of birth', controller: _dob),
          _ProfileField(label: 'City', controller: _city),
          const SizedBox(height: 16),
          WigopeButton(
            label: 'Save profile',
            icon: PhosphorIconsRegular.check,
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Profile details saved locally'),
                  backgroundColor: WigopeColors.orange600,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ProfileField extends StatelessWidget {
  const _ProfileField({required this.label, required this.controller});

  final String label;
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(labelText: label),
      ),
    );
  }
}
