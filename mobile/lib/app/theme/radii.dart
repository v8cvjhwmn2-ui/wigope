import 'package:flutter/widgets.dart';

class WigopeRadii {
  WigopeRadii._();

  static const double chip = 12;
  static const double input = 12;
  static const double button = 12;
  static const double card = 16;
  static const double hero = 24;
  static const double sheetTop = 24;

  static const BorderRadius rChip = BorderRadius.all(Radius.circular(chip));
  static const BorderRadius rInput = BorderRadius.all(Radius.circular(input));
  static const BorderRadius rButton = BorderRadius.all(Radius.circular(button));
  static const BorderRadius rCard = BorderRadius.all(Radius.circular(card));
  static const BorderRadius rHero = BorderRadius.all(Radius.circular(hero));
  static const BorderRadius rSheetTop = BorderRadius.only(
    topLeft: Radius.circular(sheetTop),
    topRight: Radius.circular(sheetTop),
  );
}

class WigopeSpacing {
  WigopeSpacing._();

  static const double xxs = 4;
  static const double xs = 8;
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 40;
  static const double huge = 56;
  static const double mega = 80;
}

class WigopeHeights {
  WigopeHeights._();

  static const double buttonPrimary = 52;
  static const double buttonSecondary = 44;
  static const double buttonTertiary = 36;
  static const double input = 52;
  static const double otpBoxW = 48;
  static const double otpBoxH = 56;
}
