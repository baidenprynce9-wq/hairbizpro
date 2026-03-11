import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getMyOrders, updateOrderStatus } from '../../api/orders';

const STATUS_OPTIONS = ['pending', 'processing', 'delivered', 'cancelled'];

function StatusBadge({ status }) {
    return <span className={`badge badge-${status}`}>{status}</span>;
}

function formatCurrency(val) {
    const num = parseFloat(val) || 0;
    return `GH₵${num.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [updating, setUpdating] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getMyOrders();
            setOrders(res.data);
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success(`Order marked as ${newStatus}`);
        } catch {
            toast.error('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const filtered = orders.filter(o => {
        const matchSearch = search === '' ||
            o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_phone.includes(search) ||
            (o.product_name || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '4px' }}>
                    <span className="gradient-text">Orders</span>
                </h1>
                <p style={{ color: 'rgba(240,232,255,0.4)', fontSize: '0.88rem' }}>
                    {orders.length} total order{orders.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,232,255,0.35)' }} />
                    <input
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                        placeholder="Search by name, phone, product..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} style={{ color: 'rgba(240,232,255,0.4)' }} />
                    <select className="form-input" style={{ width: 'auto', minWidth: '140px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all">All Statuses</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>
                <button className="btn-secondary" onClick={fetchOrders} style={{ gap: '6px' }}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {/* Orders table */}
            <div className="glass-card" style={{ padding: '8px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', gap: '12px', alignItems: 'center' }}>
                        <div className="spinner" /> <span style={{ color: 'rgba(240,232,255,0.5)' }}>Loading orders...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(240,232,255,0.35)' }}>
                        <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No orders found</p>
                        <p style={{ fontSize: '0.85rem' }}>Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Reference 📸</th>
                                    <th>Qty</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((order, idx) => (
                                    <tr key={order.id}>
                                        <td style={{ color: 'rgba(240,232,255,0.35)', fontSize: '0.8rem' }}>{idx + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'rgba(240,232,255,0.45)' }}>{order.customer_phone}</div>
                                        </td>
                                        <td>{order.product_name || '—'}</td>
                                        <td>
                                            {order.image_url ? (
                                                <a href={order.image_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(124,58,237,0.2)' }}>
                                                    <img src={order.image_url} alt="Ref" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </a>
                                            ) : (
                                                <span style={{ color: 'rgba(240,232,255,0.2)', fontSize: '0.75rem' }}>None</span>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{order.quantity}</td>
                                        <td style={{ fontWeight: 700, color: '#a78bfa' }}>{formatCurrency(order.total_price)}</td>
                                        <td><StatusBadge status={order.status} /></td>
                                        <td style={{ fontSize: '0.82rem', color: 'rgba(240,232,255,0.45)' }}>
                                            {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td>
                                            {updating === order.id ? (
                                                <div className="spinner" />
                                            ) : (
                                                <select
                                                    className="form-input"
                                                    style={{ width: 'auto', padding: '6px 28px 6px 10px', fontSize: '0.82rem' }}
                                                    value={order.status}
                                                    onChange={e => handleStatusChange(order.id, e.target.value)}
                                                >
                                                    {STATUS_OPTIONS.map(s => (
                                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
