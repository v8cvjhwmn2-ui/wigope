import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/cards/wigope_list_tile.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkMode = false;
  bool _biometric = false;
  bool _notifications = true;
  String _language = 'English';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _darkMode = prefs.getBool('settings.darkMode') ?? false;
      _biometric = prefs.getBool('settings.biometric') ?? false;
      _notifications = prefs.getBool('settings.notifications') ?? true;
      _language = prefs.getString('settings.language') ?? 'English';
    });
  }

  Future<void> _saveBool(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }

  Future<void> _saveLanguage(String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('settings.language', value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: const WigopeAppBar(title: 'App Settings'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: [
          WigopeTileSection(
            title: 'Appearance',
            children: [
              WigopeListTile(
                icon: PhosphorIconsRegular.moon,
                label: 'Dark mode',
                subtitle: 'Preview toggle for Wigope dark theme',
                tone: WigopeTileTone.info,
                trailing: Switch.adaptive(
                  value: _darkMode,
                  activeColor: WigopeColors.orange600,
                  onChanged: (value) {
                    setState(() => _darkMode = value);
                    _saveBool('settings.darkMode', value);
                  },
                ),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.translate,
                label: 'Language',
                subtitle: _language,
                tone: WigopeTileTone.brand,
                onTap: _showLanguageSheet,
              ),
            ],
          ),
          const SizedBox(height: 16),
          WigopeTileSection(
            title: 'Security',
            children: [
              WigopeListTile(
                icon: PhosphorIconsRegular.fingerprint,
                label: 'Biometric lock',
                subtitle: 'Require fingerprint or face unlock on app open',
                tone: WigopeTileTone.success,
                trailing: Switch.adaptive(
                  value: _biometric,
                  activeColor: WigopeColors.orange600,
                  onChanged: (value) {
                    setState(() => _biometric = value);
                    _saveBool('settings.biometric', value);
                  },
                ),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.bellRinging,
                label: 'Recharge notifications',
                subtitle: 'Success, failure and cashback alerts',
                tone: WigopeTileTone.warning,
                trailing: Switch.adaptive(
                  value: _notifications,
                  activeColor: WigopeColors.orange600,
                  onChanged: (value) {
                    setState(() => _notifications = value);
                    _saveBool('settings.notifications', value);
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: WigopeColors.orange50,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFFFD8BF)),
            ),
            child: Text(
              'Settings are saved on this device. Native biometric prompt wiring will activate in the Android build.',
              style:
                  WigopeText.bodyS.copyWith(color: WigopeColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showLanguageSheet() async {
    final value = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Choose language', style: WigopeText.h2),
              const SizedBox(height: 12),
              for (final lang in const ['English', 'Hindi'])
                RadioListTile<String>(
                  value: lang,
                  groupValue: _language,
                  activeColor: WigopeColors.orange600,
                  title: Text(lang),
                  onChanged: (v) => Navigator.of(context).pop(v),
                ),
            ],
          ),
        ),
      ),
    );
    if (value == null) return;
    setState(() => _language = value);
    _saveLanguage(value);
  }
}
