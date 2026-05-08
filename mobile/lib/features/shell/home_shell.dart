import 'package:flutter/material.dart';

import '../../app/theme/colors.dart';
import '../../shared/scaffolds/wigope_bottom_nav.dart';
import '../home/home_screen.dart';
import '../profile/profile_screen.dart';
import '../rewards/hubble_rewards_screen.dart';
import '../transactions/transactions_screen.dart';

/// Holds the bottom dock. Tabs are preserved per index.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  static const _tabs = <Widget>[
    HomeScreen(),
    HubbleRewardsScreen(),
    TransactionsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WigopeColors.surfaceSoft,
      body: IndexedStack(index: _index, children: _tabs),
      bottomNavigationBar: WigopeBottomNav(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
      ),
    );
  }
}
