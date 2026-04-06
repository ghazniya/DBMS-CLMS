class Charge {
  final String laundryType;
  final double ratePerItem;

  Charge({required this.laundryType, required this.ratePerItem});

  factory Charge.fromJson(Map<String, dynamic> json) {
    return Charge(
      laundryType: json['laundry_type'],
      ratePerItem: double.parse(json['rate_per_item'].toString()),
    );
  }
}
