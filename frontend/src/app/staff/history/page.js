"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function StaffHistory() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || localStorage.getItem('role') !== 'staff') {
      router.push('/');
      return;
    }

    fetch('/api/staff/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error);
  }, []);

  const filteredOrders = orders.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
    const roomNum = o.room_number ? String(o.room_number).toLowerCase() : '';
    const orderId = String(o.id);
    return fullName.includes(searchLower) || roomNum.includes(searchLower) || orderId.includes(searchLower);
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar role="staff" />
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Staff Dashboard - History</h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>All Orders History</h2>
          <div>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search resident name, room, or order #..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem 1rem', width: '300px' }}
            />
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Order #</th>
                <th style={{ padding: '1rem' }}>Resident Name</th>
                <th style={{ padding: '1rem' }}>Room</th>
                <th style={{ padding: '1rem' }}>Items</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{o.id}</td>
                  <td style={{ padding: '1rem' }}>{o.first_name} {o.last_name}</td>
                  <td style={{ padding: '1rem' }}>{o.room_number}</td>
                  <td style={{ padding: '1rem' }}>{o.no_of_items} {o.laundry_type}</td>
                  <td style={{ padding: '1rem' }}>Rs.{Number(o.total_charge).toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                      <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.875rem',
                      background: o.order_status === 'Pending' ? 'var(--warning)' : o.order_status === 'Delivered' ? 'var(--success)' : 'var(--info)',
                      color: 'white'
                    }}>
                      {o.order_status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No historical orders match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
