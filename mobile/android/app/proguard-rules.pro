# Flutter and app release hardening.
# R8/ProGuard minification is enabled in release; keep Flutter engine entrypoints intact.
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.plugins.** { *; }

# Dio/OkHttp internals are not used directly by Flutter web, but keep Retrofit-style annotations
# if native plugins add them later.
-keepattributes Signature
-keepattributes RuntimeVisibleAnnotations
