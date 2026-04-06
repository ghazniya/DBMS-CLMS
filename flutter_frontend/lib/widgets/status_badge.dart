import 'package:flutter/material.dart';
import '../config/theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (color, bgColor) = _getColors();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  (Color, Color) _getColors() {
    switch (status) {
      case 'Pending':
        return (AppColors.warning, AppColors.warning.withValues(alpha: 0.15));
      case 'In Progress':
        return (AppColors.info, AppColors.info.withValues(alpha: 0.15));
      case 'Ready':
        return (AppColors.success, AppColors.success.withValues(alpha: 0.15));
      case 'Delivered':
        return (AppColors.success, AppColors.success.withValues(alpha: 0.15));
      case 'Paid':
        return (AppColors.success, AppColors.success.withValues(alpha: 0.15));
      default:
        return (AppColors.textMuted, AppColors.border);
    }
  }
}
