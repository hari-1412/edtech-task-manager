import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            <h2>Sign in</h2>
            <div className="muted">Welcome back — please enter your details</div>
          </div>

          {error && (
            <div style={{background:'#3b1f2c',padding:10,borderRadius:8,border:'1px solid rgba(255,255,255,0.04)'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="" style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="auth-row">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="auth-input"
                placeholder="Email"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="auth-input"
                placeholder="Password"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-cta">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">Or sign in with</div>

          <div className="social-row">
            <button className="social-btn">Google</button>
            <button className="social-btn">Apple</button>
          </div>

          <div style={{marginTop:8,fontSize:13,color:'rgba(255,255,255,0.65)'}}>
            Don't have an account? <Link to="/signup" style={{color:'#d7c3ff',fontWeight:700}}>Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
