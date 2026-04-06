import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/order.dart';
import '../../models/charge.dart';
import '../../services/resident_service.dart';
import '../../widgets/app_sidebar.dart';
import '../../widgets/order_card.dart';

class ResidentDashboardScreen extends StatefulWidget {
  const ResidentDashboardScreen({super.key});

  @override
  State<ResidentDashboardScreen> createState() => _ResidentDashboardScreenState();
}

class _ResidentDashboardScreenState extends State<ResidentDashboardScreen> {
  final _service = ResidentService();
  List<Order> _orders = [];
  List<Charge> _charges = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _service.getOrders(),
        _service.getCharges(),
      ]);
      _orders = results[0] as List<Order>;
      _charges = results[1] as List<Charge>;
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load orders: $e')),
        );
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _confirmDelivery(int orderId) async {
    try {
      await _service.confirmDelivery(orderId);
      _loadOrders();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to confirm: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      drawer: const AppSidebar(),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadOrders,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  const Text('Available Services',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  if (_charges.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Text('No services available', style: TextStyle(color: AppColors.textMuted)),
                      ),
                    )
                  else
                    Card(
                      child: Column(
                        children: _charges.map((c) => ListTile(
                          leading: const Icon(Icons.local_laundry_service, color: AppColors.primary),
                          title: Text(c.laundryType),
                          trailing: Text(
                            '\u20B9${c.ratePerItem.toStringAsFixed(2)}/item',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.success),
                          ),
                        )).toList(),
                      ),
                    ),
                  const SizedBox(height: 24),
                  Text('My Orders (${_orders.length})',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  if (_orders.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Center(child: Text('No orders yet', style: TextStyle(color: AppColors.textMuted))),
                      ),
                    )
                  else
                    ..._orders.map((order) => OrderCard(
                      order: order,
                      actions: order.orderStatus == 'Ready'
                          ? [
                              ElevatedButton.icon(
                                onPressed: () => _confirmDelivery(order.id),
                                icon: const Icon(Icons.check, size: 18),
                                label: const Text('Confirm Delivery'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.success,
                                ),
                              ),
                            ]
                          : null,
                    )),
                ],
              ),
            ),
    );
  }
}
