class Customer {
  final int id;
  final String firstName;
  final String lastName;
  final String roomNumber;

  Customer({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.roomNumber,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      roomNumber: json['room_number'],
    );
  }

  String get fullName => '$firstName $lastName';
}
