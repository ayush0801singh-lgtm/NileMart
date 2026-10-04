import React, { useState, useEffect } from 'react';
import adminService from '../../api/services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const ROLE_BADGE = { CUSTOMER: 'bg-primary', VENDOR: 'bg-success', ADMIN: 'bg-danger' };

function UserManagePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const res = await adminService.getUsers(params);
      setUsers(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const toggleActive = async (user) => {
    try {
      await adminService.updateUser(user.id, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully.`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user status.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">User Management</h2>
        <div style={{ width: '180px' }}>
          <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="VENDOR">Vendors</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">No users found.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id}>
                  <td className="fw-semibold">{user.full_name}</td>
                  <td>{user.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[user.role] || 'bg-secondary'}`}>{user.role}</span></td>
                  <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${user.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      onClick={() => toggleActive(user)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagePage;