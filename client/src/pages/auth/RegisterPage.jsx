import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { registerAdmin } from '../../api/auth';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ business_name: '', phone: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await registerAdmin(form);
            toast.success('Account created! Please sign in. 🎉');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const field = (key, label, type = 'text', placeholder = '') => (
        <div style={{ marginBottom: '18px' }}>
            <label className="form-label">{label}</label>
            <input
                className="form-input"
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
            />
        </div>
    );

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--brand-dark)', padding: '20px' }}>
            <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', marginBottom: '14px' }}>
                        <Scissors size={26} color="white" />
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '4px' }}>Create Account</h1>
                    <p style={{ color: 'rgba(240,232,255,0.5)', fontSize: '0.88rem' }}>Set up your HairBiz Pro dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {field('business_name', 'Business Name', 'text', 'e.g. Accra Glamour Studio')}
                    {field('phone', 'Phone Number', 'tel', '+233 24 000 0000')}
                    {field('email', 'Email Address', 'email', 'you@business.com')}
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
                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,232,255,0.5)', display: 'flex' }}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                        {loading ? <><span className="spinner" />&nbsp;Creating account...</> : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '22px', color: 'rgba(240,232,255,0.4)', fontSize: '0.88rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
