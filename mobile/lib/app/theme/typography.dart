import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class WigopeText {
  WigopeText._();

  static const _tabular = [FontFeature.tabularFigures()];

  static TextStyle displayXL = GoogleFonts.plusJakartaSans(
    fontSize: 44,
    height: 52 / 44,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.03 * 44,
    color: WigopeColors.textPrimary,
  );

  static TextStyle displayL = GoogleFonts.plusJakartaSans(
    fontSize: 32,
    height: 40 / 32,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.02 * 32,
    color: WigopeColors.textPrimary,
  );

  static TextStyle h1 = GoogleFonts.inter(
    fontSize: 24,
    height: 32 / 24,
    fontWeight: FontWeight.w700,
    color: WigopeColors.textPrimary,
  );

  static TextStyle h2 = GoogleFonts.inter(
    fontSize: 20,
    height: 28 / 20,
    fontWeight: FontWeight.w600,
    color: WigopeColors.textPrimary,
  );

  static TextStyle h3 = GoogleFonts.inter(
    fontSize: 17,
    height: 24 / 17,
    fontWeight: FontWeight.w600,
    color: WigopeColors.textPrimary,
  );

  static TextStyle body = GoogleFonts.inter(
    fontSize: 15,
    height: 22 / 15,
    fontWeight: FontWeight.w400,
    color: WigopeColors.textPrimary,
  );

  static TextStyle bodyStrong = GoogleFonts.inter(
    fontSize: 15,
    height: 22 / 15,
    fontWeight: FontWeight.w500,
    color: WigopeColors.textPrimary,
  );

  static TextStyle bodyS = GoogleFonts.inter(
    fontSize: 13,
    height: 20 / 13,
    fontWeight: FontWeight.w400,
    color: WigopeColors.textSecondary,
  );

  static TextStyle caption = GoogleFonts.inter(
    fontSize: 11,
    height: 16 / 11,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.06 * 11,
    color: WigopeColors.textTertiary,
  );

  /// Caveat — use ONLY for tagline accents (splash, empty states).
  static TextStyle script = GoogleFonts.caveat(
    fontSize: 24,
    height: 28 / 24,
    fontWeight: FontWeight.w400,
    color: WigopeColors.navy900,
  );

  /// Tabular numerics for ₹ amounts.
  static TextStyle amount(double size, {FontWeight w = FontWeight.w700, Color? color}) =>
      GoogleFonts.inter(
        fontSize: size,
        fontWeight: w,
        fontFeatures: _tabular,
        color: color ?? WigopeColors.textPrimary,
      );
}
