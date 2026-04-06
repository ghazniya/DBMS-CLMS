import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final _authService = AuthService();

  String? _token;
  String? _role;
  int? _userId;
  bool _isLoading = false;
  String? _error;

  String? get token => _token;
  String? get role => _role;
  int? get userId => _userId;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _token != null;
  String? get error => _error;

  Future<void> tryAutoLogin() async {
    _token = await _authService.getToken();
    _role = await _authService.getRole();
    final id = await _authService.getUserId();
    _userId = id != null ? int.tryParse(id) : null;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _authService.login(email, password);
      _token = data['token'];
      _role = data['role'];
      _userId = data['id'];
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _error = _extractError(e);
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _token = null;
    _role = null;
    _userId = null;
    notifyListeners();
  }

  String _extractError(dynamic e) {
    if (e is Exception) {
      try {
        final dioError = e as dynamic;
        return dioError.response?.data?['message'] ?? 'Login failed';
      } catch (_) {
        return 'Login failed';
      }
    }
    return 'Login failed';
  }
}
