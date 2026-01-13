import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'Software Engineer' });
  const navigate = useNavigate();

  // Hardcoded roles for now, or could fetch from server
  const SUPPORTED_ROLES = [
    "Backend Engineer", "Frontend Engineer", "Full Stack Engineer", "Mobile Engineer", "Software Engineer",
    "Data Engineer", "Data Scientist", "Product Manager" // Truncated for brevity
  ];

  useEffect(() => {
    const admin = localStorage.getItem('job_admin');
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/users');
      const data = await res.json();
      if (res.ok) setUsers(data.users);
      else throw new Error(data.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert('User created successfully');
      setShowAddUser(false);
      setNewUser({ email: '', role: 'Software Engineer' });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/v1/admin/users/${email}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('job_admin');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#333', color: '#fff' }}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '5px 15px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px' }}>Logout</button>
      </header>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Users Management</h2>
            <button onClick={() => setShowAddUser(!showAddUser)} style={{ padding: '10px 20px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px' }}>
                {showAddUser ? 'Cancel' : 'Add New User'}
            </button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {showAddUser && (
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>Register New User</h3>
                <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                        <input 
                            type="email" 
                            required 
                            value={newUser.email}
                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                            style={{ padding: '8px', width: '250px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
                        <select 
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value})}
                            style={{ padding: '8px', width: '200px' }}
                        >
                            {SUPPORTED_ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" style={{ padding: '8px 20px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px' }}>
                        Register
                    </button>
                </form>
            </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                    <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Email</th>
                    <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Role</th>
                    <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Created At</th>
                    <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.email}>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.email}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{user.role}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                            <button 
                                onClick={() => handleDeleteUser(user.email)}
                                style={{ padding: '5px 10px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
