import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';

class AuthService {
  final _dio = ApiClient().dio;
  final _storage = const FlutterSecureStorage();

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/api/auth/login', data: {
      'email': email,
      'password': password,
    });
    final data = response.data;
    await _storage.write(key: 'token', value: data['token']);
    await _storage.write(key: 'role', value: data['role']);
    await _storage.write(key: 'userId', value: data['id'].toString());
    return data;
  }

  Future<void> logout() async {
    await _storage.deleteAll();
  }

  Future<String?> getToken() => _storage.read(key: 'token');
  Future<String?> getRole() => _storage.read(key: 'role');
  Future<String?> getUserId() => _storage.read(key: 'userId');
}
