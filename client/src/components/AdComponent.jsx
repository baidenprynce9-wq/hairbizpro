import React, { useEffect } from 'react';

const AdComponent = ({ adSlot, adFormat = 'auto', fullWidthResponsive = true, placeholder = true }) => {
    useEffect(() => {
        try {
            // Push the ad to Google AdSense if the script is loaded
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    const adClientId = import.meta.env.VITE_GOOGLE_ADSENSE_ID;

    // If no Ad Client ID is provided, show a nice "Your Ad Here" placeholder
    if (!adClientId && placeholder) {
        return (
            <div className="ad-placeholder" style={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '2px dashed #a0aec0',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                margin: '20px 0',
                color: '#4a5568',
                fontFamily: 'sans-serif',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px' }}>Advertisement</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#718096' }}>Place your Google AdSense code here to start earning.</p>
                <div style={{ marginTop: '12px', fontSize: '0.8rem', opacity: 0.6 }}>Slot ID: {adSlot || 'Trial Slot'}</div>
            </div>
        );
    }

    if (!adClientId) return null;

    return (
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client={adClientId}
                 data-ad-slot={adSlot}
                 data-ad-format={adFormat}
                 data-full-width-responsive={fullWidthResponsive.toString()}></ins>
        </div>
    );
};

export default AdComponent;
