import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/user.dart';
import '../../services/admin_service.dart';
import '../../widgets/app_sidebar.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final _service = AdminService();
  List<User> _users = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _loading = true);
    try {
      _users = await _service.getUsers();
    } catch (e) {
      _showError('Failed to load users: $e');
    }
    if (mounted) setState(() => _loading = false);
  }

  void _showError(String msg) {
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _deleteUser(User user) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete User'),
        content: Text('Are you sure you want to delete ${user.email}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await _service.deleteUser(user.id);
      _loadUsers();
    } catch (e) {
      _showError('Failed to delete user: $e');
    }
  }

  void _showCreateDialog() {
    String role = 'staff';
    final email = TextEditingController();
    final password = TextEditingController();
    final firstName = TextEditingController();
    final lastName = TextEditingController();
    final roomNumber = TextEditingController();
    final phone = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Create User'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  initialValue: role,
                  decoration: const InputDecoration(labelText: 'Role'),
                  items: ['resident', 'staff', 'admin']
                      .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                      .toList(),
                  onChanged: (v) => setDialogState(() => role = v!),
                ),
                const SizedBox(height: 12),
                TextField(controller: email, decoration: const InputDecoration(labelText: 'Email')),
                const SizedBox(height: 12),
                TextField(controller: password, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
                const SizedBox(height: 12),
                TextField(controller: firstName, decoration: const InputDecoration(labelText: 'First Name')),
                const SizedBox(height: 12),
                TextField(controller: lastName, decoration: const InputDecoration(labelText: 'Last Name')),
                if (role == 'resident') ...[
                  const SizedBox(height: 12),
                  TextField(controller: roomNumber, decoration: const InputDecoration(labelText: 'Room Number')),
                ],
                if (role != 'admin') ...[
                  const SizedBox(height: 12),
                  TextField(controller: phone, decoration: const InputDecoration(labelText: 'Phone Number')),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                try {
                  await _service.createUser({
                    'email': email.text.trim(),
                    'password': password.text,
                    'role': role,
                    'first_name': firstName.text.trim(),
                    'last_name': lastName.text.trim(),
                    'room_number': roomNumber.text.trim(),
                    'phone_number': phone.text.trim(),
                  });
                  if (ctx.mounted) Navigator.pop(ctx);
                  _loadUsers();
                } catch (e) {
                  _showError('Failed to create user: $e');
                }
              },
              child: const Text('Create'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Management')),
      drawer: const AppSidebar(),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.person_add, color: Colors.white),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadUsers,
              child: _users.isEmpty
                  ? const Center(child: Text('No users'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _users.length,
                      itemBuilder: (context, index) {
                        final user = _users[index];
                        return Card(
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: _roleColor(user.role),
                              child: Text(
                                user.role[0].toUpperCase(),
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ),
                            title: Text(user.email),
                            subtitle: Text(
                              '${user.role.toUpperCase()} - Created ${user.createdAt != null ? DateFormat.yMMMd().format(user.createdAt!) : "N/A"}',
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete, color: AppColors.danger),
                              onPressed: () => _deleteUser(user),
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }

  Color _roleColor(String role) {
    switch (role) {
      case 'admin':
        return AppColors.danger;
      case 'staff':
        return AppColors.info;
      default:
        return AppColors.success;
    }
  }
}
