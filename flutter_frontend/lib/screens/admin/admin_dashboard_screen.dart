import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/charge.dart';
import '../../models/order.dart';
import '../../models/user.dart';
import '../../services/admin_service.dart';
import '../../widgets/app_sidebar.dart';
import '../../widgets/stat_card.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final _service = AdminService();
  List<User> _users = [];
  List<Charge> _charges = [];
  List<Order> _orders = [];
  bool _loading = true;

  final _typeController = TextEditingController();
  final _rateController = TextEditingController();
  String? _editingType;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _typeController.dispose();
    _rateController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _service.getUsers(),
        _service.getCharges(),
        _service.getReportOrders(),
      ]);
      _users = results[0] as List<User>;
      _charges = results[1] as List<Charge>;
      _orders = results[2] as List<Order>;
    } catch (e) {
      _showError('Failed to load data: $e');
    }
    if (mounted) setState(() => _loading = false);
  }

  void _showError(String msg) {
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  double get _totalRevenue =>
      _orders.where((o) => o.paymentStatus == 'Paid').fold(0.0, (sum, o) => sum + o.totalCharge);

  Future<void> _saveCharge() async {
    final type = _editingType ?? _typeController.text.trim();
    final rate = double.tryParse(_rateController.text);
    if (type.isEmpty || rate == null || rate < 0) {
      _showError('Enter valid type and rate');
      return;
    }
    try {
      await _service.upsertCharge(type, rate);
      _typeController.clear();
      _rateController.clear();
      _editingType = null;
      _loadData();
    } catch (e) {
      _showError('Failed to save charge: $e');
    }
  }

  Future<void> _deleteCharge(String type) async {
    try {
      await _service.deleteCharge(type);
      _loadData();
    } catch (e) {
      _showError('Failed to delete: $e');
    }
  }

  void _startEdit(Charge charge) {
    setState(() {
      _editingType = charge.laundryType;
      _typeController.text = charge.laundryType;
      _rateController.text = charge.ratePerItem.toString();
    });
  }

  void _cancelEdit() {
    setState(() {
      _editingType = null;
      _typeController.clear();
      _rateController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Dashboard')),
      drawer: const AppSidebar(),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Stat Cards
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          title: 'Total Users',
                          value: _users.length.toString(),
                          icon: Icons.people,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: StatCard(
                          title: 'Total Revenue',
                          value: '\u20B9${_totalRevenue.toStringAsFixed(2)}',
                          icon: Icons.attach_money,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  StatCard(
                    title: 'Total Orders',
                    value: _orders.length.toString(),
                    icon: Icons.receipt_long,
                    color: AppColors.info,
                  ),
                  const SizedBox(height: 24),

                  // Charge Management
                  const Text('Laundry Services',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          TextField(
                            controller: _typeController,
                            decoration: const InputDecoration(labelText: 'Laundry Type'),
                            enabled: _editingType == null,
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _rateController,
                            decoration: const InputDecoration(labelText: 'Rate per Item'),
                            keyboardType: TextInputType.number,
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: _saveCharge,
                                  child: Text(_editingType != null ? 'Update' : 'Add Service'),
                                ),
                              ),
                              if (_editingType != null) ...[
                                const SizedBox(width: 8),
                                TextButton(onPressed: _cancelEdit, child: const Text('Cancel')),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Charges Table
                  if (_charges.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Center(child: Text('No services configured')),
                      ),
                    )
                  else
                    ..._charges.map((c) => Card(
                          child: ListTile(
                            title: Text(c.laundryType),
                            subtitle: Text('\u20B9${c.ratePerItem.toStringAsFixed(2)} per item'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit, size: 20),
                                  onPressed: () => _startEdit(c),
                                  color: AppColors.primary,
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete, size: 20),
                                  onPressed: () => _deleteCharge(c.laundryType),
                                  color: AppColors.danger,
                                ),
                              ],
                            ),
                          ),
                        )),
                ],
              ),
            ),
    );
  }
}
