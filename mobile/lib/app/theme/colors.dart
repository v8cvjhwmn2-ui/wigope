import 'package:flutter/material.dart';

/// Wigope brand color tokens. Source of truth: docs/BRAND.md.
/// Never hardcode color literals in feature code — always reference these.
class WigopeColors {
  WigopeColors._();

  // Orange — primary brand
  static const orange600 = Color(0xFFF97316);
  static const orange500 = Color(0xFFFF8A3D);
  static const orange400 = Color(0xFFFFA968);
  static const orange50 = Color(0xFFFFF4ED);

  // Navy — text + headlines
  static const navy900 = Color(0xFF0A1628);
  static const navy800 = Color(0xFF142238);
  static const navy700 = Color(0xFF1F3050);

  // Surfaces
  static const surfaceBase = Color(0xFFFFFFFF);
  static const surfaceSoft = Color(0xFFFAFBFC);
  static const surfaceCard = Color(0xFFFFFFFF);
  static const surfaceMuted = Color(0xFFF4F5F8);

  // Borders
  static const borderSoft = Color(0xFFE8EAF0);
  static const borderDefault = Color(0xFFD5D9E2);

  // Text
  static const textPrimary = navy900;
  static const textSecondary = Color(0xFF4A5670);
  static const textTertiary = Color(0xFF8089A0);
  static const textOnOrange = Color(0xFFFFFFFF);

  // Semantic
  static const success = Color(0xFF10B981);
  static const successBg = Color(0xFFECFDF5);
  static const warning = Color(0xFFF59E0B);
  static const warningBg = Color(0xFFFFFBEB);
  static const error = Color(0xFFEF4444);
  static const errorBg = Color(0xFFFEF2F2);
  static const info = Color(0xFF3B82F6);
  static const infoBg = Color(0xFFEFF6FF);

  // Signature gradients — use sparingly for hero/wow moments.
  static const gradOrange = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF97316), Color(0xFFFF6A00)],
  );

  static const gradOrangeSoft = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFFF4ED), Color(0xFFFFE4D1)],
  );

  static const gradNavy = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0A1628), Color(0xFF1F3050)],
  );
}
