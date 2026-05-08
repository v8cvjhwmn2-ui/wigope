import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/buttons/wigope_button.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';

class ReferralsScreen extends StatelessWidget {
  const ReferralsScreen({super.key});

  static const _code = 'WIGOPE7';
  static const _link = 'https://wigope.com/invite/WIGOPE7';

  static const _leaders = [
    _Leader('Aman', 42, '₹294'),
    _Leader('Keshav', 18, '₹126'),
    _Leader('Priya', 15, '₹105'),
    _Leader('Rahul', 11, '₹77'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: const WigopeAppBar(title: 'Referral Program'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: [
          const _ReferralHero(code: _code, link: _link),
          const SizedBox(height: 16),
          const _ChainCard(),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: WigopeButton(
                  label: 'Copy link',
                  icon: PhosphorIconsRegular.copy,
                  variant: WigopeButtonVariant.secondary,
                  onPressed: () => _copy(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: WigopeButton(
                  label: 'Share',
                  icon: PhosphorIconsRegular.shareFat,
                  onPressed: () => _share(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text('Leaderboard', style: WigopeText.h2),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: WigopeColors.surfaceCard,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: WigopeColors.borderSoft),
            ),
            child: Column(
              children: [
                for (var i = 0; i < _leaders.length; i++) ...[
                  _LeaderTile(rank: i + 1, leader: _leaders[i]),
                  if (i != _leaders.length - 1)
                    const Divider(
                      height: 1,
                      indent: 72,
                      color: WigopeColors.borderSoft,
                    ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  static Future<void> _copy(BuildContext context) async {
    await Clipboard.setData(const ClipboardData(text: _link));
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Referral link copied'),
        backgroundColor: WigopeColors.orange600,
      ),
    );
  }

  static Future<void> _share(BuildContext context) async {
    final msg = Uri.encodeComponent(
      'Join Wigope Pay with my code $_code and earn rewards: $_link',
    );
    final uri = Uri.parse('https://wa.me/?text=$msg');
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && context.mounted) {
      await _copy(context);
    }
  }
}

class _ReferralHero extends StatelessWidget {
  const _ReferralHero({required this.code, required this.link});

  final String code;
  final String link;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            WigopeColors.navy900,
            WigopeColors.navy700,
            WigopeColors.orange600
          ],
          stops: [0, 0.72, 1],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x220A1628),
            blurRadius: 22,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.14),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Icon(
                  PhosphorIconsBold.treeStructure,
                  color: Colors.white,
                  size: 28,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Build your reward chain',
                  style: WigopeText.h2.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            'Earn ₹7 per verified user. Unlock voucher bonuses as your audience keeps growing.',
            style: WigopeText.bodyS.copyWith(color: const Color(0xFFE6EDF8)),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    code,
                    style: WigopeText.h2.copyWith(
                      color: WigopeColors.orange600,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
                Text(
                  '₹7 fixed',
                  style: WigopeText.caption.copyWith(
                    color: WigopeColors.success,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChainCard extends StatelessWidget {
  const _ChainCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: WigopeColors.surfaceCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: WigopeColors.borderSoft),
      ),
      child: const Row(
        children: [
          Expanded(child: _Milestone(title: '5 joins', value: '₹35')),
          SizedBox(width: 8),
          Expanded(child: _Milestone(title: '25 joins', value: 'Gift card')),
          SizedBox(width: 8),
          Expanded(child: _Milestone(title: '100 joins', value: 'VIP')),
        ],
      ),
    );
  }
}

class _Milestone extends StatelessWidget {
  const _Milestone({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      decoration: BoxDecoration(
        color: WigopeColors.orange50,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Text(title, style: WigopeText.caption.copyWith(letterSpacing: 0)),
          const SizedBox(height: 4),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: WigopeText.bodyStrong.copyWith(
              color: WigopeColors.orange600,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _LeaderTile extends StatelessWidget {
  const _LeaderTile({required this.rank, required this.leader});

  final int rank;
  final _Leader leader;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor:
                rank == 1 ? WigopeColors.orange600 : WigopeColors.orange50,
            child: Text(
              '$rank',
              style: WigopeText.bodyStrong.copyWith(
                color: rank == 1 ? Colors.white : WigopeColors.orange600,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              leader.name,
              style: WigopeText.bodyStrong.copyWith(
                color: WigopeColors.navy900,
              ),
            ),
          ),
          Text('${leader.referrals} joins', style: WigopeText.bodyS),
          const SizedBox(width: 10),
          Text(
            leader.earned,
            style: WigopeText.bodyStrong.copyWith(
              color: WigopeColors.success,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _Leader {
  const _Leader(this.name, this.referrals, this.earned);

  final String name;
  final int referrals;
  final String earned;
}
