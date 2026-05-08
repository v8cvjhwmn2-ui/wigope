import 'package:flutter/material.dart';

/// Slow diagonal "shine" sweep — used over the wallet hero card to give it a
/// premium, almost holographic feel. Loops every 6 seconds.
class ShineSweep extends StatefulWidget {
  const ShineSweep({
    super.key,
    required this.child,
    this.borderRadius,
    this.duration = const Duration(seconds: 6),
  });

  final Widget child;
  final BorderRadius? borderRadius;
  final Duration duration;

  @override
  State<ShineSweep> createState() => _ShineSweepState();
}

class _ShineSweepState extends State<ShineSweep>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl =
      AnimationController(vsync: this, duration: widget.duration)..repeat();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final shape = widget.borderRadius ?? BorderRadius.zero;
    return ClipRRect(
      borderRadius: shape,
      child: Stack(
        children: [
          widget.child,
          Positioned.fill(
            child: IgnorePointer(
              child: AnimatedBuilder(
                animation: _ctrl,
                builder: (_, __) {
                  // sweep travels from -1.4 → 1.4 on x axis
                  final t = _ctrl.value;
                  return ShaderMask(
                    blendMode: BlendMode.srcATop,
                    shaderCallback: (rect) {
                      return LinearGradient(
                        begin: Alignment(-1.4 + t * 2.8, -1),
                        end: Alignment(-0.4 + t * 2.8, 1),
                        colors: const [
                          Color(0x00FFFFFF),
                          Color(0x40FFFFFF),
                          Color(0x00FFFFFF),
                        ],
                        stops: const [0.0, 0.5, 1.0],
                      ).createShader(rect);
                    },
                    child: Container(color: Colors.white.withOpacity(0.001)),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
