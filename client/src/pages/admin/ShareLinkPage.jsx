import { useState, useEffect } from 'react';
import { Link2, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminProfile } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export default function ShareLinkPage() {
    const { admin } = useAuth();
    const [copied, setCopied] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        getAdminProfile().then(res => setProfile(res.data)).catch(() => { });
    }, []);

    const adminId = admin?.id;
    const baseUrl = window.location.origin;
    const orderLink = `${baseUrl}/order/${adminId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(orderLink).then(() => {
            setCopied(true);
            toast.success('Link copied to clipboard! 🔗');
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const tips = [
        { icon: '📱', title: 'Instagram Bio', desc: 'Paste your link in your Instagram bio so followers can order directly.' },
        { icon: '💬', title: 'WhatsApp Status', desc: 'Share your link on WhatsApp status so contacts can browse and order.' },
        { icon: '📢', title: 'Facebook Page', desc: 'Pin the link as a post or add it to your Facebook page About section.' },
        { icon: '🎯', title: 'TikTok Bio', desc: 'Add to your TikTok bio to convert viewers into customers.' },
    ];

    return (
        <div style={{ maxWidth: '700px' }}>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '6px' }}>
                    <span className="gradient-text">Share Your Order Link</span>
                </h1>
                <p style={{ color: 'rgba(240,232,255,0.45)', fontSize: '0.9rem' }}>
                    Share this link with customers so they can place orders directly with you.
                </p>
            </div>

            {/* Link card */}
            <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Link2 size={18} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontWeight: '700', fontSize: '0.95rem' }}>Your Order Page Link</h2>
                        <p style={{ color: 'rgba(240,232,255,0.4)', fontSize: '0.8rem' }}>{profile?.business_name || admin?.business_name}</p>
                    </div>
                </div>

                {/* Link display */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, padding: '14px 18px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#c4b5fd', wordBreak: 'break-all', minWidth: '200px' }}>
                        {orderLink}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={handleCopy} style={{ whiteSpace: 'nowrap' }}>
                            {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                        </button>
                        <a
                            href={orderLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                            style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                        >
                            <ExternalLink size={15} /> Preview
                        </a>
                    </div>
                </div>
            </div>

            {/* How to share */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '16px' }}>📣 Where to Share Your Link</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {tips.map((tip, i) => (
                        <div key={i} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}>
                            <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{tip.icon}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>{tip.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(240,232,255,0.45)', lineHeight: 1.5 }}>{tip.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* How it works */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '16px' }}>⚙️ How It Works</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { step: '1', text: 'Customer clicks your link and lands on your order form' },
                        { step: '2', text: 'They enter their name and phone number' },
                        { step: '3', text: 'They choose a product and quantity from your catalogue' },
                        { step: '4', text: 'They submit — and you see the order instantly in your dashboard!' },
                    ].map(({ step, text }) => (
                        <div key={step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0, color: 'white' }}>{step}</div>
                            <p style={{ fontSize: '0.88rem', color: 'rgba(240,232,255,0.65)', lineHeight: 1.6, paddingTop: '4px' }}>{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
