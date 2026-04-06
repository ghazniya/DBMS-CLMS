import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/admin/admin_dashboard_screen.dart';
import 'screens/admin/admin_users_screen.dart';
import 'screens/admin/admin_reports_screen.dart';
import 'screens/staff/staff_dashboard_screen.dart';
import 'screens/staff/staff_history_screen.dart';
import 'screens/resident/resident_dashboard_screen.dart';

class CLMSApp extends StatelessWidget {
  const CLMSApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    final router = GoRouter(
      initialLocation: '/login',
      redirect: (context, state) {
        final loggedIn = auth.isLoggedIn;
        final onLogin = state.uri.toString() == '/login';

        if (!loggedIn && !onLogin) return '/login';
        if (loggedIn && onLogin) {
          switch (auth.role) {
            case 'admin':
              return '/admin';
            case 'staff':
              return '/staff';
            default:
              return '/resident';
          }
        }
        return null;
      },
      routes: [
        GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
        GoRoute(path: '/admin', builder: (_, _) => const AdminDashboardScreen()),
        GoRoute(path: '/admin/users', builder: (_, _) => const AdminUsersScreen()),
        GoRoute(path: '/admin/reports', builder: (_, _) => const AdminReportsScreen()),
        GoRoute(path: '/staff', builder: (_, _) => const StaffDashboardScreen()),
        GoRoute(path: '/staff/history', builder: (_, _) => const StaffHistoryScreen()),
        GoRoute(path: '/resident', builder: (_, _) => const ResidentDashboardScreen()),
      ],
    );

    return MaterialApp.router(
      title: 'CLMS',
      theme: AppTheme.theme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
