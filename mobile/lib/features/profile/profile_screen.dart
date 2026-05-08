import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/router/router.dart';
import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/cards/wigope_list_tile.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: WigopeAppBar(
        title: 'My Profile',
        actions: [
          IconButton(
            icon: const Icon(PhosphorIconsRegular.userCircleGear,
                color: WigopeColors.navy900),
            onPressed: () => context.push(AppRoutes.settings),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          const _ProfileHeader(
              name: 'Keshav', mobile: '+91 9568654684', kycPercent: 60),
          const SizedBox(height: 16),
          const _StatsCard(),
          const SizedBox(height: 16),
          WigopeTileSection(
            title: 'General Information',
            children: [
              WigopeListTile(
                icon: PhosphorIconsRegular.userCircle,
                label: 'Personal Details',
                subtitle: 'Name, email, city and basic profile',
                tone: WigopeTileTone.brand,
                onTap: () => context.push(AppRoutes.profileDetails),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.identificationBadge,
                label: 'KYC',
                tone: WigopeTileTone.brand,
                trailing: _kycChip(),
                onTap: () => context.push(AppRoutes.kyc),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.paperPlaneTilt,
                label: 'Money Transfer (DMT)',
                subtitle: 'Sender, beneficiary and bank transfer',
                tone: WigopeTileTone.success,
                onTap: () => context.push(AppRoutes.dmt),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.percent,
                label: 'Margin Lists',
                tone: WigopeTileTone.success,
                onTap: () => context.push(AppRoutes.margin),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.gift,
                label: 'Referral Program',
                subtitle: 'Code, share link and leaderboard',
                tone: WigopeTileTone.warning,
                onTap: () => context.push(AppRoutes.referrals),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.clockCounterClockwise,
                label: 'Recent Recharges',
                tone: WigopeTileTone.brand,
                onTap: () => context.push(AppRoutes.transactions),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.star,
                label: 'Favorite Contacts',
                subtitle: 'Saved numbers and quick recharge contacts',
                tone: WigopeTileTone.warning,
                onTap: () => _showInfo(context, 'Favorite Contacts',
                    'Saved contacts will appear here after your first recharge.'),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.headset,
                label: 'Contact Support',
                tone: WigopeTileTone.brand,
                subtitle: 'Chat or WhatsApp · 24×7',
                onTap: () => _showInfo(context, 'Contact Support',
                    'WhatsApp support and ticket history will be connected in production.'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          WigopeTileSection(
            title: 'App Preferences',
            children: [
              WigopeListTile(
                icon: PhosphorIconsRegular.moon,
                label: 'Settings',
                subtitle: 'Theme, language, biometric lock',
                tone: WigopeTileTone.info,
                onTap: () => context.push(AppRoutes.settings),
              ),
            ],
          ),
          const SizedBox(height: 16),
          WigopeTileSection(
            title: 'Other Settings',
            children: [
              WigopeListTile(
                icon: PhosphorIconsRegular.cloudArrowUp,
                label: 'Manage Permissions',
                tone: WigopeTileTone.info,
                onTap: () => _showInfo(context, 'Manage Permissions',
                    'Contacts, SMS autofill, camera and notification permissions will be managed from here.'),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.userCircle,
                label: 'Privacy policy',
                tone: WigopeTileTone.brand,
                onTap: () => _showInfo(context, 'Privacy Policy',
                    'Wigope protects your wallet, KYC and transaction data with encrypted transport and secure storage.'),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.fileText,
                label: 'Terms and conditions',
                tone: WigopeTileTone.brand,
                onTap: () => _showInfo(context, 'Terms and Conditions',
                    'Recharge, rewards and wallet terms will open here in the production app.'),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.receiptX,
                label: 'Refund policy',
                tone: WigopeTileTone.warning,
                onTap: () => _showInfo(context, 'Refund Policy',
                    'Failed recharge refunds are automatically returned to your Wigope wallet after provider confirmation.'),
              ),
              WigopeListTile(
                icon: PhosphorIconsRegular.trash,
                label: 'Delete account',
                tone: WigopeTileTone.danger,
                onTap: () => _showInfo(context, 'Delete Account',
                    'Account deletion request flow will require OTP and pending wallet settlement checks.'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Logout — card on its own with danger styling
          Container(
            decoration: BoxDecoration(
              color: WigopeColors.surfaceCard,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: WigopeColors.borderSoft),
            ),
            child: WigopeListTile(
              icon: PhosphorIconsRegular.signOut,
              label: 'Logout from app',
              danger: true,
              onTap: () => _showInfo(context, 'Logout',
                  'Logout will clear secure tokens when live auth is connected.'),
            ),
          ),
          const SizedBox(height: 24),
          Center(
            child: Text(
              'Version 1.0.0  ·  Production',
              style:
                  WigopeText.bodyS.copyWith(color: WigopeColors.textTertiary),
            ),
          ),
          const SizedBox(height: 6),
          Center(
            child: Text(
              'MADE WITH ❤️ IN INDIA',
              style:
                  WigopeText.caption.copyWith(color: WigopeColors.textTertiary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _kycChip() => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: WigopeColors.warningBg,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          '60% complete',
          style: WigopeText.caption.copyWith(
            color: WigopeColors.warning,
            letterSpacing: 0.02 * 11,
          ),
        ),
      );

  Future<void> _showInfo(BuildContext context, String title, String body) {
    return showModalBottomSheet<void>(
      context: context,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: WigopeText.h2),
              const SizedBox(height: 8),
              Text(
                body,
                style: WigopeText.bodyS.copyWith(
                  color: WigopeColors.textSecondary,
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Okay'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({
    required this.name,
    required this.mobile,
    required this.kycPercent,
  });

  final String name;
  final String mobile;
  final int kycPercent;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: 124,
          height: 124,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // KYC progress ring
              SizedBox(
                width: 124,
                height: 124,
                child: CircularProgressIndicator(
                  value: kycPercent / 100,
                  strokeWidth: 4,
                  backgroundColor: WigopeColors.orange50,
                  valueColor:
                      const AlwaysStoppedAnimation(WigopeColors.orange600),
                ),
              ),
              Container(
                width: 104,
                height: 104,
                decoration: const BoxDecoration(
                  gradient: WigopeColors.gradOrange,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  name.substring(0, 1).toUpperCase(),
                  style: WigopeText.displayL.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    gradient: WigopeColors.gradOrange,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: Text(
                    '$kycPercent% Complete',
                    style: WigopeText.caption.copyWith(
                      color: Colors.white,
                      letterSpacing: 0.02 * 11,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Text(name, style: WigopeText.h1),
        const SizedBox(height: 2),
        Text(mobile, style: WigopeText.bodyS),
      ],
    );
  }
}

class _StatsCard extends StatelessWidget {
  const _StatsCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 12),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: WigopeColors.orange600),
        boxShadow: const [
          BoxShadow(
              color: Color(0x14F97316), blurRadius: 12, offset: Offset(0, 4)),
        ],
      ),
      child: Row(
        children: const [
          Expanded(child: _Stat(value: '₹126', label: 'Referral Earned')),
          _StatDivider(),
          Expanded(child: _Stat(value: '18', label: 'Chain Joins')),
          _StatDivider(),
          Expanded(child: _Stat(value: '#2', label: 'Leaderboard')),
        ],
      ),
    );
  }
}

class _StatDivider extends StatelessWidget {
  const _StatDivider();
  @override
  Widget build(BuildContext context) =>
      Container(width: 1, height: 32, color: WigopeColors.borderSoft);
}

class _Stat extends StatelessWidget {
  const _Stat({required this.value, required this.label});
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: WigopeText.amount(20, color: WigopeColors.orange600),
        ),
        const SizedBox(height: 4),
        Text(label, style: WigopeText.bodyS),
      ],
    );
  }
}
