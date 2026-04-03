"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddResident, setShowAddResident] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [charges, setCharges] = useState([]);
  const [newOrder, setNewOrder] = useState({ customer_id: '', laundry_type: '', no_of_items: 1, notes: '' });
  const [newResident, setNewResident] = useState({ email: '', password: '', first_name: '', last_name: '', room_number: '', phone_number: '' });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || localStorage.getItem('role') !== 'staff') {
      router.push('/');
      return;
    }

    fetch('http://localhost:5000/api/staff/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error);

    fetch('http://localhost:5000/api/staff/customers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCustomers(data));

    fetch('http://localhost:5000/api/staff/charges', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
          setCharges(data);
          if (data.length > 0) setNewOrder(prev => ({ ...prev, laundry_type: data[0].laundry_type }));
      });
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/staff/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        setShowAddForm(false);
        const fetched = await fetch('http://localhost:5000/api/staff/orders', { headers: { 'Authorization': `Bearer ${token}` } });
        setOrders(await fetched.json());
        setNewOrder({ customer_id: '', laundry_type: charges[0]?.laundry_type || '', no_of_items: 1, notes: '' });
      } else {
        const d = await res.json();
        alert(d.message || "Error adding order");
      }
    } catch(err) {
        alert("Server error");
    }
  };

  const handleCreateResident = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/staff/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newResident)
      });
      if (res.ok) {
        setShowAddResident(false);
        const fetched = await fetch('http://localhost:5000/api/staff/customers', { headers: { 'Authorization': `Bearer ${token}` } });
        setCustomers(await fetched.json());
        setNewResident({ email: '', password: '', first_name: '', last_name: '', room_number: '', phone_number: '' });
        alert("Resident added successfully!");
      } else {
        const d = await res.json();
        alert(d.message || "Error adding resident");
      }
    } catch(err) {
        alert("Server error");
    }
  };

  const updateStatus = async (id, status) => {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/staff/orders/${id}/status`, {
          method: 'PUT',
          headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
      });
      // Refresh
      const res = await fetch('http://localhost:5000/api/staff/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(await res.json());
  };

  const updatePayment = async (id, status) => {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/staff/orders/${id}/payment`, {
          method: 'PUT',
          headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ payment_status: status })
      });
      // Refresh
      const res = await fetch('http://localhost:5000/api/staff/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(await res.json());
  };

  const recordDelivery = async (id) => {
      const notes = prompt("Enter delivery notes (optional):") || "";
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/staff/orders/${id}/delivery`, {
          method: 'POST',
          headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes })
      });
      // Refresh
      const res = await fetch('http://localhost:5000/api/staff/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(await res.json());
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar role="staff" />
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Staff Dashboard</h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Active Orders Queue</h2>
          <div>
            <button className="btn btn-primary" onClick={() => setShowAddResident(!showAddResident)} style={{ marginRight: '1rem', background: 'var(--info)' }}>
              {showAddResident ? 'Cancel' : '+ Add Resident'}
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : '+ Add Order'}
            </button>
          </div>
        </div>

        {showAddResident && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Register New Resident</h3>
            <form onSubmit={handleCreateResident} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label">Email</label>
                <input className="input-field" type="email" required value={newResident.email} onChange={(e) => setNewResident({...newResident, email: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Password</label>
                <input className="input-field" type="password" required value={newResident.password} onChange={(e) => setNewResident({...newResident, password: e.target.value})} />
              </div>
              <div>
                <label className="input-label">First Name</label>
                <input className="input-field" required value={newResident.first_name} onChange={(e) => setNewResident({...newResident, first_name: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input className="input-field" required value={newResident.last_name} onChange={(e) => setNewResident({...newResident, last_name: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Room Number</label>
                <input className="input-field" required value={newResident.room_number} onChange={(e) => setNewResident({...newResident, room_number: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Phone Number</label>
                <input className="input-field" required value={newResident.phone_number} onChange={(e) => setNewResident({...newResident, phone_number: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)' }}>Register Resident</button>
              </div>
            </form>
          </div>
        )}

        {showAddForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Create New Order</h3>
            <form onSubmit={handleCreateOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label">Resident</label>
                <select className="input-field" required value={newOrder.customer_id} onChange={(e) => setNewOrder({...newOrder, customer_id: e.target.value})}>
                  <option value="" disabled>Select Resident</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} (Room {c.room_number})</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Laundry Type</label>
                <select className="input-field" required value={newOrder.laundry_type} onChange={(e) => setNewOrder({...newOrder, laundry_type: e.target.value})}>
                  {charges.map(c => <option key={c.laundry_type} value={c.laundry_type}>{c.laundry_type} (${c.rate_per_item}/item)</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Number of Items</label>
                <input className="input-field" type="number" min="1" required value={newOrder.no_of_items} onChange={(e) => setNewOrder({...newOrder, no_of_items: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Notes</label>
                <input className="input-field" value={newOrder.notes} onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})} placeholder="Optional notes" />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)' }}>Create Order</button>
              </div>
            </form>
          </div>
        )}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Order #</th>
                <th style={{ padding: '1rem' }}>Resident Name</th>
                <th style={{ padding: '1rem' }}>Room</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Payment</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{o.id}</td>
                  <td style={{ padding: '1rem' }}>{o.first_name} {o.last_name}</td>
                  <td style={{ padding: '1rem' }}>{o.room_number}</td>
                  <td style={{ padding: '1rem' }}>${Number(o.total_charge).toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    {o.payment_status === 'Paid' ? (
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Paid</span>
                    ) : (
                        <button onClick={() => updatePayment(o.id, 'Paid')} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--warning)', color: 'white' }}>Mark Paid</button>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                      <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.875rem',
                      background: o.order_status === 'Pending' ? 'var(--warning)' : 'var(--info)',
                      color: 'white'
                    }}>
                      {o.order_status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                      {o.order_status === 'Pending' && <button onClick={() => updateStatus(o.id, 'In Progress')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Start Wash</button>}
                      {o.order_status === 'In Progress' && <button onClick={() => updateStatus(o.id, 'Ready')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--success)' }}>Mark Ready</button>}
                      {o.order_status === 'Ready' && <button onClick={() => recordDelivery(o.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--info)' }}>Deliver to Room</button>}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pending orders in the queue.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
