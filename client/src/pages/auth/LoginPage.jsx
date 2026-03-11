import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { loginAdmin } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginAdmin(form);
            login(res.data.admin, res.data.token);
            toast.success(`Welcome back, ${res.data.admin.business_name}! 💜`);
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gradient-bg min-h-screen flex items-center justify-center p-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            {/* Decorative blobs */}
            <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', marginBottom: '16px', animation: 'pulse-glow 2s ease infinite' }}>
                        <Scissors size={28} color="white" />
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '6px' }}>HairBiz Pro</h1>
                    <p style={{ color: 'rgba(240,232,255,0.5)', fontSize: '0.9rem' }}>Sign in to your dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="you@business.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '28px' }}>
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                style={{ paddingRight: '48px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,232,255,0.5)', display: 'flex' }}
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                        {loading ? <><span className="spinner" />&nbsp;Signing in...</> : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(240,232,255,0.4)', fontSize: '0.9rem' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
