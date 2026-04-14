import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const StripeDemo = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    
    const amount = query.get('amount') || '0.00';
    const title = query.get('title') || 'Collection';
    const id = query.get('id') || 'N/A';
    const [step, setStep] = useState(1);

    useEffect(() => {
        const timer1 = setTimeout(() => setStep(2), 1500);
        const timer2 = setTimeout(() => setStep(3), 3500);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    const finish = () => {
        alert("Payment Succeeded! Returning to PoetVerse.");
        window.close();
    };

    return (
        <div style={{ 
            height: '100vh', background: '#f6f9fc', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            <div style={{ 
                width: '400px', background: '#fff', borderRadius: '8px', 
                boxShadow: '0 50px 100px -20px rgba(50,50,93,.25),0 30px 60px -30px rgba(0,0,0,.3)',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
                        <div style={{ width: '28px', height: '28px', background: '#635bff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '18px' }}>S</div>
                        <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1a1f36' }}>Stripe</span>
                        <span style={{ fontSize: '12px', color: '#697386', marginLeft: 'auto', fontWeight: 'bold' }}>TEST MODE</span>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ color: '#697386', fontSize: '14px', marginBottom: '4px' }}>Pay PoetVerse</div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1f36' }}>${amount}</div>
                    </div>

                    <div style={{ background: '#f7fafc', padding: '16px', borderRadius: '6px', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#697386' }}>{title}</span>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>${amount}</span>
                        </div>
                        <div style={{ borderTop: '1px solid #e3e8ee', margin: '8px 0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Total due</span>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>${amount}</span>
                        </div>
                    </div>

                    {step === 1 && (
                        <div style={{ textAlign: 'center', py: '20px' }}>
                            <div className="animate-spin" style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #635bff', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '16px' }}></div>
                            <div style={{ fontSize: '14px', color: '#3c4257' }}>Securely connecting to Stripe...</div>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>Payment details</div>
                            <div style={{ background: '#fff', border: '1px solid #e3e8ee', padding: '12px', borderRadius: '4px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '20px', background: '#e3e8ee', borderRadius: '2px' }}></div>
                                <span style={{ fontSize: '14px', color: '#3c4257' }}>•••• •••• •••• 4242</span>
                                <span style={{ marginLeft: 'auto', fontSize: '12px' }}>Loading...</span>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', animation: 'scaleIn 0.4s ease-out' }}>
                            <div style={{ width: '64px', height: '64px', background: '#24b47e', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px' }}>✓</div>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>Payment successful</h2>
                            <p style={{ fontSize: '14px', color: '#697386', marginBottom: '32px' }}>Thank you for your purchase.</p>
                            
                            <button 
                                onClick={finish}
                                style={{ width: '100%', background: '#635bff', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default StripeDemo;
