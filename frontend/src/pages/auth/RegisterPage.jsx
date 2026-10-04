import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../api/services/authService';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirm_password: '',
    role: 'CUSTOMER', referral_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { updateTokens } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.first_name.trim()) errs.first_name = 'First name is required.';
    if (!formData.last_name.trim()) errs.last_name = 'Last name is required.';
    if (!formData.email.trim()) errs.email = 'Email is required.';
    if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirm_password) errs.confirm_password = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await authService.register(formData);
      const { tokens, user } = res.data;
      localStorage.setItem('nilemart_tokens', JSON.stringify(tokens));
      localStorage.setItem('nilemart_user', JSON.stringify(user));
      updateTokens(tokens);
      toast.success('Account created successfully!');
      const redirectMap = { ADMIN: '/dashboard/admin', VENDOR: '/dashboard/vendor', CUSTOMER: '/dashboard/customer' };
      navigate(redirectMap[user.role] || '/products');
    } catch (err) {
      const data = err.response?.data || {};
      const fieldErrors = {};
      Object.entries(data).forEach(([key, val]) => {
        fieldErrors[key] = Array.isArray(val) ? val[0] : val;
      });
      setErrors(fieldErrors);
      toast.error(data.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fieldConfig = [
    { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'John' },
    { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Doe' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '8+ characters' },
    { name: 'confirm_password', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4 fw-bold">Create Account</h3>
              <form onSubmit={handleSubmit} noValidate>
                {fieldConfig.map(({ name, label, type, placeholder }) => (
                  <div className="mb-3" key={name}>
                    <label className="form-label">{label}</label>
                    <input
                      type={type} name={name}
                      className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
                      value={formData[name]} onChange={handleChange} placeholder={placeholder}
                    />
                    {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
                  </div>
                ))}
                <div className="mb-3">
                  <label className="form-label">Account Type</label>
                  <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="VENDOR">Vendor</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Referral Code <span className="text-muted">(optional)</span></label>
                  <input
                    type="text" name="referral_code"
                    className={`form-control ${errors.referral_code ? 'is-invalid' : ''}`}
                    value={formData.referral_code} onChange={handleChange} placeholder="Enter referral code"
                  />
                  {errors.referral_code && <div className="invalid-feedback">{errors.referral_code}</div>}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</> : 'Create Account'}
                </button>
              </form>
              <hr />
              <p className="text-center mb-0">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;