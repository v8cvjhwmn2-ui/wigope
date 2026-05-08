import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'colors.dart';
import 'radii.dart';
import 'typography.dart';

ThemeData buildWigopeLightTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: WigopeColors.orange600,
    brightness: Brightness.light,
    primary: WigopeColors.orange600,
    onPrimary: WigopeColors.textOnOrange,
    surface: WigopeColors.surfaceBase,
    onSurface: WigopeColors.textPrimary,
    error: WigopeColors.error,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: WigopeColors.surfaceBase,
    splashFactory: InkSparkle.splashFactory,
    textTheme: TextTheme(
      displayLarge: WigopeText.displayXL,
      displayMedium: WigopeText.displayL,
      headlineLarge: WigopeText.h1,
      headlineMedium: WigopeText.h2,
      headlineSmall: WigopeText.h3,
      bodyLarge: WigopeText.body,
      bodyMedium: WigopeText.bodyS,
      labelLarge: WigopeText.bodyStrong,
      labelSmall: WigopeText.caption,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: WigopeColors.surfaceBase,
      foregroundColor: WigopeColors.textPrimary,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: WigopeText.h2,
      systemOverlayStyle: SystemUiOverlayStyle.dark,
      shape: const Border(bottom: BorderSide(color: WigopeColors.borderSoft, width: 1)),
    ),
    cardTheme: CardThemeData(
      color: WigopeColors.surfaceCard,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: WigopeRadii.rCard,
        side: const BorderSide(color: WigopeColors.borderSoft),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: WigopeColors.surfaceMuted,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: WigopeRadii.rInput,
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: WigopeRadii.rInput,
        borderSide: const BorderSide(color: WigopeColors.borderSoft),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: WigopeRadii.rInput,
        borderSide: const BorderSide(color: WigopeColors.orange600, width: 1.5),
      ),
      hintStyle: WigopeText.body.copyWith(color: WigopeColors.textTertiary),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        minimumSize: const Size.fromHeight(WigopeHeights.buttonPrimary),
        backgroundColor: WigopeColors.orange600,
        foregroundColor: WigopeColors.textOnOrange,
        shape: RoundedRectangleBorder(borderRadius: WigopeRadii.rButton),
        textStyle: WigopeText.bodyStrong,
        elevation: 0,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size.fromHeight(WigopeHeights.buttonSecondary),
        foregroundColor: WigopeColors.orange600,
        side: const BorderSide(color: WigopeColors.orange600),
        shape: RoundedRectangleBorder(borderRadius: WigopeRadii.rButton),
        textStyle: WigopeText.bodyStrong,
      ),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: WigopeColors.surfaceBase,
      surfaceTintColor: WigopeColors.surfaceBase,
      shape: RoundedRectangleBorder(borderRadius: WigopeRadii.rSheetTop),
      showDragHandle: true,
    ),
    dividerTheme: const DividerThemeData(
      color: WigopeColors.borderSoft,
      thickness: 1,
      space: 1,
    ),
  );
}
