import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import '../auth/application/auth_controller.dart';

class HubbleSdkConfig {
  const HubbleSdkConfig._();

  static const sdkBaseUrl = String.fromEnvironment(
    'HUBBLE_SDK_BASE_URL',
    defaultValue: 'https://sdk.dev.myhubble.money/',
  );

  static const clientId = String.fromEnvironment(
    'HUBBLE_CLIENT_ID',
    defaultValue: 'wigope-dev-sdk-mwcofdsa',
  );

  // Staging SDK secret only. Override with --dart-define for other environments.
  static const clientSecret = String.fromEnvironment(
    'HUBBLE_CLIENT_SECRET',
    defaultValue:
        'a0qmbxpCR9szzJstrtIugXk6BnQmVAIbBbdCV9Ttg9hyHoMNBEVjr3Z3v6sbTd28',
  );

  static const theme = String.fromEnvironment(
    'HUBBLE_THEME',
    defaultValue: 'light',
  );

  static const appVersion = String.fromEnvironment(
    'HUBBLE_APP_VERSION',
    defaultValue: '0.1.0',
  );

  static Uri sdkUri({required String token, String? deepLinkPath}) {
    final base = Uri.parse(sdkBaseUrl);
    return base.replace(
      path: deepLinkPath ?? base.path,
      queryParameters: {
        'clientId': clientId,
        'appSecret': clientSecret,
        'clientSecret': clientSecret,
        'token': token,
        'theme': theme,
        'appVersion': appVersion,
        'deviceId': 'wigope-flutter',
      },
    );
  }

  static Future<String> issueSsoToken(BuildContext context) async {
    final container = ProviderScope.containerOf(context, listen: false);
    final dio = container.read(dioClientProvider).raw;
    final res = await dio.post('/rewards/sso-token');
    return '${res.data['data']['token']}';
  }
}

class HubbleSdkLauncher {
  const HubbleSdkLauncher._();

  static Future<void> open(BuildContext context) async {
    if (!kIsWeb) {
      context.push('/rewards/hubble');
      return;
    }

    Uri uri;
    try {
      final token = await HubbleSdkConfig.issueSsoToken(context);
      uri = HubbleSdkConfig.sdkUri(token: token);
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(
            SnackBar(
              backgroundColor: WigopeColors.error,
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              content: Text(
                'Could not start your Hubble Rewards session.',
                style: WigopeText.body.copyWith(color: Colors.white),
              ),
            ),
          );
      }
      return;
    }
    final opened = await launchUrl(
      uri,
      mode: LaunchMode.platformDefault,
      webOnlyWindowName: '_self',
    );

    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            backgroundColor: WigopeColors.error,
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            content: Text(
              'Could not open Hubble Rewards. Please try again.',
              style: WigopeText.body.copyWith(color: Colors.white),
            ),
          ),
        );
    }
  }
}
