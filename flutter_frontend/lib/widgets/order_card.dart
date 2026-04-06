import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';
import '../models/order.dart';
import 'status_badge.dart';

class OrderCard extends StatelessWidget {
  final Order order;
  final List<Widget>? actions;

  const OrderCard({super.key, required this.order, this.actions});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Order #${order.id}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                StatusBadge(status: order.orderStatus),
              ],
            ),
            const SizedBox(height: 8),
            if (order.firstName != null)
              Text(
                '${order.firstName} ${order.lastName} - Room ${order.roomNumber}',
                style: const TextStyle(color: AppColors.textMuted),
              ),
            const SizedBox(height: 4),
            Text('${order.laundryType} - ${order.noOfItems} items'),
            Text(
              'Total: \u20B9${order.totalCharge.toStringAsFixed(2)}',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            Row(
              children: [
                const Text('Payment: ', style: TextStyle(color: AppColors.textMuted)),
                StatusBadge(status: order.paymentStatus),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt.toLocal()),
              style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            if (order.notes != null && order.notes!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  'Notes: ${order.notes}',
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            if (actions != null && actions!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(spacing: 8, runSpacing: 8, children: actions!),
            ],
          ],
        ),
      ),
    );
  }
}
