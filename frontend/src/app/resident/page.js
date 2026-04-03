"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ResidentDashboard() {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || localStorage.getItem('role') !== 'resident') {
      router.push('/');
      return;
    }

    fetch('http://localhost:5000/api/resident/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar role="resident" />
      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>My Laundry</h1>
            <button className="btn btn-primary" onClick={() => alert("Redirecting to New Request form...")}>+ New Request</button>
        </div>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Order History</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Order #</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Items</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{o.id}</td>
                  <td style={{ padding: '1rem' }}>{o.laundry_type}</td>
                  <td style={{ padding: '1rem' }}>{o.no_of_items}</td>
                  <td style={{ padding: '1rem' }}>
                      <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.875rem',
                      background: o.order_status === 'Pending' ? 'var(--warning)' : o.order_status === 'Ready' ? 'var(--success)' : 'var(--info)',
                      color: 'white'
                    }}>
                      {o.order_status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>${o.total_charge}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>You have no laundry history.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
