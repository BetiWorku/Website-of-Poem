import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

function PaymentSuccess() {
    const { id } = useParams(); // Not really used if we use query params, but let's see
    const [status, setStatus] = useState('verifying');
    const [errorDetails, setErrorDetails] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            // Clean up potentially malformed or double-encoded URL params (e.g. &amp;)
            const cleanSearch = window.location.search.replace(/&amp;/g, '&');
            const queryParams = new URLSearchParams(cleanSearch);
            
            const sessionId = queryParams.get('session_id');
            const orderId = queryParams.get('token'); // PayPal
            const outTradeNo = queryParams.get('outTradeNo'); // Telebirr
            const tx_ref = queryParams.get('tx_ref') || queryParams.get('trx_ref'); // Chapa supports both tx_ref and trx_ref
            const poemId = queryParams.get('poem_id');
            let method = queryParams.get('method');

            const paramsObj = Object.fromEntries(queryParams.entries());
            console.log('📦 URL PARAMS EXTRACTED:', paramsObj);

            if (!poemId || (!sessionId && !orderId && !outTradeNo && !tx_ref)) {
                console.warn('❌ CRITICAL PARAMS MISSING:', { poemId, sessionId, orderId, outTradeNo, tx_ref });
                setStatus('error');
                return;
            }

            try {
                const guestName = localStorage.getItem('last_purchaser_name') || 'Guest';
                const guestEmail = localStorage.getItem('last_purchaser_email') || 'no-email@test.com';

                console.log('📡 ATTEMPTING VERIFICATION:', { poemId, method, tx_ref });
                
                const response = await API.post('/payments/verify-payment', { 
                    sessionId, orderId, outTradeNo, tx_ref, poemId, method, guestName, guestEmail
                });
                
                console.log('✅ VERIFICATION RESPONSE:', response.data);
                
                // ─── Mark as purchased locally ───
                const guestPurchases = JSON.parse(localStorage.getItem('guestPurchases') || '[]');
                if (!guestPurchases.includes(poemId)) {
                    guestPurchases.push(poemId);
                    localStorage.setItem('guestPurchases', JSON.stringify(guestPurchases));
                }
                
                setStatus('success');
                const txnId = sessionId || orderId || outTradeNo || tx_ref;
                navigate(`/poems/${poemId}?payment_success=true&method=${method}&txn_id=${txnId}`);
            } catch (err) {
                const msg = err.response?.data?.message || err.message;
                console.error('❌ VERIFICATION ERROR:', msg);
                setErrorDetails(msg);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Artistic Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-50 rounded-full blur-[120px] opacity-60"></div>
            
            <div className="w-full max-w-lg relative">
                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-white/40 p-12 text-center animate-in fade-in zoom-in duration-700">
                    
                    {status === 'verifying' && (
                        <div className="space-y-8 py-8">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-[6px] border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-indigo-500/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Securing Your Verse</h1>
                                <p className="text-slate-400 font-medium leading-relaxed">Please do not refresh. We are finalizing the enrollment of your masterpiece into your collection.</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-8 py-4">
                            <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto shadow-sm shadow-emerald-100/50 animate-in zoom-in-50 duration-500">
                                <svg className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-500 italic">Access Granted</p>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic leading-tight">Masterpiece Unlocked</h1>
                                </div>
                                <p className="text-slate-500 font-medium leading-relaxed px-4">Your contribution was successful. The golden seal has been broken, and the verse is now part of your personal library.</p>
                            </div>
                            <div className="pt-4">
                                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 animate-[progress_2s_ease-in-out]"></div>
                                </div>
                                <p className="mt-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Redirecting to gallery...</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-8 py-4">
                            <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center mx-auto shadow-sm shadow-rose-100/50">
                                <svg className="w-10 h-10 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-rose-500 italic">Verification Failed</p>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Something went wrong</h1>
                                </div>
                                <p className="text-muted text-[13px] font-medium leading-relaxed max-w-[280px] mx-auto">
                                    The verification ceremony could not be completed. If funds were deducted, please reach out to our scribe for manual unlocking.
                                </p>
                                {errorDetails && (
                                    <div className="mt-4 p-3 bg-red-50 text-red-500 text-[10px] font-mono rounded-lg border border-red-100 overflow-hidden text-ellipsis">
                                        Error: {errorDetails}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/browse')}
                                className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                                Back to Gallery
                            </button>
                        </div>
                    )}

                </div>

                {/* Footer Decor */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] italic leading-loose">
                        Unlocking the art of emotion.<br/>
                        Thank you for supporting literature.
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}} />
        </div>
    );
}

export default PaymentSuccess;
