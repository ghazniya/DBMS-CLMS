import '../models/order.dart';
import '../models/charge.dart';
import 'api_client.dart';

class ResidentService {
  final _dio = ApiClient().dio;

  Future<List<Charge>> getCharges() async {
    final response = await _dio.get('/api/resident/charges');
    return (response.data as List).map((j) => Charge.fromJson(j)).toList();
  }

  Future<List<Order>> getOrders() async {
    final response = await _dio.get('/api/resident/orders');
    return (response.data as List).map((j) => Order.fromJson(j)).toList();
  }

  Future<void> confirmDelivery(int orderId) async {
    await _dio.put('/api/resident/orders/$orderId/confirm');
  }
}
