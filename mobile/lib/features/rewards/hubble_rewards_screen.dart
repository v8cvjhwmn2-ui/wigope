import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../../shared/branding/wigope_logo.dart';
import '../../shared/cards/wigope_offer_card.dart';
import '../../shared/scaffolds/wigope_app_bar.dart';
import 'hubble_sdk.dart';

class HubbleRewardsScreen extends StatelessWidget {
  const HubbleRewardsScreen({super.key, this.showAppBar = false});

  final bool showAppBar;

  static const _ott = [
    _RewardBrand('Sony LIV', Color(0xFF6D3AF2), 'ott_sonyliv.png'),
    _RewardBrand('Spotify', Color(0xFF24C66B), 'ott_spotify.png'),
    _RewardBrand('Hotstar', Color(0xFF05303D), 'ott_hotstar.png'),
    _RewardBrand('Prime Video', Color(0xFF102D3F), 'ott_prime.png'),
  ];

  static const _vouchers = [
    _RewardBrand('Swiggy', Color(0xFFFC8019), 'voucher_swiggy_new.png'),
    _RewardBrand('AJIO', Color(0xFF163141), 'voucher_ajio.png'),
    _RewardBrand('PVR', Color(0xFF5A4636), 'voucher_pvr.png'),
    _RewardBrand('Flipkart', Color(0xFF3489C9), 'voucher_flipkart_new.png'),
    _RewardBrand('Myntra', Color(0xFFD91A93), 'voucher_myntra_new.png'),
    _RewardBrand('Amazon', Color(0xFF061D30), 'voucher_amazon_new.png'),
    _RewardBrand('Zomato', Color(0xFFE23744), 'voucher_zomato_new.png'),
    _RewardBrand(
      'Reliance Smart',
      Color(0xFFE92B2B),
      'voucher_reliance_smart.png',
    ),
    _RewardBrand("Domino's", Color(0xFF157AA6), 'voucher_dominos_new.png'),
    _RewardBrand('BigBasket', Color(0xFFA5CD39), 'voucher_bigbasket.png'),
    _RewardBrand('Blinkit', Color(0xFFFFCC00), 'voucher_blinkit.png'),
    _RewardBrand('See All', Color(0xFF6D28D9), 'see_all_tile.png'),
  ];

  static const _quick = [
    _RewardCategory('Gift cards', PhosphorIconsRegular.gift, true),
    _RewardCategory('Vouchers', PhosphorIconsRegular.ticket, true),
    _RewardCategory('Reward chain', PhosphorIconsRegular.treeStructure, false),
  ];

  @override
  Widget build(BuildContext context) {
    final content = Container(
      color: WigopeColors.surfaceSoft,
      child: SafeArea(
        top: !showAppBar,
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
          children: [
            if (!showAppBar) const _RewardsHeader(),
            if (!showAppBar) const SizedBox(height: 14),
            const _HeroCard(),
            const SizedBox(height: 14),
            const _QuickTiles(),
            const SizedBox(height: 20),
            const _RewardsChainCard(),
            const SizedBox(height: 20),
            const _SectionHeader(
              leading: 'OTT',
              trailing: 'Gift Cards',
              meta: 'Subscriptions',
            ),
            const SizedBox(height: 12),
            _RewardsGrid(
              brands: _ott,
              columns: 4,
              itemExtent: 108,
              tileSize: 66,
            ),
            const SizedBox(height: 20),
            const _SectionHeader(
              leading: 'Gift &',
              trailing: 'Voucher Deals',
              meta: '500+ brands',
            ),
            const SizedBox(height: 12),
            _RewardsGrid(
              brands: _vouchers,
              columns: 3,
              itemExtent: 138,
              tileSize: 84,
            ),
          ],
        ),
      ),
    );

    if (!showAppBar) return content;
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      appBar: const WigopeAppBar(title: 'Gift Cards & Rewards'),
      body: content,
    );
  }
}

class _RewardsHeader extends StatelessWidget {
  const _RewardsHeader();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const WigopeLogo.full(height: 24),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: WigopeColors.orange50,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            'Wigope Rewards',
            style: WigopeText.caption.copyWith(
              color: WigopeColors.orange600,
              letterSpacing: 0.06 * 11,
            ),
          ),
        ),
      ],
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard();

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: () => HubbleSdkLauncher.open(context),
      child: Container(
        padding: const EdgeInsets.fromLTRB(18, 18, 18, 20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              WigopeColors.navy900,
              WigopeColors.navy700,
              WigopeColors.orange600,
            ],
            stops: [0, 0.68, 1],
          ),
          borderRadius: BorderRadius.circular(22),
          boxShadow: const [
            BoxShadow(
              color: Color(0x1A0A1628),
              blurRadius: 18,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                gradient: WigopeColors.gradOrange,
                borderRadius: BorderRadius.circular(18),
              ),
              child: const Icon(
                PhosphorIconsBold.gift,
                color: Colors.white,
                size: 30,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Gift cards & vouchers',
                    style: WigopeText.h2.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Gift cards powered by Hubble Rewards API',
                    style: WigopeText.bodyS
                        .copyWith(color: const Color(0xFFD2DAEA)),
                  ),
                ],
              ),
            ),
            const Icon(PhosphorIconsRegular.caretRight,
                color: Color(0xFFD2DAEA)),
          ],
        ),
      ),
    );
  }
}

