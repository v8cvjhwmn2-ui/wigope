import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'router/router.dart';
import 'theme/theme.dart';

class WigopePayApp extends ConsumerWidget {
  const WigopePayApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Wigope — Recharge & Bill Payments',
      debugShowCheckedModeBanner: false,
      theme: buildWigopeLightTheme(),
      themeMode: ThemeMode.light,
      locale: const Locale('en'),
      supportedLocales: const [Locale('en'), Locale('hi')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      routerConfig: ref.watch(appRouterProvider),
    );
  }
}
