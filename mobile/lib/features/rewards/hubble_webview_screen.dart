import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../app/theme/colors.dart';
import '../../app/theme/typography.dart';
import 'hubble_sdk.dart';

/// Inline Hubble SDK host. Loads `HubbleSdkConfig.sdkUri()` in a WebView and
/// bridges SDK events (`app_ready`, `close`, `error`, `analytics`) to native
/// via a single `HubbleBridge` JavaScript channel.
///
/// SDK contract: the SDK posts messages via `window.parent.postMessage(...)`
/// (web/iframe) and the same `window.postMessage` API works under Flutter
/// because `webview_flutter` reroutes the parent target to the WebView itself.
/// We attach an in-page listener that forwards every postMessage payload to
/// the `HubbleBridge` channel as JSON.
class HubbleWebViewScreen extends StatefulWidget {
  const HubbleWebViewScreen({super.key, this.deepLinkPath});

  /// Optional deep link, e.g. `/buy/{brandId}` or `/transactions`.
  final String? deepLinkPath;

  @override
  State<HubbleWebViewScreen> createState() => _HubbleWebViewScreenState();
}

class _HubbleWebViewScreenState extends State<HubbleWebViewScreen> {
  late final WebViewController _controller;
  bool _appReady = false;
  bool _hardError = false;
  String? _errorMessage;
  int _progress = 0;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(WigopeColors.surfaceBase)
      ..addJavaScriptChannel('HubbleBridge', onMessageReceived: _onSdkMessage)
      ..setNavigationDelegate(NavigationDelegate(
        onProgress: (p) {
          if (mounted) setState(() => _progress = p);
        },
        onPageFinished: (_) async {
          // Forward every postMessage from the SDK into our JS channel.
          await _controller.runJavaScript('''
            (function() {
              if (window.__wigopeBridgeInstalled) return;
              window.__wigopeBridgeInstalled = true;
              window.addEventListener('message', function(e) {
                try {
                  HubbleBridge.postMessage(JSON.stringify(e.data));
                } catch (err) { /* swallow */ }
              });
            })();
          ''');
        },
        onWebResourceError: (err) {
          if (!mounted) return;
          setState(() {
            _hardError = true;
            _errorMessage = err.description;
          });
        },
        onNavigationRequest: (req) {
          // Let `intent://` and `upi://` and `tel:` etc. fall through to the OS.
          // Hubble triggers UPI app launches via these custom schemes.
          if (req.url.startsWith('http')) return NavigationDecision.navigate;
          return NavigationDecision.prevent;
        },
      ))
      ..loadRequest(_target());
  }

  Uri _target() {
    final base = HubbleSdkConfig.sdkUri();
    if (widget.deepLinkPath == null || widget.deepLinkPath!.isEmpty)
      return base;
    // Hubble deep links use a path *before* the query string. Rebuild the URI
    // so the existing query params are preserved.
    return HubbleSdkConfig.sdkUri(deepLinkPath: widget.deepLinkPath!);
  }

  void _onSdkMessage(JavaScriptMessage msg) {
    Map<String, dynamic>? payload;
    try {
      final raw = jsonDecode(msg.message);
      if (raw is Map<String, dynamic>) payload = raw;
    } catch (_) {
      return;
    }
    if (payload == null) return;

    final type = payload['type'] as String?;
    final event = payload['event'] as String?;

    if (type == 'action') {
      switch (event) {
        case 'app_ready':
          if (mounted) setState(() => _appReady = true);
          break;
        case 'close':
          if (mounted) Navigator.of(context).maybePop();
          break;
        case 'error':
          if (mounted) {
            setState(() {
              _hardError = true;
              _errorMessage = (payload?['properties']?['message'] as String?) ??
                  'Hubble reported an error.';
            });
          }
          break;
      }
    } else if (type == 'analytics') {
      // Hook your analytics provider here. Surface critical events to the user
      // only on hard failure paths — the SDK itself handles the success UI.
      // ignore: avoid_print
      assert(() {
        debugPrint(
            '[Hubble analytics] $event ${payload?['properties'] ?? const {}}');
        return true;
      }());
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: WigopeColors.surfaceBase,
        body: SafeArea(
          child: Column(
            children: [
              _Header(onClose: () => Navigator.of(context).maybePop()),
              if (_progress < 100 && !_appReady) _Progress(value: _progress),
              Expanded(
                child: Stack(
                  children: [
                    WebViewWidget(controller: _controller),
                    if (!_appReady && !_hardError) const _LoadingVeil(),
                    if (_hardError) _ErrorOverlay(message: _errorMessage),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── chrome ─────────────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  const _Header({required this.onClose});
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: const BoxDecoration(
        color: WigopeColors.surfaceBase,
        border: Border(bottom: BorderSide(color: WigopeColors.borderSoft)),
      ),
      child: Row(
        children: [
          IconButton(
            icon:
                const Icon(PhosphorIconsRegular.x, color: WigopeColors.navy900),
            onPressed: onClose,
          ),
          const SizedBox(width: 4),
          Text('Gift Cards & Vouchers', style: WigopeText.h3),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: WigopeColors.orange50,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(PhosphorIconsBold.lightning,
                    size: 12, color: WigopeColors.orange600),
                const SizedBox(width: 4),
                Text(
                  'Powered by Hubble',
                  style: WigopeText.caption.copyWith(
                    color: WigopeColors.orange600,
                    letterSpacing: 0.04 * 11,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
    );
  }
}

class _Progress extends StatelessWidget {
  const _Progress({required this.value});
  final int value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 2,
      child: LinearProgressIndicator(
        value: value / 100,
        backgroundColor: WigopeColors.surfaceMuted,
        valueColor: const AlwaysStoppedAnimation(WigopeColors.orange600),
      ),
    );
  }
}

class _LoadingVeil extends StatelessWidget {
  const _LoadingVeil();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: WigopeColors.surfaceBase,
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: WigopeColors.orange50,
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Icon(PhosphorIconsBold.gift,
                color: WigopeColors.orange600, size: 26),
          ),
          const SizedBox(height: 16),
          const SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(
                strokeWidth: 2.4, color: WigopeColors.orange600),
          ),
          const SizedBox(height: 12),
          Text('Loading Hubble Rewards…',
              style:
                  WigopeText.bodyS.copyWith(color: WigopeColors.textSecondary)),
        ],
      ),
    );
  }
}

class _ErrorOverlay extends StatelessWidget {
  const _ErrorOverlay({required this.message});
  final String? message;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: WigopeColors.surfaceBase,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              color: WigopeColors.errorBg,
              shape: BoxShape.circle,
            ),
            child: const Icon(PhosphorIconsBold.warningCircle,
                size: 44, color: WigopeColors.error),
          ),
          const SizedBox(height: 18),
          Text("Hubble couldn't load", style: WigopeText.h2),
          const SizedBox(height: 8),
          Text(
            message?.isNotEmpty == true
                ? message!
                : 'Please try again in a moment.',
            textAlign: TextAlign.center,
            style: WigopeText.bodyS.copyWith(color: WigopeColors.textSecondary),
          ),
          const SizedBox(height: 22),
          OutlinedButton.icon(
            onPressed: () => Navigator.of(context).maybePop(),
            icon: const Icon(PhosphorIconsBold.arrowLeft, size: 16),
            label: const Text('Back to Wigope'),
            style: OutlinedButton.styleFrom(
              foregroundColor: WigopeColors.orange600,
              side: const BorderSide(color: WigopeColors.orange600),
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }
}