class _QuickTiles extends StatelessWidget {
  const _QuickTiles();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (final item in HubbleRewardsScreen._quick)
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () {
                  if (item.opensSdk) {
                    HubbleSdkLauncher.open(context);
                  } else {
                    _copyReferralLink(context);
                  }
                },
                child: Ink(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: WigopeColors.surfaceCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: WigopeColors.borderSoft),
                  ),
                  child: Column(
                    children: [
                      Icon(item.icon, color: WigopeColors.orange600, size: 24),
                      const SizedBox(height: 8),
                      Text(
                        item.label,
                        textAlign: TextAlign.center,
                        style: WigopeText.caption.copyWith(
                          color: WigopeColors.navy900,
                          letterSpacing: 0,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _RewardsChainCard extends StatelessWidget {
  const _RewardsChainCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFFF3EA), Colors.white],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFFD6BF)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0FFF6B10),
            blurRadius: 20,
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
                width: 42,
                height: 42,
                decoration: const BoxDecoration(
                  gradient: WigopeColors.gradOrange,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  PhosphorIconsBold.treeStructure,
                  color: Colors.white,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Wigope rewards chain',
                  style: WigopeText.h2.copyWith(
                    color: WigopeColors.navy900,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Share your Wigope invite link. Every verified user adds ₹7 fixed reward, then unlocks chain milestones for voucher bonuses.',
            style: WigopeText.bodyS.copyWith(color: WigopeColors.textSecondary),
          ),
          const SizedBox(height: 14),
          const Row(
            children: [
              Expanded(
                child: _ChainStep(
                  title: 'Level 1',
                  value: '₹7',
                  subtitle: 'per verified user',
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                child: _ChainStep(
                  title: 'Level 2',
                  value: '2%',
                  subtitle: 'voucher bonus pool',
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                child: _ChainStep(
                  title: 'Milestone',
                  value: 'Gift',
                  subtitle: 'extra rewards',
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              const _RewardPill(
                icon: PhosphorIconsRegular.currencyInr,
                label: '₹7 fixed',
              ),
              const _RewardPill(
                icon: PhosphorIconsRegular.shareNetwork,
                label: 'Audience chain',
              ),
              const _RewardPill(
                icon: PhosphorIconsRegular.gift,
                label: 'Voucher rewards',
              ),
              InkWell(
                borderRadius: BorderRadius.circular(999),
                onTap: () => _copyReferralLink(context),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    gradient: WigopeColors.gradOrange,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    'Start chain',
                    style: WigopeText.caption.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ChainStep extends StatelessWidget {
  const _ChainStep({
    required this.title,
    required this.value,
    required this.subtitle,
  });

  final String title;
  final String value;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFE0CE)),
      ),
      child: Column(
        children: [
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: WigopeText.caption.copyWith(
              color: WigopeColors.textSecondary,
              fontWeight: FontWeight.w700,
              letterSpacing: 0,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: WigopeText.h3.copyWith(
              color: WigopeColors.orange600,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            maxLines: 2,
            textAlign: TextAlign.center,
            overflow: TextOverflow.ellipsis,
            style: WigopeText.caption.copyWith(
              color: WigopeColors.navy900,
              letterSpacing: 0,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.leading,
    required this.trailing,
    required this.meta,
  });

  final String leading;
  final String trailing;
  final String meta;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          leading,
          style: WigopeText.h2.copyWith(
            color: WigopeColors.orange600,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(width: 3),
        Flexible(
          child: Container(
            margin: const EdgeInsets.only(bottom: 2),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: WigopeColors.orange600, width: 2),
              ),
            ),
            child: Text(
              trailing,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: WigopeText.h2.copyWith(
                color: WigopeColors.navy900,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ),
        const Spacer(),
        Text(
          meta,
          style: WigopeText.bodyS.copyWith(
            color: WigopeColors.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _RewardPill extends StatelessWidget {
  const _RewardPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.82),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: WigopeColors.orange600, size: 15),
          const SizedBox(width: 6),
          Text(
            label,
            style: WigopeText.caption.copyWith(
              color: WigopeColors.navy900,
              fontWeight: FontWeight.w700,
              letterSpacing: 0,
            ),
          ),
        ],
      ),
    );
  }
}

class _RewardsGrid extends StatelessWidget {
  const _RewardsGrid({
    required this.brands,
    required this.columns,
    required this.itemExtent,
    required this.tileSize,
  });

  final List<_RewardBrand> brands;
  final int columns;
  final double itemExtent;
  final double tileSize;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: EdgeInsets.zero,
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: brands.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: columns,
        crossAxisSpacing: 14,
        mainAxisSpacing: 16,
        mainAxisExtent: itemExtent,
      ),
      itemBuilder: (_, i) {
        final brand = brands[i];
        return WigopeOfferCard(
          brand: brand.name,
          discount: '',
          brandColor: brand.color,
          tileAssetPath: 'assets/brands/${brand.tileAsset}',
          tileSize: tileSize,
          onTap: () => HubbleSdkLauncher.open(context),
        );
      },
    );
  }
}

class _RewardBrand {
  const _RewardBrand(
    this.name,
    this.color,
    this.tileAsset,
  );

  final String name;
  final Color color;
  final String tileAsset;
}

Future<void> _copyReferralLink(BuildContext context) async {
  await Clipboard.setData(
    const ClipboardData(text: 'https://wigope.com/invite/KESHAV7'),
  );
  if (!context.mounted) return;
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(
      content: Text('Referral chain link copied'),
      backgroundColor: WigopeColors.orange600,
    ),
  );
}

class _RewardCategory {
  const _RewardCategory(this.label, this.icon, this.opensSdk);

  final String label;
  final IconData icon;
  final bool opensSdk;
}
