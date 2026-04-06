import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/order.dart';
import '../../services/admin_service.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/app_sidebar.dart';
import '../../widgets/status_badge.dart';

class AdminReportsScreen extends StatefulWidget {
  const AdminReportsScreen({super.key});

  @override
  State<AdminReportsScreen> createState() => _AdminReportsScreenState();
}

class _AdminReportsScreenState extends State<AdminReportsScreen> {
  final _service = AdminService();
  List<Order> _orders = [];
  Map<String, dynamic> _revenue = {};
  List<Map<String, dynamic>> _workload = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _service.getReportOrders(),
        _service.getRevenue(),
        _service.getWorkload(),
      ]);
      _orders = results[0] as List<Order>;
      _revenue = results[1] as Map<String, dynamic>;
      _workload = results[2] as List<Map<String, dynamic>>;
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load reports: $e')),
        );
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  Map<String, List<Order>> get _ordersByMonth {
    final grouped = <String, List<Order>>{};
    for (final order in _orders) {
      final key = DateFormat('yyyy-MM').format(order.createdAt);
      grouped.putIfAbsent(key, () => []).add(order);
    }
    return Map.fromEntries(
      grouped.entries.toList()..sort((a, b) => b.key.compareTo(a.key)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      drawer: const AppSidebar(),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Revenue Summary
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          title: 'Total Revenue',
                          value: '\u20B9${double.tryParse(_revenue['total_revenue']?.toString() ?? '0')?.toStringAsFixed(2) ?? '0.00'}',
                          icon: Icons.attach_money,
                          color: AppColors.success,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: StatCard(
                          title: 'Paid Orders',
                          value: (_revenue['total_orders'] ?? 0).toString(),
                          icon: Icons.receipt,
                          color: AppColors.info,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Staff Workload
                  if (_workload.isNotEmpty) ...[
                    const Text('Staff Workload',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Card(
                      child: DataTable(
                        columns: const [
                          DataColumn(label: Text('Staff')),
                          DataColumn(label: Text('Deliveries')),
                        ],
                        rows: _workload
                            .map((w) => DataRow(cells: [
                                  DataCell(Text('${w['first_name']} ${w['last_name']}')),
                                  DataCell(Text(w['deliveries_completed'].toString())),
                                ]))
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Orders by Month
                  const Text('Orders by Month',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ..._ordersByMonth.entries.map((entry) {
                    final monthLabel = DateFormat('MMMM yyyy')
                        .format(DateTime.parse('${entry.key}-01'));
                    final monthOrders = entry.value;
                    final monthRevenue = monthOrders
                        .where((o) => o.paymentStatus == 'Paid')
                        .fold(0.0, (sum, o) => sum + o.totalCharge);

                    return Card(
                      child: ExpansionTile(
                        title: Text(monthLabel,
                            style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(
                          '${monthOrders.length} orders - \u20B9${monthRevenue.toStringAsFixed(2)} revenue',
                          style: const TextStyle(color: AppColors.textMuted),
                        ),
                        children: monthOrders
                            .map((o) => ListTile(
                                  dense: true,
                                  title: Text(
                                    '#${o.id} - ${o.firstName ?? ''} ${o.lastName ?? ''}',
                                  ),
                                  subtitle: Text(
                                    '${o.laundryType} x${o.noOfItems} - \u20B9${o.totalCharge.toStringAsFixed(2)}',
                                  ),
                                  trailing: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      StatusBadge(status: o.orderStatus),
                                      const SizedBox(height: 4),
                                      StatusBadge(status: o.paymentStatus),
                                    ],
                                  ),
                                ))
                            .toList(),
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }
}
