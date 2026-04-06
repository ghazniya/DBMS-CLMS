class Order {
  final int id;
  final int customerId;
  final String laundryType;
  final int noOfItems;
  final String? notes;
  final String orderStatus;
  final String paymentStatus;
  final double totalCharge;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? firstName;
  final String? lastName;
  final String? roomNumber;

  Order({
    required this.id,
    required this.customerId,
    required this.laundryType,
    required this.noOfItems,
    this.notes,
    required this.orderStatus,
    required this.paymentStatus,
    required this.totalCharge,
    required this.createdAt,
    required this.updatedAt,
    this.firstName,
    this.lastName,
    this.roomNumber,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      customerId: json['customer_id'],
      laundryType: json['laundry_type'],
      noOfItems: json['no_of_items'],
      notes: json['notes'],
      orderStatus: json['order_status'],
      paymentStatus: json['payment_status'],
      totalCharge: double.parse(json['total_charge'].toString()),
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      firstName: json['first_name'],
      lastName: json['last_name'],
      roomNumber: json['room_number'],
    );
  }
}
