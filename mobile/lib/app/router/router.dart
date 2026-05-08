import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/application/auth_controller.dart';
import '../../features/auth/application/auth_state.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/otp_screen.dart';
import '../../features/bbps/bbps_services_screen.dart';
import '../../features/components/components_screen.dart';
import '../../features/dmt/dmt_screen.dart';
import '../../features/kyc/kyc_screen.dart';
import '../../features/margin/margin_list_screen.dart';
import '../../features/notifications/notification_center_screen.dart';
import '../../features/profile/profile_details_screen.dart';
import '../../features/profile/referrals_screen.dart';
import '../../features/profile/settings_screen.dart';
import '../../features/recharge/mobile_recharge_screen.dart';
import '../../features/recharge/service_flow_screen.dart';
import '../../features/rewards/hubble_rewards_screen.dart';
import '../../features/rewards/hubble_webview_screen.dart';
import '../../features/shell/home_shell.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/transactions/transaction_detail_screen.dart';
import '../../features/transactions/transactions_screen.dart';
import '../../features/wallet/wallet_history_screen.dart';
import '../../features/wallet/wallet_topup_screen.dart';

class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const otp = '/otp';
  static const home = '/home';
  static const kyc = '/kyc';
  static const dmt = '/dmt';
  static const margin = '/margin';
  static const bbpsServices = '/bbps-services';
  static const rewards = '/rewards';
  static const hubbleSdk = '/rewards/hubble';
  static const walletHistory = '/wallet/history';
  static const walletTopup = '/wallet/topup';
  static const walletPaymentProcessing = '/wallet/payment-processing';
  static const mobileRecharge = '/recharge/mobile';
  static const serviceFlow = '/service-flow';
  static const transactions = '/transactions';
  static const transactionDetail = '/transactions/detail';
  static const notifications = '/notifications';
  static const profileDetails = '/profile/details';
  static const referrals = '/profile/referrals';
  static const settings = '/profile/settings';
  static const components = '/_/components';
}

const _publicRoutes = {
  AppRoutes.splash,
  AppRoutes.login,
  AppRoutes.otp,
  AppRoutes.components,
};

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.splash,
    refreshListenable: _AuthRefresh(ref),
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final loc = state.uri.path;

      // Initializing → keep user on splash so it can decide.
      if (auth is AuthInitializing) {
        return loc == AppRoutes.splash ? null : AppRoutes.splash;
      }
      // Signed in → never let them sit on auth pages.
      if (auth is AuthSignedIn) {
        if (loc == AppRoutes.splash ||
            loc == AppRoutes.login ||
            loc == AppRoutes.otp) {
          return AppRoutes.home;
        }
        return null;
      }
      // Anything else → signed out / awaiting otp / sending otp.
      if (!_publicRoutes.contains(loc)) return AppRoutes.login;
      // Splash already finished bootstrap — auto-advance to login.
      if (loc == AppRoutes.splash) return AppRoutes.login;
      return null;
    },
    routes: [
      GoRoute(path: AppRoutes.splash, builder: (_, __) => const SplashScreen()),
      GoRoute(path: AppRoutes.login, builder: (_, __) => const LoginScreen()),
      GoRoute(
        path: AppRoutes.otp,
        builder: (_, state) =>
            OtpScreen(mobile: state.uri.queryParameters['m'] ?? ''),
      ),
      GoRoute(path: AppRoutes.home, builder: (_, __) => const HomeShell()),
      GoRoute(path: AppRoutes.kyc, builder: (_, __) => const KycScreen()),
      GoRoute(path: AppRoutes.dmt, builder: (_, __) => const DmtScreen()),
      GoRoute(
          path: AppRoutes.margin, builder: (_, __) => const MarginListScreen()),
      GoRoute(
        path: AppRoutes.bbpsServices,
        builder: (_, __) => const BbpsServicesScreen(),
      ),
      GoRoute(
        path: AppRoutes.rewards,
        builder: (_, __) => const HubbleRewardsScreen(showAppBar: true),
      ),
      GoRoute(
        path: AppRoutes.hubbleSdk,
        builder: (_, __) => const HubbleWebViewScreen(),
      ),
      GoRoute(
        path: AppRoutes.walletHistory,
        builder: (_, __) => const WalletHistoryScreen(),
      ),
      GoRoute(
        path: AppRoutes.walletTopup,
        builder: (_, __) => const WalletTopupScreen(),
      ),
      GoRoute(
        path: AppRoutes.walletPaymentProcessing,
        builder: (_, state) => WalletPaymentProcessingScreen(
          amount: int.tryParse(state.uri.queryParameters['amount'] ?? '') ?? 0,
        ),
      ),
      GoRoute(
        path: AppRoutes.mobileRecharge,
        builder: (_, __) => const MobileRechargeScreen(),
      ),
      GoRoute(
        path: AppRoutes.serviceFlow,
        builder: (_, state) => ServiceFlowScreen(
          title: state.uri.queryParameters['title'] ?? 'Service',
          service: state.uri.queryParameters['service'] ?? 'service',
        ),
      ),
      GoRoute(
        path: AppRoutes.transactions,
        builder: (_, __) => const TransactionsScreen(showBack: true),
      ),
      GoRoute(
        path: '${AppRoutes.transactionDetail}/:id',
        builder: (_, state) => TransactionDetailScreen(
          id: state.pathParameters['id'] ?? '',
        ),
      ),
      GoRoute(
        path: AppRoutes.notifications,
        builder: (_, __) => const NotificationCenterScreen(),
      ),
      GoRoute(
        path: AppRoutes.profileDetails,
        builder: (_, __) => const ProfileDetailsScreen(),
      ),
      GoRoute(
        path: AppRoutes.referrals,
        builder: (_, __) => const ReferralsScreen(),
      ),
      GoRoute(
        path: AppRoutes.settings,
        builder: (_, __) => const SettingsScreen(),
      ),
      GoRoute(
          path: AppRoutes.components,
          builder: (_, __) => const ComponentsScreen()),
    ],
    errorBuilder: (_, state) =>
        Center(child: Text('Route not found: ${state.uri}')),
  );
});

/// Bridges Riverpod's auth state to go_router's `refreshListenable` so
/// transitions trigger a redirect re-evaluation.
class _AuthRefresh extends ChangeNotifier {
  _AuthRefresh(Ref ref) {
    _sub = ref.listen<AuthState>(
        authControllerProvider, (_, __) => notifyListeners());
  }
  late final ProviderSubscription<AuthState> _sub;

  @override
  void dispose() {
    _sub.close();
    super.dispose();
  }
}
