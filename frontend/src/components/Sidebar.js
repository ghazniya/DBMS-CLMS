"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar({ role }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/");
  };

  const getLinks = () => {
    if (role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Users', path: '/admin/users' },
        { name: 'Reports', path: '/admin/reports' },
      ];
    }
    if (role === 'staff') {
      return [
        { name: 'Dashboard', path: '/staff' },
        { name: 'History', path: '/staff/history' },
      ];
    }
    // Resident
    return [
      { name: 'Dashboard', path: '/resident' }
    ];
  };

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center', color: 'var(--primary)' }}>
        CLMS - {role.toUpperCase()}
      </h2>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {getLinks().map(link => (
          <Link 
            key={link.path} 
            href={link.path}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              background: pathname === link.path ? 'var(--primary)' : 'transparent',
              color: pathname === link.path ? 'white' : 'var(--text-main)',
              fontWeight: pathname === link.path ? '600' : '400',
              transition: 'background 0.2s',
              textDecoration: 'none'
            }}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <button onClick={handleLogout} className="btn" style={{ background: 'var(--danger)', color: 'white' }}>
        Logout
      </button>
    </div>
  );
}
