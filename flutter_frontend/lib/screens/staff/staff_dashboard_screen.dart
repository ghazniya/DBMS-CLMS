import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/order.dart';
import '../../models/customer.dart';
import '../../models/charge.dart';
import '../../services/staff_service.dart';
import '../../widgets/app_sidebar.dart';
import '../../widgets/order_card.dart';

class StaffDashboardScreen extends StatefulWidget {
  const StaffDashboardScreen({super.key});

  @override
  State<StaffDashboardScreen> createState() => _StaffDashboardScreenState();
}

class _StaffDashboardScreenState extends State<StaffDashboardScreen> {
  final _service = StaffService();
  List<Order> _orders = [];
  List<Customer> _customers = [];
  List<Charge> _charges = [];
  bool _loading = true;

  // Order form
  int? _selectedCustomerId;
  String? _selectedLaundryType;
  final _itemCountController = TextEditingController(text: '1');
  final _notesController = TextEditingController();

  // Resident form
  final _resEmailController = TextEditingController();
  final _resPasswordController = TextEditingController();
  final _resFirstNameController = TextEditingController();
  final _resLastNameController = TextEditingController();
  final _resRoomController = TextEditingController();
  final _resPhoneController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _itemCountController.dispose();
    _notesController.dispose();
    _resEmailController.dispose();
    _resPasswordController.dispose();
    _resFirstNameController.dispose();
    _resLastNameController.dispose();
    _resRoomController.dispose();
    _resPhoneController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _service.getActiveOrders(),
        _service.getCustomers(),
        _service.getCharges(),
      ]);
      _orders = results[0] as List<Order>;
      _customers = results[1] as List<Customer>;
      _charges = results[2] as List<Charge>;
    } catch (e) {
      _showError('Failed to load data: $e');
    }
    if (mounted) setState(() => _loading = false);
  }

  void _showError(String msg) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    }
  }

  void _showSuccess(String msg) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), backgroundColor: AppColors.success),
      );
    }
  }

  Future<void> _createOrder() async {
    if (_selectedCustomerId == null || _selectedLaundryType == null) {
      _showError('Please select customer and laundry type');
      return;
    }
    try {
      await _service.createOrder({
        'customer_id': _selectedCustomerId,
        'laundry_type': _selectedLaundryType,
        'no_of_items': int.parse(_itemCountController.text),
        'notes': _notesController.text,
      });
      _itemCountController.text = '1';
      _notesController.clear();
      _showSuccess('Order created');
      _loadData();
    } catch (e) {
      _showError('Failed to create order: $e');
    }
  }

  Future<void> _createResident() async {
    if (_resEmailController.text.isEmpty || _resPasswordController.text.isEmpty ||
        _resFirstNameController.text.isEmpty || _resLastNameController.text.isEmpty ||
        _resRoomController.text.isEmpty) {
      _showError('Please fill all required fields');
      return;
    }
    try {
      await _service.createCustomer({
        'email': _resEmailController.text.trim(),
        'password': _resPasswordController.text,
        'first_name': _resFirstNameController.text.trim(),
        'last_name': _resLastNameController.text.trim(),
        'room_number': _resRoomController.text.trim(),
        'phone_number': _resPhoneController.text.trim(),
      });
      _resEmailController.clear();
      _resPasswordController.clear();
      _resFirstNameController.clear();
      _resLastNameController.clear();
      _resRoomController.clear();
      _resPhoneController.clear();
      _showSuccess('Resident created');
      _loadData();
    } catch (e) {
      _showError('Failed to create resident: $e');
    }
  }

  Future<void> _updateStatus(int id, String status) async {
    try {
      await _service.updateOrderStatus(id, status);
      _loadData();
    } catch (e) {
      _showError('Failed to update status: $e');
    }
  }

  Future<void> _updatePayment(int id, String status) async {
    try {
      await _service.updatePaymentStatus(id, status);
      _loadData();
    } catch (e) {
      _showError('Failed to update payment: $e');
    }
  }

  Future<void> _recordDelivery(int id) async {
    try {
      await _service.recordDelivery(id, null);
      _loadData();
    } catch (e) {
      _showError('Failed to record delivery: $e');
    }
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
      _showSuccess('Order deleted');
      _loadData();
    } catch (e) {
      _showError('Failed to delete order: $e');
    }
  }

  List<Widget> _buildOrderActions(Order order) {
    final actions = <Widget>[];
    switch (order.orderStatus) {
      case 'Pending':
        actions.add(_actionButton('Start Wash', AppColors.info,
            () => _updateStatus(order.id, 'In Progress')));
      case 'In Progress':
        actions.add(_actionButton('Mark Ready', AppColors.success,
            () => _updateStatus(order.id, 'Ready')));
      case 'Ready':
        actions.add(_actionButton('Deliver', AppColors.success,
            () => _recordDelivery(order.id)));
    }
    if (order.paymentStatus != 'Paid') {
      actions.add(_actionButton('Mark Paid', AppColors.warning,
          () => _updatePayment(order.id, 'Paid')));
    }
    actions.add(_actionButton('Delete', AppColors.danger,
        () => _deleteOrder(order.id)));
    return actions;
  }

  Widget _actionButton(String label, Color color, VoidCallback onPressed) {
    return SizedBox(
      height: 34,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          textStyle: const TextStyle(fontSize: 13),
        ),
        child: Text(label),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Staff Dashboard')),
      drawer: const AppSidebar(),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Create Resident Section
                  _sectionTitle('Register New Resident'),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(children: [
                            Expanded(child: TextField(controller: _resFirstNameController, decoration: const InputDecoration(labelText: 'First Name'))),
                            const SizedBox(width: 12),
                            Expanded(child: TextField(controller: _resLastNameController, decoration: const InputDecoration(labelText: 'Last Name'))),
                          ]),
                          const SizedBox(height: 12),
                          TextField(controller: _resEmailController, decoration: const InputDecoration(labelText: 'Email')),
                          const SizedBox(height: 12),
                          TextField(controller: _resPasswordController, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
                          const SizedBox(height: 12),
                          Row(children: [
                            Expanded(child: TextField(controller: _resRoomController, decoration: const InputDecoration(labelText: 'Room Number'))),
                            const SizedBox(width: 12),
                            Expanded(child: TextField(controller: _resPhoneController, decoration: const InputDecoration(labelText: 'Phone'))),
                          ]),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(onPressed: _createResident, child: const Text('Create Resident')),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Create Order Section
                  _sectionTitle('Create New Order'),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          DropdownButtonFormField<int>(
                            initialValue: _selectedCustomerId,
                            decoration: const InputDecoration(labelText: 'Customer'),
                            items: _customers.map((c) => DropdownMenuItem(value: c.id, child: Text('${c.fullName} (${c.roomNumber})'))).toList(),
                            onChanged: (v) => setState(() => _selectedCustomerId = v),
                          ),
                          const SizedBox(height: 12),
                          DropdownButtonFormField<String>(
                            initialValue: _selectedLaundryType,
                            decoration: const InputDecoration(labelText: 'Laundry Type'),
                            items: _charges.map((c) => DropdownMenuItem(value: c.laundryType, child: Text('${c.laundryType} (\u20B9${c.ratePerItem}/item)'))).toList(),
                            onChanged: (v) => setState(() => _selectedLaundryType = v),
                          ),
                          const SizedBox(height: 12),
                          TextField(controller: _itemCountController, decoration: const InputDecoration(labelText: 'Number of Items'), keyboardType: TextInputType.number),
                          const SizedBox(height: 12),
                          TextField(controller: _notesController, decoration: const InputDecoration(labelText: 'Notes (optional)'), maxLines: 2),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(onPressed: _createOrder, child: const Text('Submit Order')),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Active Orders
                  _sectionTitle('Active Orders (${_orders.length})'),
                  if (_orders.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Center(child: Text('No active orders', style: TextStyle(color: AppColors.textMuted))),
                      ),
                    )
                  else
                    ..._orders.map((order) => OrderCard(
                          order: order,
                          actions: _buildOrderActions(order),
                        )),
                ],
              ),
            ),
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
    );
  }
}
