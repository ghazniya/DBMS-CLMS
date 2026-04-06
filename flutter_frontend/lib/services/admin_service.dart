import '../models/user.dart';
import '../models/charge.dart';
import '../models/order.dart';
import 'api_client.dart';

class AdminService {
  final _dio = ApiClient().dio;

  Future<List<User>> getUsers() async {
    final response = await _dio.get('/api/admin/users');
    return (response.data as List).map((j) => User.fromJson(j)).toList();
  }

  Future<void> createUser(Map<String, dynamic> data) async {
    await _dio.post('/api/admin/users', data: data);
  }

  Future<void> deleteUser(int id) async {
    await _dio.delete('/api/admin/users/$id');
  }

  Future<List<Charge>> getCharges() async {
    final response = await _dio.get('/api/admin/charges');
    return (response.data as List).map((j) => Charge.fromJson(j)).toList();
  }

  Future<void> upsertCharge(String type, double rate) async {
    await _dio.put('/api/admin/charges/${Uri.encodeComponent(type)}', data: {
      'rate_per_item': rate,
    });
  }

  Future<void> deleteCharge(String type) async {
    await _dio.delete('/api/admin/charges/${Uri.encodeComponent(type)}');
  }

  Future<List<Order>> getReportOrders() async {
    final response = await _dio.get('/api/admin/reports/orders');
    return (response.data as List).map((j) => Order.fromJson(j)).toList();
  }

  Future<Map<String, dynamic>> getRevenue() async {
    final response = await _dio.get('/api/admin/reports/revenue');
    return response.data;
  }

  Future<List<Map<String, dynamic>>> getWorkload() async {
    final response = await _dio.get('/api/admin/reports/workload');
    return List<Map<String, dynamic>>.from(response.data);
  }
}
