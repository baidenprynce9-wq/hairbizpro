import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Scissors, ChevronRight, ChevronLeft, CheckCircle, Minus, Plus, AlertCircle, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { getBusinessInfo } from '../../api/auth';
import { getPublicProducts } from '../../api/products';
import { placeOrder } from '../../api/orders';
import AdComponent from '../../components/AdComponent';

// Step progress indicator
function StepProgress({ current, total }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', gap: '0' }}>
            {Array.from({ length: total }, (_, i) => i + 1).map((step, idx) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={`step-dot ${step < current ? 'completed' : step === current ? 'active' : 'inactive'}`}>
                        {step < current ? '✓' : step}
                    </div>
                    {idx < total - 1 && (
                        <div style={{ width: '48px', height: '2px', background: step < current ? '#10b981' : 'rgba(124,58,237,0.2)', transition: 'background 0.3s ease' }} />
                    )}
                </div>
            ))}
        </div>
    );
}

// Success screen
function SuccessScreen({ customerName, businessName }) {
    return (
        <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
            <div className="pop-in" style={{ display: 'inline-flex', width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>
                <CheckCircle size={46} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Order Placed! 🎉</h2>
            <p style={{ color: 'rgba(240,232,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '320px', margin: '0 auto 24px' }}>
                Thank you <strong style={{ color: '#c4b5fd' }}>{customerName}</strong>! Your order has been sent to <strong style={{ color: '#c4b5fd' }}>{businessName}</strong>. They will contact you shortly.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px', margin: '0 auto' }}>
                <div style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.85rem', color: '#6ee7b7' }}>
                    ✅ Order confirmed and received
                </div>
                <div style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', fontSize: '0.85rem', color: '#c4b5fd' }}>
                    📞 You'll be contacted on your phone
                </div>
            </div>

            {/* Success Page Ad */}
            <div style={{ marginTop: '32px' }}>
                <AdComponent adSlot="order-success-ad" />
            </div>
        </div>
    );
}

export default function CustomerOrderForm() {
    const { adminId } = useParams();
    const [step, setStep] = useState(1);
    const [business, setBusiness] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [notFound, setNotFound] = useState(false);

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image is too large. Max 5MB allowed.');
                return;
            }
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
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bizRes, prodRes] = await Promise.all([
                    getBusinessInfo(adminId),
                    getPublicProducts(adminId),
                ]);
                setBusiness(bizRes.data);
                setProducts(prodRes.data);
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [adminId]);

    const handleSubmit = async () => {
        if (!selectedProduct) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('admin_id', adminId);
            formData.append('customer_name', customerName);
            formData.append('customer_phone', customerPhone);
            formData.append('product_id', selectedProduct.id);
            formData.append('quantity', quantity);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            await placeOrder(formData);
            setSuccess(true);
            setStep(4);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to place order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const totalPrice = selectedProduct ? (parseFloat(selectedProduct.selling_price) * quantity) : 0;

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-dark)', flexDirection: 'column', gap: '16px' }}>
                <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
                <p style={{ color: 'rgba(240,232,255,0.5)' }}>Loading order form...</p>
            </div>
        );
    }

    if (notFound) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-dark)', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                <AlertCircle size={48} color="#f87171" style={{ opacity: 0.6 }} />
                <h2 style={{ fontWeight: '700', color: '#f87171' }}>Business Not Found</h2>
                <p style={{ color: 'rgba(240,232,255,0.45)', textAlign: 'center' }}>This order link is invalid or the business doesn't exist.</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--brand-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
            {/* Blobs */}
            <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '54px', height: '54px', borderRadius: '14px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', marginBottom: '14px' }}>
                    <Scissors size={24} color="white" />
                </div>
                <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '4px' }}>
                    {business?.business_name}
                </h1>
                <p style={{ color: 'rgba(240,232,255,0.45)', fontSize: '0.85rem' }}>Place your order below</p>
            </div>

            {/* Card */}
            <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
                {!success && <StepProgress current={step} total={3} />}

                {/* Step 1: Customer info */}
                {step === 1 && (
                    <div className="fade-in-up">
                        <h2 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>Your Details</h2>
                        <p style={{ color: 'rgba(240,232,255,0.45)', fontSize: '0.85rem', marginBottom: '24px' }}>We need this to contact you about your order</p>

                        <div style={{ marginBottom: '18px' }}>
                            <label className="form-label">Full Name</label>
                            <input className="form-input" type="text" placeholder="e.g. Kofi Mensah" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                        </div>
                        <div style={{ marginBottom: '28px' }}>
                            <label className="form-label">Phone Number</label>
                            <input className="form-input" type="tel" placeholder="+233 20 000 0000" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                            disabled={!customerName.trim() || !customerPhone.trim()}
                            onClick={() => setStep(2)}
                        >
                            Continue <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* Step 2: Select product */}
                {step === 2 && (
                    <div className="fade-in-up">
                        <h2 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>Choose Product</h2>
                        <p style={{ color: 'rgba(240,232,255,0.45)', fontSize: '0.85rem', marginBottom: '20px' }}>Select the product you want to order</p>

                        {products.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(240,232,255,0.4)' }}>
                                <p>No products available at the moment</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                                {products.map(p => {
                                    const isSelected = selectedProduct?.id === p.id;
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => { setSelectedProduct(p); setQuantity(1); }}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                border: `2px solid ${isSelected ? '#7c3aed' : 'rgba(124,58,237,0.15)'}`,
                                                background: isSelected ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                gap: '12px',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(124,58,237,0.1)', flexShrink: 0, border: '1px solid rgba(124,58,237,0.1)' }}>
                                                {p.image_url ? (
                                                    <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Scissors size={20} style={{ opacity: 0.2 }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '1px' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'rgba(240,232,255,0.4)' }}>{p.stock} available</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '700', color: '#c4b5fd', fontSize: '0.95rem' }}>GH₵{parseFloat(p.selling_price).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</div>
                                                {isSelected && <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '1px' }}>✓ Selected</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Quantity */}
                        {selectedProduct && (
                            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '10px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                                <label className="form-label" style={{ marginBottom: '10px' }}>Quantity</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd' }}>
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ fontWeight: '800', fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
                                    <button onClick={() => setQuantity(q => Math.min(selectedProduct.stock, q + 1))} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd' }}>
                                        <Plus size={16} />
                                    </button>
                                    <span style={{ marginLeft: 'auto', fontWeight: '700', color: '#a78bfa', fontSize: '1rem' }}>
                                        GH₵{totalPrice.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Image Upload */}
                        <div style={{ marginBottom: '24px' }}>
                            <label className="form-label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Camera size={16} /> Reference Image (Optional)
                            </label>

                            {!imagePreview ? (
                                <div
                                    onClick={() => document.getElementById('image-upload').click()}
                                    style={{
                                        height: '100px',
                                        border: '2px dashed rgba(124,58,237,0.3)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: 'rgba(124,58,237,0.05)',
                                        transition: 'all 0.2s ease',
                                        gap: '8px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.05)'}
                                >
                                    <Camera size={24} style={{ opacity: 0.5 }} />
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(240,232,255,0.4)' }}>Click to upload from gallery</span>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                </div>
                            ) : (
                                <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(124,58,237,0.3)' }}>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <button
                                        onClick={removeImage}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.5)',
                                            border: 'none',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '13px' }} disabled={!selectedProduct} onClick={() => setStep(3)}>
                                Review Order <ChevronRight size={18} />
                            </button>
                        </div>

                    </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <div className="fade-in-up">
                        <h2 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>Confirm Order</h2>
                        <p style={{ color: 'rgba(240,232,255,0.45)', fontSize: '0.85rem', marginBottom: '24px' }}>Review your order before submitting</p>

                        <div style={{ borderRadius: '12px', border: '1px solid rgba(124,58,237,0.2)', overflow: 'hidden', marginBottom: '24px' }}>
                            {[
                                { label: 'Name', value: customerName },
                                { label: 'Phone', value: customerPhone },
                                { label: 'Product', value: selectedProduct?.name },
                                { label: 'Quantity', value: quantity },
                                { label: 'Image', value: imageFile ? 'Uploaded 📸' : 'None' },
                                { label: 'Total', value: `GH₵${totalPrice.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`, highlight: true },
                            ].map(({ label, value, highlight }, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 18px', borderBottom: '1px solid rgba(124,58,237,0.1)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(240,232,255,0.5)' }}>{label}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: highlight ? '800' : 600, color: highlight ? '#c4b5fd' : '#f0e8ff' }}>{value}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '13px' }} onClick={handleSubmit} disabled={submitting}>
                                {submitting ? <><span className="spinner" />&nbsp;Placing order...</> : '🛒 Place Order'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && success && (
                    <SuccessScreen customerName={customerName} businessName={business?.business_name} />
                )}
            </div>

            {/* Footer */}
            <p style={{ marginTop: '24px', fontSize: '0.75rem', color: 'rgba(240,232,255,0.2)' }}>
                Powered by HairBiz Pro ✂️
            </p>

            {/* Sticky Footer Ad for Mobile */}
            <div style={{ position: 'sticky', bottom: 0, width: '100%', maxWidth: '480px', marginTop: 'auto', paddingTop: '20px' }}>
                <AdComponent adSlot="customer-footer-ad" adFormat="horizontal" />
            </div>
        </div>
    );
}
