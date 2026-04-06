import '../models/order.dart';
import '../models/customer.dart';
import '../models/charge.dart';
import 'api_client.dart';

class StaffService {
  final _dio = ApiClient().dio;

  Future<List<Order>> getActiveOrders() async {
    final response = await _dio.get('/api/staff/orders');
    return (response.data as List).map((j) => Order.fromJson(j)).toList();
  }

  Future<List<Order>> getHistory() async {
    final response = await _dio.get('/api/staff/history');
    return (response.data as List).map((j) => Order.fromJson(j)).toList();
  }

  Future<void> createOrder(Map<String, dynamic> data) async {
    await _dio.post('/api/staff/orders', data: data);
  }

  Future<void> deleteOrder(int id) async {
    await _dio.delete('/api/staff/orders/$id');
  }

  Future<void> updateOrderStatus(int id, String status) async {
    await _dio.put('/api/staff/orders/$id/status', data: {'status': status});
  }

  Future<void> updatePaymentStatus(int id, String status) async {
    await _dio.put('/api/staff/orders/$id/payment', data: {'payment_status': status});
  }

  Future<void> recordDelivery(int id, String? notes) async {
    await _dio.post('/api/staff/orders/$id/delivery', data: {'notes': notes ?? ''});
  }

  Future<List<Customer>> getCustomers() async {
    final response = await _dio.get('/api/staff/customers');
    return (response.data as List).map((j) => Customer.fromJson(j)).toList();
  }

  Future<void> createCustomer(Map<String, dynamic> data) async {
    await _dio.post('/api/staff/customers', data: data);
  }

  Future<List<Charge>> getCharges() async {
    final response = await _dio.get('/api/staff/charges');
    return (response.data as List).map((j) => Charge.fromJson(j)).toList();
  }
}
