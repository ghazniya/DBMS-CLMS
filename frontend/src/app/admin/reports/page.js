"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AdminReports() {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || localStorage.getItem('role') !== 'admin') {
      router.push('/');
      return;
    }

    fetch('http://localhost:5000/api/admin/reports/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error);
  }, [router]);

  const monthlyData = {};
  orders.forEach(o => {
    const d = new Date(o.created_at);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthStr]) monthlyData[monthStr] = { revenue: 0, orders: [] };
    monthlyData[monthStr].orders.push(o);
    if (o.payment_status === 'Paid') {
      monthlyData[monthStr].revenue += Number(o.total_charge);
    }
  });
  const sortedMonths = Object.keys(monthlyData).sort().reverse();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar role="admin" />
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Financial Reports</h1>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Monthly Revenue & Orders</h2>
        {sortedMonths.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No orders have been recorded yet.</p>}
        {sortedMonths.map(month => (
          <div key={month} className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{month}</h3>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Revenue (Paid): <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.1rem' }}>${monthlyData[month].revenue.toFixed(2)}</span></p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Total Orders: {monthlyData[month].orders.length}</p>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--background)' }}>
                    <th style={{ padding: '0.75rem' }}>Order #</th>
                    <th style={{ padding: '0.75rem' }}>Date</th>
                    <th style={{ padding: '0.75rem' }}>Resident</th>
                    <th style={{ padding: '0.75rem' }}>Items</th>
                    <th style={{ padding: '0.75rem' }}>Total</th>
                    <th style={{ padding: '0.75rem' }}>Payment</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData[month].orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>#{o.id}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem' }}>{o.first_name} {o.last_name || ''}</td>
                      <td style={{ padding: '0.75rem' }}>{o.no_of_items}x {o.laundry_type}</td>
                      <td style={{ padding: '0.75rem' }}>${Number(o.total_charge).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', color: o.payment_status === 'Paid' ? 'var(--success)' : 'var(--warning)' }}>{o.payment_status}</td>
                      <td style={{ padding: '0.75rem' }}>{o.order_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
