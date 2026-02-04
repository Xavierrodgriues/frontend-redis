import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import './AdminDashboard.css';
import './AdminDashboard-fix.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Autocomplete states
  const [roleInput, setRoleInput] = useState('');
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [editRoleInput, setEditRoleInput] = useState('');
  const [showEditRoleSuggestions, setShowEditRoleSuggestions] = useState(false);

  const roleInputRef = useRef(null);
  const editRoleInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const editSuggestionsRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_ORIGIN || 'http://localhost:3000';
  const navigate = useNavigate();

  // All roles from GitHub Actions
  const roles = [
    // Core Engineering
    'Backend Engineer',
    'Frontend Engineer',
    'Full Stack Engineer',
    'Mobile Engineer',
    'Software Engineer',
    'Platform Engineer',
    'Systems Engineer',
    'Embedded Systems Engineer',
    'UI UX',

    // Cloud & DevOps
    'Cloud Engineer',
    'Cloud Architect',
    'DevOps Engineer',
    'Site Reliability Engineer (SRE)',
    'Infrastructure Engineer',
    'Cloud Strategy Consultant',
    'Network Cloud Engineer',

    // Security & Risk
    'Security Engineer',
    'Cloud Security Engineer',
    'Application Security Engineer',
    'Network Security Engineer',
    'Cyber Security Analyst',
    'GRC / Compliance Engineer',
    'IT Auditor',
    'FedRAMP / ATO Engineer',
    'Technology Risk Manager',

    // Data & AI
    'Data Engineer',
    'Data Scientist',
    'Analytics Engineer',
    'Business Intelligence Engineer',
    'Machine Learning Engineer',
    'AI Engineer',
    'Financial Analyst',

    // QA & Testing
    'QA Engineer',
    'Automation Test Engineer',
    'Performance Test Engineer',
    'Security Test Engineer',
    'Test Lead / QA Lead',

    // IT Operations
    'IT Infrastructure Engineer',
    'IT Operations Engineer',
    'Linux / Unix Administrator',
    'Monitoring / SIEM Engineer',
    'Observability Engineer',
    'Release / Configuration Manager',
    'Network Engineer',

    // Enterprise Apps
    'SAP Analyst',
    'ERP Consultant',
    'CRM Consultant',
    'ServiceNow Developer / Admin',
    'IT Asset / ITOM Engineer',
    'Workday Analyst',
    'Salesforce Developer',

    // Architecture & Leadership
    'Enterprise Architect',
    'Solutions Architect',
    'IT Manager',
    'CTO / CIO',
    'Product Manager',
    'Technical Product Manager',
    'Project Manager',
    'Program Manager',

    // Emerging Tech
    'Blockchain Engineer',
    'IoT Engineer',
    'Robotics Engineer',
    'AR / VR Engineer',
    'AML KYC',
    'Business Analyst'
  ].sort();

  useEffect(() => {
    const admin = localStorage.getItem('job_admin');
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchUsers(true);
  }, [navigate]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
        roleInputRef.current && !roleInputRef.current.contains(event.target)) {
        setShowRoleSuggestions(false);
      }
      if (editSuggestionsRef.current && !editSuggestionsRef.current.contains(event.target) &&
        editRoleInputRef.current && !editRoleInputRef.current.contains(event.target)) {
        setShowEditRoleSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async (showLoading = false, page = currentPage) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch(`${API_URL}/api/v1/admin/users?page=${page}&limit=10`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users || []);
      if (data.pagination) {
        setPagination(data.pagination);
        setCurrentPage(data.pagination.currentPage);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      fetchUsers(false, newPage);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!newUser.email || !newUser.password || !newUser.role) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Adding user...');

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add user');

      toast.success('User added successfully!', { id: toastId });
      setNewUser({ email: '', password: '', role: '' });
      setRoleInput('');
      setShowAddModal(false);
      fetchUsers(false);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const toastId = toast.loading('Updating password...');

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${editingUser.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      toast.success('Password updated successfully!', { id: toastId });
      setShowPasswordModal(false);
      setPasswordData({ password: '', confirmPassword: '' });
      setEditingUser(null);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleEditRole = async (e) => {
    e.preventDefault();

    if (!editingUser || !editingUser.role) {
      toast.error('Please select a role');
      return;
    }

    const toastId = toast.loading('Updating role...');

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${editingUser.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editingUser.role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');

      toast.success('Role updated successfully!', { id: toastId });
      setShowEditModal(false);
      setEditingUser(null);
      setEditRoleInput('');
      fetchUsers(false);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleDeleteUser = async (email) => {
    if (!confirm(`Are you sure you want to delete user: ${email}?`)) {
      return;
    }

    const toastId = toast.loading('Deleting user...');

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${email}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      toast.success('User deleted successfully!', { id: toastId });
      fetchUsers(false);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('job_admin');
    navigate('/admin/login');
  };

  const openEditModal = (user) => {
    setEditingUser({ ...user });
    setEditRoleInput(user.role);
    setShowEditModal(true);
  };

  const openPasswordModal = (user) => {
    setEditingUser({ ...user });
    setPasswordData({ password: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const handleRoleInputChange = (value) => {
    setRoleInput(value);
    setNewUser({ ...newUser, role: value });
    setShowRoleSuggestions(true);
  };

  const handleEditRoleInputChange = (value) => {
    setEditRoleInput(value);
    setEditingUser({ ...editingUser, role: value });
    setShowEditRoleSuggestions(true);
  };

  const selectRole = (role) => {
    setRoleInput(role);
    setNewUser({ ...newUser, role });
    setShowRoleSuggestions(false);
  };

  const selectEditRole = (role) => {
    setEditRoleInput(role);
    setEditingUser({ ...editingUser, role });
    setShowEditRoleSuggestions(false);
  };

  const getFilteredRoles = (input) => {
    if (!input) return roles;
    return roles.filter(role =>
      role.toLowerCase().includes(input.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand">
            <img src="/yuvii-logo.jpeg" alt="Yuvii Logo" className="admin-logo" />
            <div>
              <h1>Admin Dashboard</h1>
              <p className="admin-subtitle">User Management Portal</p>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats Cards */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon stat-icon-users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{pagination.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-roles">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <polyline points="17 11 19 13 23 9"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{new Set(users.map(u => u.role)).size}</h3>
              <p>Active Roles</p>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="admin-actions">
          <h2>User Management</h2>
          <button onClick={() => setShowAddModal(true)} className="btn-add-user">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New User
          </button>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          {users.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <h3>No Users Found</h3>
              <p>Get started by adding your first user</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email}>
                    <td>
                      <div className="user-email">
                        <div className="user-avatar">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <span className="role-badge">{user.role}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => openEditModal(user)}
                          className="btn-edit"
                          title="Edit Role"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="btn-password"
                          title="Change Password"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          className="btn-delete"
                          title="Delete User"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {users.length} of {pagination.totalUsers} users
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrevPage}
                className="pagination-btn"
                title="First Page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="pagination-btn"
                title="Previous Page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`pagination-num ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="pagination-btn"
                title="Next Page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className="pagination-btn"
                title="Last Page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="form-group autocomplete-group">
                <label>Role</label>
                <div className="autocomplete-wrapper" ref={roleInputRef}>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => handleRoleInputChange(e.target.value)}
                    onFocus={() => setShowRoleSuggestions(true)}
                    placeholder="Search for a role..."
                    required
                  />
                  {showRoleSuggestions && (
                    <div className="autocomplete-suggestions" ref={suggestionsRef}>
                      {getFilteredRoles(roleInput).length > 0 ? (
                        getFilteredRoles(roleInput).map((role) => (
                          <div
                            key={role}
                            className="autocomplete-item"
                            onClick={() => selectRole(role)}
                          >
                            {role}
                          </div>
                        ))
                      ) : (
                        <div className="autocomplete-no-results">No roles found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User Role</h2>
              <button onClick={() => setShowEditModal(false)} className="modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditRole}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="input-disabled"
                />
              </div>
              <div className="form-group autocomplete-group">
                <label>Role</label>
                <div className="autocomplete-wrapper" ref={editRoleInputRef}>
                  <input
                    type="text"
                    value={editRoleInput}
                    onChange={(e) => handleEditRoleInputChange(e.target.value)}
                    onFocus={() => setShowEditRoleSuggestions(true)}
                    placeholder="Search for a role..."
                    required
                  />
                  {showEditRoleSuggestions && (
                    <div className="autocomplete-suggestions" ref={editSuggestionsRef}>
                      {getFilteredRoles(editRoleInput).length > 0 ? (
                        getFilteredRoles(editRoleInput).map((role) => (
                          <div
                            key={role}
                            className="autocomplete-item"
                            onClick={() => selectEditRole(role)}
                          >
                            {role}
                          </div>
                        ))
                      ) : (
                        <div className="autocomplete-no-results">No roles found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>User</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="input-disabled"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
