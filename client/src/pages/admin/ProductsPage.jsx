import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Package } from 'lucide-react';
import { toast } from 'sonner';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../api/products';

const EMPTY_FORM = { name: '', cost_price: '', selling_price: '', stock: '', image_url: '' };

function ProductModal({ product, onClose, onSave }) {
    const [form, setForm] = useState(product ? { ...product } : EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(product?.image_url || null);
    const isEdit = !!product;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('cost_price', form.cost_price);
            formData.append('selling_price', form.selling_price);
            formData.append('stock', form.stock);

            if (imageFile) {
                formData.append('image', imageFile);
            } else if (form.image_url) {
                formData.append('image_url', form.image_url);
            }

            if (isEdit) {
                await updateProduct(product.id, formData);
                toast.success('Product updated ✅');
            } else {
                await addProduct(formData);
                toast.success('Product added ✅');
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.details || err.response?.data?.error || 'Failed to save product';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setForm({ ...form, image_url: '' });
    };

    const inp = (key, label, type = 'text', placeholder = '') => (
        <div style={{ marginBottom: '16px' }}>
            <label className="form-label">{label}</label>
            <input
                className="form-input"
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                required={key !== 'image_url'}
            />
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontWeight: '800', fontSize: '1.1rem' }}>
                        {isEdit ? '✏️ Edit Product' : '➕ Add Product'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,232,255,0.5)' }}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {inp('name', 'Product Name', 'text', 'e.g. Brazilian Weave 20"')}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label className="form-label">Cost Price (GH₵)</label>
                            <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} required />
                        </div>
                        <div>
                            <label className="form-label">Selling Price (GH₵)</label>
                            <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: e.target.value })} required />
                        </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>{inp('stock', 'Stock Qty', 'number', '0')}</div>

                    <div style={{ marginBottom: '16px', marginTop: '16px' }}>
                        <label className="form-label">Product Image</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '8px',
                                background: 'rgba(124,58,237,0.1)',
                                border: '1px solid rgba(124,58,237,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}>
                                {imagePreview ? (
                                    <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Package size={24} style={{ opacity: 0.3 }} />
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    id="product-image-upload"
                                />
                                <label
                                    htmlFor="product-image-upload"
                                    className="btn-secondary"
                                    style={{
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <Plus size={16} /> {imagePreview ? 'Change Image' : 'Select Image'}
                                </label>
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            marginLeft: '12px',
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                                <p style={{ fontSize: '0.75rem', color: 'rgba(240,232,255,0.4)', marginTop: '6px' }}>
                                    Upload a photo from your gallery (optional)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profit preview */}
                    {form.cost_price && form.selling_price && (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '20px', fontSize: '0.85rem', color: '#34d399' }}>
                            Profit per unit: GH₵{(parseFloat(form.selling_price) - parseFloat(form.cost_price)).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner" />&nbsp;Saving...</> : isEdit ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await getProducts();
            setProducts(res.data);
        } catch {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success('Product deleted');
        } catch {
            toast.error('Failed to delete product');
        }
    };

    const openAdd = () => { setEditProduct(null); setShowModal(true); };
    const openEdit = (p) => { setEditProduct(p); setShowModal(true); };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '4px' }}>
                        <span className="gradient-text">Products</span>
                    </h1>
                    <p style={{ color: 'rgba(240,232,255,0.4)', fontSize: '0.88rem' }}>{products.length} product{products.length !== 1 ? 's' : ''} in your catalogue</p>
                </div>
                <button className="btn-primary" onClick={openAdd}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', gap: '12px', alignItems: 'center' }}>
                    <div className="spinner" /> <span style={{ color: 'rgba(240,232,255,0.5)' }}>Loading products...</span>
                </div>
            ) : products.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '80px 40px' }}>
                    <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'rgba(240,232,255,0.6)' }}>No products yet</p>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(240,232,255,0.35)', marginBottom: '24px' }}>Add your first hair product to get started</p>
                    <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add First Product</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {products.map(product => {
                        const profit = (parseFloat(product.selling_price) - parseFloat(product.cost_price)).toFixed(2);
                        const isLow = product.stock <= 20;
                        return (
                            <div key={product.id} className="glass-card fade-in-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Product image */}
                                <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(124,58,237,0.15)' }}>
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                    ) : (
                                        <Package size={40} style={{ opacity: 0.25 }} />
                                    )}
                                </div>

                                <div>
                                    <h3 style={{ fontWeight: '700', fontSize: '0.98rem', marginBottom: '8px' }}>{product.name}</h3>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                                        <div><span style={{ color: 'rgba(240,232,255,0.4)' }}>Cost: </span><span>GH₵{parseFloat(product.cost_price).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span></div>
                                        <div><span style={{ color: 'rgba(240,232,255,0.4)' }}>Price: </span><span style={{ color: '#c4b5fd', fontWeight: 600 }}>GH₵{parseFloat(product.selling_price).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span></div>
                                    </div>
                                    <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, ...(isLow ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' } : { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }) }}>
                                            {product.stock} in stock{isLow ? ' ⚠️' : ''}
                                        </span>
                                        <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
                                            +GH₵{parseFloat(profit).toLocaleString('en-GH', { minimumFractionDigits: 2 })} profit
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                    <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '8px' }} onClick={() => openEdit(product)}>
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button className="btn-danger" onClick={() => handleDelete(product.id, product.name)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <ProductModal
                    product={editProduct}
                    onClose={() => setShowModal(false)}
                    onSave={fetchProducts}
                />
            )}
        </div>
    );
}
