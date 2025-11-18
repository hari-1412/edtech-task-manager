import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
    teacherId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.role === 'student' && !formData.teacherId) {
      setError('Please enter your teacher ID');
      return;
    }

    setLoading(true);
    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      if (formData.role === 'student') {
        signupData.teacherId = formData.teacherId;
      }

      const response = await authAPI.signup(signupData);
      const { token, user } = response.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-outer">
      <div className="auth-card">
        <div className="auth-left">
          <div className="logo">ED TECH TASK MANAGER</div>

          <div className="visual-card" style={{flex:1,display:'flex',alignItems:'flex-end',justifyContent:'flex-start',padding:'18px'}}>
            <div>
              <h4>Capturing Moments,</h4>
              <p>Create memories with tasks and progress.</p>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div>
            <h2>Create an account</h2>
            <div className="muted">Join and manage learning tasks</div>
          </div>

          {error && (
            <div style={{background:'#3b1f2c',padding:10,borderRadius:8,border:'1px solid rgba(255,255,255,0.04)'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="Email"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="auth-input"
              placeholder="Password"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="auth-input"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            {formData.role === 'student' && (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <input
                  type="text"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  placeholder="Teacher ID"
                />
                <div style={{fontSize:12,color:'rgba(255,255,255,0.6)'}}>Enter your teacher's ID</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-cta"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-divider">Or register with</div>

          <div className="social-row">
            <button className="social-btn">Google</button>
            <button className="social-btn">Apple</button>
          </div>

          <div style={{marginTop:8,fontSize:13,color:'rgba(255,255,255,0.65)'}}>
            Already have an account? <Link to="/login" style={{color:'#d7c3ff',fontWeight:700}}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;