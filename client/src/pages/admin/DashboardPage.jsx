import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Clock, TrendingUp, Package } from 'lucide-react';
import { getMyOrders, getRevenueSummary } from '../../api/orders';
import { getLowStockProducts } from '../../api/products';

function StatCard({ icon: Icon, label, value, color, sub }) {
    return (
        <div className="glass-card stat-card fade-in-up" style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(240,232,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f0e8ff' }}>{value}</p>
                    {sub && <p style={{ fontSize: '0.75rem', color: 'rgba(240,232,255,0.4)', marginTop: '4px' }}>{sub}</p>}
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color="white" />
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function DashboardPage() {
    const [orders, setOrders] = useState([]);
    const [revenue, setRevenue] = useState({ total_orders: 0, total_revenue: 0 });
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [ordersRes, revRes, stockRes] = await Promise.all([
                    getMyOrders(),
                    getRevenueSummary(),
                    getLowStockProducts(),
                ]);
                setOrders(ordersRes.data);
                setRevenue(revRes.data);
                setLowStock(stockRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const pending = orders.filter(o => o.status === 'pending').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const recentOrders = orders.slice(0, 6);

    const formatCurrency = (val) => {
        const num = parseFloat(val) || 0;
        return `GH₵${num.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
                <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
                <p style={{ color: 'rgba(240,232,255,0.5)' }}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '6px' }}>
                    <span className="gradient-text">Dashboard</span> Overview
                </h1>
                <p style={{ color: 'rgba(240,232,255,0.45)', fontSize: '0.9rem' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <StatCard icon={ShoppingBag} label="Total Orders" value={orders.length} color="rgba(124,58,237,0.7)" />
                <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(revenue.total_revenue)} color="rgba(16,185,129,0.7)" sub="Delivered orders" />
                <StatCard icon={Clock} label="Pending" value={pending} color="rgba(245,158,11,0.7)" />
                <StatCard icon={TrendingUp} label="Delivered" value={delivered} color="rgba(59,130,246,0.7)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                {/* Recent orders */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h2 style={{ fontWeight: '700', fontSize: '1rem' }}>Recent Orders</h2>
                        <a href="/admin/orders" style={{ color: '#a78bfa', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(240,232,255,0.35)' }}>
                            <ShoppingBag size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                            <p>No orders yet. Share your link to get started!</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'rgba(240,232,255,0.4)' }}>{order.customer_phone}</div>
                                            </td>
                                            <td>{order.product_name}</td>
                                            <td>{order.quantity}</td>
                                            <td style={{ fontWeight: 600, color: '#a78bfa' }}>{formatCurrency(order.total_price)}</td>
                                            <td><StatusBadge status={order.status} /></td>
                                            <td style={{ fontSize: '0.82rem', color: 'rgba(240,232,255,0.45)' }}>
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Low stock alert */}
                <div className="glass-card" style={{ padding: '24px', minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                        <Package size={18} color="#f87171" />
                        <h2 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#f87171' }}>Low Stock</h2>
                    </div>
                    {lowStock.length === 0 ? (
                        <p style={{ color: 'rgba(240,232,255,0.4)', fontSize: '0.85rem' }}>All products are well stocked ✅</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {lowStock.map(p => (
                                <div key={p.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(239,68,68,0.1)', flexShrink: 0 }}>
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Package size={14} style={{ opacity: 0.3 }} />
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: '#fca5a5', flex: 1 }}>{p.name}</span>
                                    <span style={{ padding: '2px 8px', background: 'rgba(239,68,68,0.2)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: '#f87171' }}>{p.stock}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
