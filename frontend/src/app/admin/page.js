"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [charges, setCharges] = useState([]);
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [newCharge, setNewCharge] = useState({ laundry_type: '', rate_per_item: '' });
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || localStorage.getItem('role') !== 'admin') {
      router.push('/');
      return;
    }

    fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(console.error);

    fetch('/api/admin/charges', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCharges(data))
      .catch(console.error);

    fetch('/api/admin/reports/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error);
  }, []);

  const handleAddCharge = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/charges/${encodeURIComponent(newCharge.laundry_type)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rate_per_item: parseFloat(newCharge.rate_per_item) })
      });
      if (res.ok) {
        setShowAddCharge(false);
        const fetched = await fetch('/api/admin/charges', { headers: { 'Authorization': `Bearer ${token}` } });
        setCharges(await fetched.json());
        setNewCharge({ laundry_type: '', rate_per_item: '' });
      } else {
        alert("Error adding charge");
      }
    } catch(err) { alert("Server error"); }
  };

  const handleDeleteCharge = async (type) => {
    if (!confirm(`Are you sure you want to delete ${type}?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/charges/${encodeURIComponent(type)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fetched = await fetch('/api/admin/charges', { headers: { 'Authorization': `Bearer ${token}` } });
        setCharges(await fetched.json());
      } else {
        alert("Error deleting charge. Note: cannot delete types currently assigned to active orders.");
      }
    } catch(err) { alert("Server error"); }
  };

  const totalRevenue = orders.reduce((acc, curr) => curr.payment_status === 'Paid' ? acc + Number(curr.total_charge) : acc, 0);



  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar role="admin" />
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Admin Dashboard</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--text-muted)' }}>Total Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{users.length || '--'}</p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--text-muted)' }}>Total Revenue</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>Rs.{totalRevenue.toFixed(2)}</p>
          </div>
        </div>



        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Laundry Services & Charges</h2>
          <button className="btn btn-primary" onClick={() => setShowAddCharge(!showAddCharge)}>
            {showAddCharge ? 'Cancel' : '+ Add Service'}
          </button>
        </div>

        {showAddCharge && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Add / Update Service</h3>
            <form onSubmit={handleAddCharge} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label">Laundry Type</label>
                <input className="input-field" required value={newCharge.laundry_type} onChange={(e) => setNewCharge({...newCharge, laundry_type: e.target.value})} placeholder="e.g. Blankets" />
              </div>
              <div>
                <label className="input-label">Rate Per Item (Rs.)</label>
                <input className="input-field" type="number" step="0.01" min="0" required value={newCharge.rate_per_item} onChange={(e) => setNewCharge({...newCharge, rate_per_item: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)' }}>Save Service</button>
              </div>
            </form>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Laundry Type</th>
                <th style={{ padding: '1rem' }}>Rate Per Item</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {charges.map(c => (
                <tr key={c.laundry_type} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{c.laundry_type}</td>
                  <td style={{ padding: '1rem', color: 'var(--success)', fontWeight: 'bold' }}>Rs.{Number(c.rate_per_item).toFixed(2)}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn" style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem', background: 'var(--border)', color: 'var(--text-main)', fontSize: '0.875rem' }} onClick={() => { setNewCharge({laundry_type: c.laundry_type, rate_per_item: c.rate_per_item}); setShowAddCharge(true); }}>Edit</button>
                    <button className="btn" style={{ padding: '0.25rem 0.5rem', background: 'var(--danger)', color: 'white', fontSize: '0.875rem' }} onClick={() => handleDeleteCharge(c.laundry_type)}>Delete</button>
                  </td>
                </tr>
              ))}
              {charges.length === 0 && <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>No services found</td></tr>}
            </tbody>
          </table>
        </div>


      </main>
    </div>
  );
}
