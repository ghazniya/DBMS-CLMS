import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/order.dart';
import '../../services/staff_service.dart';
import '../../widgets/app_sidebar.dart';
import '../../widgets/order_card.dart';

class StaffHistoryScreen extends StatefulWidget {
  const StaffHistoryScreen({super.key});

  @override
  State<StaffHistoryScreen> createState() => _StaffHistoryScreenState();
}

class _StaffHistoryScreenState extends State<StaffHistoryScreen> {
  final _service = StaffService();
  List<Order> _allOrders = [];
  List<Order> _filtered = [];
  bool _loading = true;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    setState(() => _loading = true);
    try {
      _allOrders = await _service.getHistory();
      _filtered = _allOrders;
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load history: $e')),
        );
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _deleteOrder(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Order'),
        content: Text('Are you sure you want to delete order #$id?'),
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
      await _service.deleteOrder(id);
      _loadHistory();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to delete order: $e')),
        );
      }
    }
  }

  void _onSearch(String query) {
    final q = query.toLowerCase();
    setState(() {
      _filtered = _allOrders.where((o) {
        return o.id.toString().contains(q) ||
            (o.firstName?.toLowerCase().contains(q) ?? false) ||
            (o.lastName?.toLowerCase().contains(q) ?? false) ||
            (o.roomNumber?.toLowerCase().contains(q) ?? false);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order History')),
      drawer: const AppSidebar(),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search by name, room, or order ID...',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchController.clear();
                                _onSearch('');
                              },
                            )
                          : null,
                    ),
                    onChanged: _onSearch,
                  ),
                ),
                Expanded(
                  child: _filtered.isEmpty
                      ? const Center(
                          child: Text('No orders found',
                              style: TextStyle(color: AppColors.textMuted)),
                        )
                      : RefreshIndicator(
                          onRefresh: _loadHistory,
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _filtered.length,
                            itemBuilder: (context, index) {
                              final order = _filtered[index];
                              return OrderCard(
                                order: order,
                                actions: [
                                  SizedBox(
                                    height: 34,
                                    child: ElevatedButton(
                                      onPressed: () => _deleteOrder(order.id),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.danger,
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        textStyle: const TextStyle(fontSize: 13),
                                      ),
                                      child: const Text('Delete'),
                                    ),
                                  ),
                                ],
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
