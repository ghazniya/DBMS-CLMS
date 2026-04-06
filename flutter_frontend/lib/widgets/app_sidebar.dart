import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';

class AppSidebar extends StatelessWidget {
  const AppSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final role = auth.role ?? '';
    final currentPath = GoRouterState.of(context).uri.toString();

    return Drawer(
      child: Column(
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(color: AppColors.primary),
            child: Center(
              child: Text(
                'CLMS\n${role.toUpperCase()}',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          ..._getLinks(role).map((link) => ListTile(
                leading: Icon(link['icon'] as IconData),
                title: Text(link['name'] as String),
                selected: currentPath == link['path'],
                selectedTileColor: AppColors.primary.withValues(alpha: 0.1),
                selectedColor: AppColors.primary,
                onTap: () {
                  Navigator.pop(context);
                  context.go(link['path'] as String);
                },
              )),
          const Spacer(),
          ListTile(
            leading: const Icon(Icons.logout, color: AppColors.danger),
            title: const Text('Logout', style: TextStyle(color: AppColors.danger)),
            onTap: () async {
              await auth.logout();
              if (context.mounted) context.go('/login');
            },
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getLinks(String role) {
    if (role == 'admin') {
      return [
        {'name': 'Dashboard', 'path': '/admin', 'icon': Icons.dashboard},
        {'name': 'Users', 'path': '/admin/users', 'icon': Icons.people},
        {'name': 'Reports', 'path': '/admin/reports', 'icon': Icons.bar_chart},
      ];
    }
    if (role == 'staff') {
      return [
        {'name': 'Dashboard', 'path': '/staff', 'icon': Icons.dashboard},
        {'name': 'History', 'path': '/staff/history', 'icon': Icons.history},
      ];
    }
    return [
      {'name': 'Dashboard', 'path': '/resident', 'icon': Icons.dashboard},
    ];
  }
}
