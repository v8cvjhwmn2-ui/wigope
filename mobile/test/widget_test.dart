import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wigope_pay/app/app.dart';

void main() {
  testWidgets('shows the branded splash screen', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: WigopePayApp()));
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.text('Recharge & Bill Payments'), findsOneWidget);
    expect(find.text('Secured by Wigope'), findsOneWidget);
    expect(find.text('Made in India'), findsOneWidget);
  });
}
