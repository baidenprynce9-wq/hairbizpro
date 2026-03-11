import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Link2, LogOut, Scissors } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/share-link', icon: Link2, label: 'Share Link' },
];

export default function AdminLayout() {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside className="sidebar">
                {/* Branding */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', paddingLeft: '4px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Scissors size={20} color="white" />
                    </div>
                    <div>
                        <div className="gradient-text" style={{ fontWeight: '800', fontSize: '1rem', lineHeight: 1.2 }}>HairBiz Pro</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(240,232,255,0.4)', marginTop: '2px' }}>Admin Panel</div>
                    </div>
                </div>

                {/* Business name */}
                <div style={{ padding: '12px 16px', background: 'rgba(124,58,237,0.1)', borderRadius: '10px', marginBottom: '24px', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(240,232,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signed in as</div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#e2d4ff' }}>{admin?.business_name}</div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(240,232,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '16px' }}>Menu</div>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="sidebar-item"
                    style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(240,232,255,0.5)', marginTop: '8px' }}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </aside>

            {/* Main content */}
            <main className="main-content" style={{ flex: 1, background: 'var(--brand-dark)' }}>
                <Outlet />
            </main>
        </div>
    );
}
