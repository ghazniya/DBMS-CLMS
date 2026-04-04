"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'staff', first_name: '', last_name: '', room_number: '', phone_number: '' });
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
  }, [router]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      
      if (res.ok) {
        setShowAddForm(false);
        const fetched = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
        setUsers(await fetched.json());
        setNewUser({ email: '', password: '', role: 'staff', first_name: '', last_name: '', room_number: '', phone_number: '' });
      } else {
        const d = await res.json();
        alert(d.message || "Error adding user");
      }
    } catch(err) {
        alert("Server error");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar role="admin" />
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>User Management</h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Active Accounts</h2>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add User'}
          </button>
        </div>

        {showAddForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Create New User</h3>
            <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label">Role</label>
                <select className="input-field" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                  <option value="resident">Resident</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="input-label">Email</label>
                <input className="input-field" type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Password</label>
                <input className="input-field" type="password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div>
                <label className="input-label">First Name</label>
                <input className="input-field" required value={newUser.first_name} onChange={(e) => setNewUser({...newUser, first_name: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input className="input-field" required value={newUser.last_name} onChange={(e) => setNewUser({...newUser, last_name: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Phone Number</label>
                <input className="input-field" value={newUser.phone_number} onChange={(e) => setNewUser({...newUser, phone_number: e.target.value})} />
              </div>
              {newUser.role === 'resident' && (
                <div>
                  <label className="input-label">Room Number</label>
                  <input className="input-field" required value={newUser.room_number} onChange={(e) => setNewUser({...newUser, room_number: e.target.value})} />
                </div>
              )}
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)' }}>Create User</button>
              </div>
            </form>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.875rem',
                      background: u.role === 'admin' ? 'var(--danger)' : u.role === 'staff' ? 'var(--info)' : 'var(--success)',
                      color: 'white'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
