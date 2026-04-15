import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTheme } from '../context/ThemeContext';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null);

const paypalClientId = (process.env.REACT_APP_PAYPAL_CLIENT_ID && !process.env.REACT_APP_PAYPAL_CLIENT_ID.includes('your_'))
    ? process.env.REACT_APP_PAYPAL_CLIENT_ID
    : 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R';

function PoemViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [poem, setPoem] = useState(null);
    const [comment, setComment] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [reflectionSent, setReflectionSent] = useState(false);
    const [showReflectionModal, setShowReflectionModal] = useState(false);
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchasing, setPurchasing] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [lastTxn, setLastTxn] = useState({ id: '', method: '' });


    // Media & UI States
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    const toggleAudio = () => {
        setIsPlayingAudio(!isPlayingAudio);
        if (!isPlayingAudio) setShowVideo(false);
    };

    const toggleVideo = () => {
        setShowVideo(!showVideo);
        if (!showVideo) setIsPlayingAudio(false);
    };

    useEffect(() => {
        const fetchPoem = async () => {
            try {
                const { data } = await API.get(`/poems/${id}`);
                const guestPurchases = JSON.parse(localStorage.getItem('guestPurchases') || '[]');
                if (guestPurchases.includes(id)) {
                    data.isPurchased = true;
                }
                setPoem(data);
                const totalLikes = (data.likes?.length || 0) + (data.guestLikes?.length || 0);
                setLikes(totalLikes);
                setComments(data.comments || []);
                const user = JSON.parse(localStorage.getItem('user'));
                setIsLiked(data.likes?.includes(user?._id) || data.guestLikes?.includes(localStorage.getItem('guestId')));
                setError(null);
            } catch (err) {
                console.error("Fetch poem error:", err);
                setError(err.response?.status === 404 ? 'not_found' : 'server_error');
            } finally {
                setLoading(false);
            }
        };
        fetchPoem();
    }, [id]);

    useEffect(() => {
        if (!poem || !poem.isPurchased) return;
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('payment_success') === 'true') {
            const txnId = queryParams.get('txn_id') || 'TXN-REF';
            const method = queryParams.get('method') || 'Stripe';

            setLastTxn({ id: txnId, method });
            setReceiptDetails(prev => ({
                ...prev,
                method,
                name: localStorage.getItem('last_purchaser_name') || 'Guest',
                email: localStorage.getItem('last_purchaser_email') || 'no-email@test.com'
            }));

            setModalStep(3);
            setShowReceiptModal(true);

            // Show successful modal (Manual download only now)
            setModalStep(3);
            setShowReceiptModal(true);

            // Clear the URL params
            navigate(`/poems/${id}`, { replace: true });
        }
    }, [poem, id, navigate]);

    const handleLike = async () => {
        try {
            let guestId = localStorage.getItem('guestId');
            if (!guestId && !localStorage.getItem('token')) {
                guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
                localStorage.setItem('guestId', guestId);
            }
            const { data } = await API.post(`/poems/${id}/like`, { guestId });
            setLikes(data.likes);
            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Like error:", error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            const { data } = await API.post(`/poems/${id}/comment`, {
                text: comment,
                username: guestName,
                email: guestEmail
            });
            setComments(data);
            setComment('');
            setGuestName('');
            setGuestEmail('');
            setShowReflectionModal(false);
            setReflectionSent(true);
            setTimeout(() => setReflectionSent(false), 5000);
        } catch (error) {
            console.error("Comment error:", error);
            alert("Failed to post reflection. " + (error.response?.data?.message || ''));
        }
    };

    const handlePurchase = async () => {
        setPurchasing(true);
        try {
            const stripe = await stripePromise;

            // Save guest info for verification page if guest
            localStorage.setItem('last_purchaser_name', guestName || 'Guest');
            localStorage.setItem('last_purchaser_email', guestEmail || 'no-email@test.com');

            const { data } = await API.post('/payments/create-checkout-session', {
                poemId: id,
                guestEmail: guestEmail
            });

            if (data.url) {
                window.location.href = data.url; // Redirect to real Stripe checkout
                return;
            }

            if (!stripe) return handleSimulateSuccess();
            const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
            if (error) console.error(error);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to initiate payment.');
        } finally {
            setPurchasing(false);
        }
    };

    const handlePayPalSuccess = async (details, data) => {
        try {
            setPurchasing(true);
            const orderId = data.orderID;

            // Call backend to capture and record
            const response = await API.post('/payments/paypal/capture-order', {
                orderId: orderId,
                poemId: id,
                guestName: receiptDetails.name,
                guestEmail: receiptDetails.email
            });

            if (response.data.success) {
                // Mark as purchased locally
                const guestPurchases = JSON.parse(localStorage.getItem('guestPurchases') || '[]');
                if (!guestPurchases.includes(id)) {
                    guestPurchases.push(id);
                    localStorage.setItem('guestPurchases', JSON.stringify(guestPurchases));
                }
                setPoem(prev => ({ ...prev, isPurchased: true }));
                setModalStep(3);
                setLastTxn({ id: orderId, method: 'PayPal' });
            } else {
                alert('PayPal verification failed: ' + response.data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to finalize PayPal payment. ' + (err.response?.data?.message || ''));
        } finally {
            setPurchasing(false);
        }
    };

    const handleTelebirrReal = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setPurchasing(true);
        try {
            const { data } = await API.post('/payments/telebirr/create', { poemId: id });
            // Redirect to Telebirr H5 URL or show modal
            window.open(data.payUrl, '_blank');
        } catch (err) {
            alert("Telebirr Error: " + (err.response?.data?.message || err.message));
        } finally {
            setPurchasing(false);
        }
    };

    const handleChapa = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setPurchasing(true);
            // Save for return trip
            localStorage.setItem('last_purchaser_name', receiptDetails.name);
            localStorage.setItem('last_purchaser_email', receiptDetails.email);

            try {

            const { data } = await API.post('/payments/chapa/initialize', {
                poemId: id,
                guestName: receiptDetails.name,
                guestEmail: receiptDetails.email
            });
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                throw new Error("Missing checkout URL from Chapa");
            }
        } catch (err) {
            alert("Chapa Error: " + (err.response?.data?.message || err.message));
        } finally {
            setPurchasing(false);
        }
    };

    const downloadBoth = (method = null, txnId = null) => {
        if (isRestrictedAdmin) {
            alert("Administrative Error: Your account is restricted from downloading official manuscripts.");
            return;
        }
        const m = method || lastTxn.method || 'Digital';
        const t = txnId || lastTxn.id || 'REF-TXN';
        
        // 1. First Download: Receipt
        generateReceiptPDF(t);
        setReceiptDownloaded(true);
        
        // 2. Small Delay then Second Download: Poem
        setTimeout(() => {
            downloadPDF(m, t);
            setPoemDownloaded(true);
        }, 1000); // 1s delay to avoid browser blocking multiple downloads
    };

    const downloadPDF = async (method = null, txnId = null) => {
        if (isRestrictedAdmin) return;
        try {
            // If it's a manuscript/book PDF, download the file directly
            if (poem.pdfPath) {
                const response = await fetch(`${BASE_URL}/${poem.pdfPath.replace(/\\/g, '/')}`);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${poem.title.replace(/\s+/g, '_')}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }

            // For regular text poems — build a beautiful PDF with jsPDF directly
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 25;
            const contentWidth = pageWidth - margin * 2;

            // Background
            pdf.setFillColor(252, 250, 247);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            // Decorative top border
            pdf.setFillColor(180, 140, 100);
            pdf.rect(0, 0, pageWidth, 3, 'F');

            // Title
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(28);
            pdf.setTextColor(15, 23, 42);
            pdf.text(poem.title || 'Untitled', pageWidth / 2, 35, { align: 'center' });

            // Author
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(13);
            pdf.setTextColor(120, 100, 80);
            pdf.text(`by ${poem.authorName || 'Unknown'}`, pageWidth / 2, 47, { align: 'center' });

            // Divider
            pdf.setDrawColor(180, 140, 100);
            pdf.setLineWidth(0.4);
            pdf.line(margin + 20, 55, pageWidth - margin - 20, 55);

            // Poem content — split lines properly
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(13);
            pdf.setTextColor(30, 30, 30);
            const poemText = poem.content || '';
            const lines = pdf.splitTextToSize(poemText, contentWidth);
            let y = 68;
            lines.forEach(line => {
                if (y > pageHeight - 30) {
                    pdf.addPage();
                    pdf.setFillColor(252, 250, 247);
                    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                    y = 25;
                }
                pdf.text(line, margin, y);
                y += 8;
            });

            // Footer
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(9);
            pdf.setTextColor(160, 140, 120);
            pdf.text(`Transaction: ${txnId || 'N/A'} • Method: ${method || 'N/A'} • ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Decorative bottom border
            pdf.setFillColor(180, 140, 100);
            pdf.rect(0, pageHeight - 3, pageWidth, 3, 'F');

            pdf.save(`${(poem.title || 'poem').replace(/\s+/g, '_')}_${method || 'poem'}.pdf`);
        } catch (err) {
            console.error('Poem download error:', err);
            alert('Poem download failed. Please try again.');
        }
    };

    const downloadMedia = () => {
        const url = `${BASE_URL}/${poem.videoPath.replace(/\\/g, '/')}`;
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${poem.title.replace(/\s+/g, '_')}_media`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [downloadAfter, setDownloadAfter] = useState(false);
    const [receiptDetails, setReceiptDetails] = useState({ name: '', email: '', method: 'Stripe', phone: '' });

    // Restricted Administrative Access Check
    // The restriction now follows the email entered for the purchase.
    const isRestrictedAdmin = receiptDetails.email === 'bwwmas@gmail.com';
    const [receiptDownloaded, setReceiptDownloaded] = useState(false);
    const [poemDownloaded, setPoemDownloaded] = useState(false);

    const handleSimulateSuccess = () => {
        setDownloadAfter(false);
        setModalStep(1);
        setShowReceiptModal(true);
        setReceiptDownloaded(false);
        setPoemDownloaded(false);
    };

    const handleDownloadWithReceipt = () => {
        setDownloadAfter(true);
        setModalStep(1); // Allow selecting method for receipt even if purchased
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        setReceiptDetails({
            name: user ? user.username : '',
            email: user ? user.email : '',
            method: poem.paymentMethod || 'Stripe',
            phone: poem.transactionId || ''
        });
        setShowReceiptModal(true);
    };

    const selectMethodForDownload = (method) => {
        setReceiptDetails(prev => ({ ...prev, method }));
        setModalStep(2);
    };

    const processSimulatedCheckout = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        // Manual Validation since we are outside a <form>
        if (!receiptDetails.name || !receiptDetails.email) {
            alert("Please provide your name and email.");
            return;
        }

        if (receiptDetails.method === 'Telebirr' && !receiptDetails.phone) {
            alert("Please enter the Transaction Code from your SMS confirmation.");
            return;
        }

        setPurchasing(true);
        try {
            const realTxnId = receiptDetails.phone ? receiptDetails.phone.trim() : `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            await API.post('/payments/simulate-success', {
                poemId: id,
                guestName: receiptDetails.name,
                guestEmail: receiptDetails.email,
                transactionId: realTxnId,
                method: receiptDetails.method
            });
            const guestPurchases = JSON.parse(localStorage.getItem('guestPurchases') || '[]');
            if (!guestPurchases.includes(id)) {
                guestPurchases.push(id);
                localStorage.setItem('guestPurchases', JSON.stringify(guestPurchases));
            }
            setPoem(prev => ({ ...prev, isPurchased: true }));
            setModalStep(3);
            setPurchasing(false);
            setLastTxn({ id: realTxnId, method: receiptDetails.method });
        } catch (err) {
            console.error(err);
            alert('Payment processing failed.');
            setPurchasing(false);
        }
    };

    const generateReceiptPDF = (txnId) => {
        if (isRestrictedAdmin) return;
        const pdf = new jsPDF('p', 'mm', 'a5');
        pdf.setFillColor(248, 249, 250);
        pdf.rect(0, 0, 150, 210, 'F');
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.setTextColor(15, 23, 42);
        pdf.text("Official Receipt", 75, 25, null, null, "center");
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
        pdf.text(`Transaction ID: ${txnId}`, 20, 55);
        pdf.text(`Payment Method: ${receiptDetails.method}`, 20, 65);
        pdf.text(`Name: ${receiptDetails.name}`, 20, 85);
        pdf.text(`Email: ${receiptDetails.email}`, 20, 95);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Total Paid: $${poem.price}`, 130, 170, null, null, "right");
        pdf.save(`Receipt_${poem.title.replace(/\s+/g, '_')}.pdf`);
    };

    if (loading) return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #fdf8f0 0%, #f5ede0 100%)'
        }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>📜</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#8c7851', letterSpacing: '0.05em' }}>Opening the scroll…</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
    if (error) return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #fdf8f0 0%, #f5ede0 100%)'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕊️</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#2d2015', marginBottom: '0.5rem' }}>Masterpiece not found</h2>
            <p style={{ color: '#8c7851' }}>This verse may have drifted away…</p>
        </div>
    );
    if (!poem) return null;

    return (
        <Elements stripe={stripePromise}>
            <div style={{
                background: isDark
                    ? 'radial-gradient(circle at top right, #1e293b, #0f172a 70%)'
                    : 'radial-gradient(circle at top left, #fdfcfb 0%, #e2d1c3 100%)',
                minHeight: '100vh',
                transition: 'background 0.5s ease',
                paddingBottom: '5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* ─── BACKGROUND TEXTURE & DECOR ─── */}
                <div style={{
                    position: 'fixed', inset: 0,
                    opacity: 0.03, pointerEvents: 'none', zIndex: 1,
                    background: 'url("https://www.transparenttextures.com/patterns/60-lines.png")'
                }} />

                {/* Floating Shapes */}
                <div style={{
                    position: 'absolute', top: '10%', right: '-5%', width: '40vw', height: '40vw',
                    borderRadius: '50%', background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(140, 120, 81, 0.08)',
                    filter: 'blur(100px)', zIndex: 0, animation: 'pulse 15s infinite alternate'
                }} />
                <div style={{
                    position: 'absolute', bottom: '15%', left: '-10%', width: '35vw', height: '35vw',
                    borderRadius: '50%', background: isDark ? 'rgba(225,29,72,0.03)' : 'rgba(140, 120, 81, 0.05)',
                    filter: 'blur(120px)', zIndex: 0, animation: 'pulse 20s infinite alternate-reverse'
                }} />

                <style>{`
                @keyframes pulse {
                    from { transform: translate(0, 0) scale(1); }
                    to { transform: translate(20px, -30px) scale(1.1); }
                }
            `}</style>

                {/* ─── HERO BANNER ─── */}
                <div style={{
                    background: isDark
                        ? 'linear-gradient(180deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0) 100%)'
                        : 'linear-gradient(180deg, rgba(140, 120, 81, 0.08) 0%, rgba(253, 248, 240, 0) 100%)',
                    padding: '1rem 2rem 2rem', // Reduced padding to push content UP
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'background 0.5s ease'
                }}>
                    {/* Back button - MOVED TO TOP LEFT */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                                color: isDark ? '#94a3b8' : '#8c7851',
                                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(140, 120, 81, 0.05)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(140, 120, 81, 0.15)'}`,
                                borderRadius: '12px',
                                padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease', letterSpacing: '0.02em',
                                backdropFilter: 'blur(10px)',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(140, 120, 81, 0.1)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(140, 120, 81, 0.05)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span style={{ fontSize: '1rem' }}>←</span> Back to Poem List
                        </button>
                    </div>

                    {/* Category badge - MOVED INSIDE CARD */}
                </div>

                {/* ─── MAIN CONTENT AREA ─── */}
                <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem 6rem', marginTop: '-3rem' }}>
                    {/* ═══════════════ POEM CARD ═══════════════ */}
                    <div style={{
                        background: isDark
                            ? 'rgba(30, 41, 59, 0.4)'
                            : 'linear-gradient(135deg, #ffffff 0%, #fcfaf7 100%)',
                        backdropFilter: 'blur(30px)',
                        borderRadius: '32px',
                        padding: '3rem 2.5rem',
                        boxShadow: isDark
                            ? '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)'
                            : '0 25px 60px -15px rgba(140, 120, 81, 0.2)',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.8)',
                        position: 'relative',
                        zIndex: 10,
                        animation: 'cardIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        userSelect: 'text',
                        ...(poem.pdfPath ? { userSelect: 'none', WebkitUserSelect: 'none' } : {}),
                    }}>
                        <style>{`
                        @keyframes cardIn {
                            from { opacity: 0; transform: translateY(30px) scale(0.98); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}</style>

                        {/* Compact Category Badge (Refined) */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
                            <span style={{
                                padding: '0.4rem 1.2rem',
                                borderRadius: '100px',
                                background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(140, 120, 81, 0.08)',
                                color: isDark ? '#818cf8' : '#8c7851',
                                fontSize: '0.7rem',
                                fontWeight: '900',
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(140, 120, 81, 0.2)'}`
                            }}>{poem.category || 'Fine Verse'}</span>
                        </div>

                        {/* Poem Title Section */}
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <p style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.65rem',
                                color: isDark ? '#94a3b8' : '#8c7851',
                                letterSpacing: '0.4em',
                                textTransform: 'uppercase',
                                fontWeight: '700',
                                margin: '0 0 0.75rem',
                                opacity: 0.7
                            }}>A collection by {poem.authorName}</p>
                            <h1 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 'clamp(2rem, 5vw, 3rem)',
                                fontWeight: '900',
                                color: isDark ? '#f8fafc' : '#1a1108',
                                margin: '0',
                                lineHeight: '1',
                                letterSpacing: '-0.04em'
                            }}>{poem.title}</h1>
                        </div>

                        {/* Refined Ornament */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1.2rem',
                            marginBottom: '1.5rem',
                        }}>
                            <div style={{ height: '1px', width: 'clamp(20px, 8vw, 60px)', background: isDark ? 'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.3))' : 'linear-gradient(to right, transparent, rgba(140, 120, 81, 0.2))' }} />
                            <div style={{
                                color: isDark ? '#818cf8' : '#c4a06a',
                                fontSize: '1.1rem',
                                transform: 'translateY(-1px)'
                            }}>❧</div>
                            <div style={{ height: '1px', width: 'clamp(20px, 8vw, 60px)', background: isDark ? 'linear-gradient(to left, transparent, rgba(99, 102, 241, 0.3))' : 'linear-gradient(to left, transparent, rgba(140, 120, 81, 0.2))' }} />
                        </div>

                        {/* Poem Content - CENTERED & COMPACT */}
                        <div style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                            lineHeight: '2.2',
                            color: isDark ? '#cbd5e1' : '#2d2a26',
                            whiteSpace: 'pre-wrap',
                            textAlign: 'center',
                            fontStyle: 'italic',
                            maxWidth: '600px',
                            margin: '0 auto',
                            letterSpacing: '0.01em'
                        }}>
                            {poem.content && poem.content.includes('[Digital Manuscript:')
                                ? 'Full-length illustrated manuscript. Open the reader below to explore the complete collection.'
                                : poem.content || 'Explore this professional collection of verse.'}
                        </div>
                        {/* ═══════════════ UNIFIED ACTION CENTER (Inside Card) ═══════════════ */}
                        <div style={{
                            marginTop: '3rem',
                            paddingTop: '2.5rem',
                            borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(140, 120, 81, 0.1)',
                            display: 'flex', flexDirection: 'column', gap: '2rem'
                        }}>
                            {/* 1. Media Toggle Buttons */}
                            {(poem.audioPath || poem.videoPath) && (
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {poem.audioPath && (
                                        <button
                                            onClick={toggleAudio}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                                padding: '0.75rem 1.5rem', borderRadius: '12px',
                                                background: isPlayingAudio ? '#8c7851' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(140, 120, 81, 0.05)'),
                                                color: isPlayingAudio ? '#fff' : (isDark ? '#e2e8f0' : '#8c7851'),
                                                border: isPlayingAudio ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(140, 120, 81, 0.2)'}`,
                                                fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <span>{isPlayingAudio ? '⏸ Stop Audio' : '🎧 Listen to Audio'}</span>
                                        </button>
                                    )}
                                    {poem.videoPath && (
                                        <button
                                            onClick={toggleVideo}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                                padding: '0.75rem 1.5rem', borderRadius: '12px',
                                                background: showVideo ? '#8c7851' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(140, 120, 81, 0.05)'),
                                                color: showVideo ? '#fff' : (isDark ? '#e2e8f0' : '#8c7851'),
                                                border: showVideo ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(140, 120, 81, 0.2)'}`,
                                                fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <span>{showVideo ? '✕ Close Video' : '🎬 Watch Reading'}</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* 2. Conditionally Revealed Media Players */}
                            <div style={{ transition: 'all 0.5s ease', overflow: 'hidden' }}>
                                {isPlayingAudio && poem.audioPath && (
                                    <div style={{ marginBottom: '1.5rem', animation: 'fadeInUp 0.4s ease' }}>
                                        <audio
                                            autoPlay controls
                                            src={`http://localhost:5000/${poem.audioPath.replace(/\\/g, '/')}`}
                                            style={{ width: '100%', borderRadius: '12px', height: '44px' }}
                                        />
                                    </div>
                                )}
                                {showVideo && poem.videoPath && (
                                    <div style={{
                                        marginBottom: '1.5rem', animation: 'fadeInUp 0.4s ease',
                                        borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                                    }}>
                                        <video
                                            autoPlay controls controlsList="nodownload"
                                            src={`http://localhost:5000/${poem.videoPath.replace(/\\/g, '/')}`}
                                            style={{ width: '100%', display: 'block', maxHeight: '440px', background: '#000' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* 3. Primary Action & Meta Metrics */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                <button
                                    onClick={poem.isPurchased ? handleDownloadWithReceipt : handleSimulateSuccess}
                                    style={{
                                        background: isDark ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #2d261e, #1a1510)',
                                        color: '#fff',
                                        padding: '1.1rem 2.8rem',
                                        borderRadius: '16px',
                                        fontSize: '0.9rem',
                                        fontWeight: '900',
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                                        transition: 'all 0.3s ease',
                                        width: '100%',
                                        maxWidth: '400px'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)'; }}
                                >
                                    {poem.isPurchased ? '🧾 Official Receipt & Download' : `✨ Acquire official Collection · $${poem.price}`}
                                </button>

                                {/* Likes/Comments Bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                                    <button
                                        onClick={handleLike}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'none', border: 'none',
                                            cursor: 'pointer', color: isDark ? '#94a3b8' : '#6b665c', fontWeight: '700'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.4rem', color: isLiked ? '#e11d48' : 'inherit' }}>{isLiked ? '❤️' : '🤍'}</span>
                                        {likes}
                                    </button>
                                    <button
                                        onClick={() => setShowReflectionModal(true)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'none', border: 'none',
                                            cursor: 'pointer', color: isDark ? '#94a3b8' : '#6b665c', fontWeight: '700'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.4rem' }}>💬</span>
                                        {comments.length}
                                    </button>
                                </div>
                            </div>

                            {/* Ornament Footer */}
                            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                <div style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: isDark ? '#475569' : '#a09078', fontWeight: '800', opacity: 0.5 }}>— FIN —</div>
                            </div>

                            <style>{`
                            @keyframes fadeInUp {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>
                        </div>
                    </div>

                    {/* Per-Poem Manuscript Viewer (View-Only, No Download) */}
                    {poem.manuscriptUrl && (
                        <div style={{ marginTop: '4rem' }}>
                            <div style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(140,120,81,0.1)'}`, paddingBottom: '0.5rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: '900', color: isDark ? '#f8fafc' : '#1a1108' }}>📜 Manuscript Reader</h3>
                                <span style={{ fontSize: '0.55rem', fontWeight: '900', color: '#059669', background: 'rgba(5,150,105,0.1)', padding: '0.2rem 0.6rem', borderRadius: '100px' }}>🔒 VIEW ONLY</span>
                            </div>
                            <div
                                onClick={() => setShowPdfModal(true)}
                                style={{ position: 'relative', cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', height: '260px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                            >
                                <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(poem.manuscriptUrl)}&embedded=true`}
                                    style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                                    title="Manuscript Preview"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                                {/* Overlay to prevent interaction on preview */}
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(1px)' }}>
                                    <div style={{ background: '#fff', padding: '0.6rem 1.4rem', borderRadius: '50px', fontWeight: '900', fontSize: '0.75rem' }}>📖 Open Manuscript Reader</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── MANUSCRIPT MODAL (View-Only, no download/copy) ─── */}
                {showPdfModal && poem.manuscriptUrl && (
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowPdfModal(false); }}
                    >
                        <style>{`
                            .manuscript-frame { pointer-events: none; }
                            .manuscript-overlay {
                                position: absolute; inset: 60px 0 0 0;
                                z-index: 10; background: transparent;
                                user-select: none; -webkit-user-select: none;
                            }
                        `}</style>
                        <div style={{
                            width: '94vw', maxWidth: '1100px', height: '92vh', background: isDark ? '#0f172a' : '#fefaf0',
                            borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.6)'
                        }}>
                            {/* Header */}
                            <div style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(140,120,81,0.06)', borderBottom: '1px solid rgba(180,140,80,0.15)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>📜</span>
                                    <h3 style={{ color: isDark ? '#f1f5f9' : '#1a1108', fontWeight: '900', fontSize: '1rem' }}>{poem.title} — Manuscript</h3>
                                    <span style={{ fontSize: '0.5rem', fontWeight: '900', color: '#059669', background: 'rgba(5,150,105,0.1)', padding: '0.15rem 0.5rem', borderRadius: '100px' }}>🔒 VIEW ONLY · NO DOWNLOAD</span>
                                </div>
                                <button onClick={() => setShowPdfModal(false)} style={{ background: 'none', border: 'none', color: isDark ? '#fff' : '#000', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                            </div>
                            {/* View-only overlay div that blocks right-click/drag */}
                            <div className="manuscript-overlay" onContextMenu={(e) => e.preventDefault()} />
                            {/* The actual viewer using Google Docs */}
                            <iframe
                                className="manuscript-frame"
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(poem.manuscriptUrl)}&embedded=true`}
                                style={{ width: '100%', height: 'calc(100% - 60px)', border: 'none', display: 'block' }}
                                title="Full Manuscript"
                                sandbox="allow-scripts allow-same-origin"
                            />
                        </div>
                    </div>
                )}

                {/* ─── REFLECTION MODAL ─── */}
                {showReflectionModal && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 4000,
                        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
                    }}>
                        <div style={{
                            background: isDark ? '#1e293b' : '#fff', borderRadius: '24px', padding: '2rem',
                            maxWidth: '440px', width: '100%', position: 'relative', boxShadow: '0 50px 120px rgba(0,0,0,0.5)'
                        }}>
                            <button onClick={() => setShowReflectionModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', fontSize: '1.5rem', color: isDark ? '#94a3b8' : '#334155', cursor: 'pointer' }}>&times;</button>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖋️</div>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: '900', color: isDark ? '#f8fafc' : '#1a0f06' }}>Leave a Reflection</h3>
                            </div>
                            <form onSubmit={handleComment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <input required placeholder="Name" value={guestName} onChange={e => setGuestName(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#fdfaf6', border: '1px solid rgba(0,0,0,0.1)', color: isDark ? '#f8fafc' : '#1a0f06' }} />
                                    <input required type="email" placeholder="Email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#fdfaf6', border: '1px solid rgba(0,0,0,0.1)', color: isDark ? '#f8fafc' : '#1a0f06' }} />
                                </div>
                                <textarea required placeholder="Your thoughts..." value={comment} onChange={e => setComment(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#fdfaf6', border: '1px solid rgba(0,0,0,0.1)', color: isDark ? '#f8fafc' : '#1a0f06', minHeight: '120px' }} />
                                <button type="submit" style={{ padding: '1rem', borderRadius: '12px', background: isDark ? '#6366f1' : '#1a1b1e', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>Send Reflection</button>
                            </form>
                        </div>
                    </div>
                )}

                {showReceiptModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[24px] p-7 max-w-[480px] w-full relative shadow-2xl max-h-[95vh] overflow-y-auto">
                            <button onClick={() => setShowReceiptModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors">✕</button>

                            {modalStep === 1 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-black text-center mb-4 text-black uppercase tracking-tight">Select Payment</h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'PayPal', icon: '💳', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                                            { id: 'Stripe', icon: '⚡', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                                            { id: 'Chapa', icon: '💎', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
                                        ].map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => selectMethodForDownload(m.id)}
                                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all hover:scale-[1.03] active:scale-95 ${m.color}`}
                                            >
                                                <span className="text-2xl">{m.icon}</span>
                                                <span className="font-bold">{m.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {modalStep === 2 && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="relative flex items-center justify-center pb-3">
                                        <button onClick={() => setModalStep(1)} type="button" className="absolute left-0 text-slate-300 hover:text-indigo-600 transition-colors text-xl">←</button>
                                        <h2 className="text-xl font-bold text-[#1a1814] font-serif">Access Details</h2>
                                        <span className="absolute right-0 px-2.5 py-0.5 bg-slate-100 text-[9px] font-black rounded-full uppercase text-slate-400 tracking-tighter">{receiptDetails.method}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <input required placeholder="Your Name" value={receiptDetails.name} onChange={e => setReceiptDetails({ ...receiptDetails, name: e.target.value })} className="w-full px-3 py-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-black" />
                                        <input required placeholder="Email" type="email" value={receiptDetails.email} onChange={e => setReceiptDetails({ ...receiptDetails, email: e.target.value })} className="w-full px-3 py-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-black" />
                                    </div>

                                    {receiptDetails.method === 'Chapa' ? (
                                        <div className="space-y-4">
                                            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center space-y-3">
                                                <div className="text-3xl">💎</div>
                                                <h3 className="font-bold text-emerald-900">Pay with Chapa</h3>
                                                <p className="text-[10px] text-emerald-700 leading-tight">You will be redirected to Chapa's secure checkout to complete your purchase of "${poem.title}".</p>
                                            </div>
                                            <button
                                                onClick={handleChapa}
                                                disabled={purchasing}
                                                className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                {purchasing ? 'Wait...' : 'Proceed to Checkout'}
                                                {!purchasing && <span className="text-base">→</span>}
                                            </button>
                                        </div>
                                    ) : receiptDetails.method === 'PayPal' ? (
                                        <div className="pt-2 space-y-3">
                                            {(!process.env.REACT_APP_PAYPAL_CLIENT_ID || process.env.REACT_APP_PAYPAL_CLIENT_ID.includes('your_')) && (
                                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-3">
                                                    <div className="text-[10px] font-black uppercase text-blue-600 mb-1">Developer Notice</div>
                                                    <p className="text-[10px] text-blue-800 leading-tight mb-3">PayPal is in simulation mode. Use the button below to test the success flow.</p>
                                                    <button 
                                                        onClick={processSimulatedCheckout}
                                                        className="w-full bg-blue-600 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-wider shadow-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        Simulate PayPal Payment success
                                                    </button>
                                                </div>
                                            )}
                                            <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: "USD" }}>
                                                <PayPalButtons
                                                    style={{ layout: "vertical", shape: "pill", label: "pay", height: 45 }}
                                                    createOrder={async () => {
                                                        try {
                                                            const res = await API.post('/payments/paypal/create-order', { poemId: id });
                                                            return res.data.id;
                                                        } catch (e) {
                                                            console.error("PayPal Error:", e);
                                                            alert(e.response?.data?.message || "Failed to initiate PayPal. Use simulation mode above if testing.");
                                                            throw e; // Stop the flow, prevent SDK from trying to use an invalid ID
                                                        }
                                                    }}
                                                    onApprove={async (data, actions) => handlePayPalSuccess(null, data)}
                                                />
                                            </PayPalScriptProvider>
                                        </div>
                                    ) : (
                                        <StripeCheckoutForm
                                            poem={poem}
                                            receiptDetails={receiptDetails}
                                            onSuccess={(txnId) => {
                                                setLastTxn({ id: txnId, method: 'Stripe' });
                                                setPoem({ ...poem, isPurchased: true });
                                                setModalStep(3);
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {modalStep === 3 && (
                                <div className="text-center py-6 space-y-5">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl">✓</div>
                                    <h2 className="text-2xl font-black text-black">Masterpiece Unlocked!</h2>
                                    
                                    {isRestrictedAdmin ? (
                                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 space-y-3">
                                            <div className="text-2xl">⚠️</div>
                                            <p className="text-xs font-bold text-amber-800 leading-relaxed">
                                                Your administrative account is restricted from direct downloads to maintain platform integrity.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <button 
                                                onClick={() => downloadBoth(lastTxn.method, lastTxn.id)}
                                                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-[12px] uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                📥 Download All (Receipt + Poem)
                                            </button>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <button onClick={() => { generateReceiptPDF(lastTxn.id); setReceiptDownloaded(true); }} className={`font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-wider ${receiptDownloaded ? 'bg-slate-50 text-slate-300 border border-slate-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                    {receiptDownloaded ? '✓ Receipt' : '🧾 Receipt'}
                                                </button>
                                                <button onClick={() => { downloadPDF(lastTxn.method, lastTxn.id); setPoemDownloaded(true); }} className={`font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-wider ${poemDownloaded ? 'bg-slate-50 text-slate-300 border border-slate-100' : 'bg-[#c4a06a]/10 text-[#c4a06a] hover:bg-[#c4a06a]/20'}`}>
                                                    {poemDownloaded ? '✓ Collection' : '📜 Collection'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 text-xs py-2 hover:text-slate-600 transition-colors">Close & Continue</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Elements>
    );
}

function StripeCheckoutForm({ poem, receiptDetails, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Create Payment Intent on backend
            const { data } = await API.post('/payments/create-payment-intent', { poemId: poem._id });

            // 2. Handle Demo Mode (If keys are placeholder)
            if (data.clientSecret && data.clientSecret.startsWith('DEMO_SECRET')) {
                const txnId = `DEMO-CARD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
                await API.post('/payments/simulate-success', {
                    poemId: poem._id,
                    guestName: receiptDetails.name,
                    guestEmail: receiptDetails.email,
                    transactionId: txnId,
                    method: 'Stripe'
                });
                onSuccess(txnId);
                return;
            }

            // 3. Confirm the payment with Stripe
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: receiptDetails.name,
                        email: receiptDetails.email,
                    },
                }
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                    // Record in our DB
                    await API.post('/payments/verify-stripe', {
                        sessionId: result.paymentIntent.id,
                        poemId: poem._id,
                        guestName: receiptDetails.name,
                        guestEmail: receiptDetails.email
                    });
                    onSuccess(result.paymentIntent.id);
                } else {
                    setError('Payment failed or was cancelled.');
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                {(!stripe || !elements) ? (
                    <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block mb-1">Demo Mode Enabled</div>
                        <input className="w-full bg-transparent border-none text-xs font-mono text-slate-400" placeholder="4242 4242 4242 4242" disabled />
                    </div>
                ) : (
                    <CardElement options={{
                        style: {
                            base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
                            invalid: { color: '#9e2146' },
                        },
                    }} />
                )}
            </div>
            {error && <div className="text-red-500 text-[10px] font-bold text-center bg-red-50 py-2 rounded-lg">{error}</div>}
            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-[#6366f1] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
                {loading ? 'Verifying Card...' : `Secure Pay $${poem.price}`}
            </button>
            <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={async () => {
                        try {
                            const { data } = await API.post('/payments/create-checkout-session', { poemId: poem._id });
                            if (data.id) {
                                if (data.id.startsWith('DEMO_')) {
                                    window.open(`/stripe-demo?id=${data.id}&amount=${poem.price}&title=${poem.title}`, '_blank');
                                } else {
                                    window.location.href = `https://checkout.stripe.com/pay/${data.id}`;
                                }
                            }
                        } catch (err) {
                            alert(err.response?.data?.message || "Stripe hosted checkout is not available. Please use the card field above.");
                        }
                    }}
                    className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold underline"
                >
                    Prefer Stripe's Hosted Checkout Page?
                </button>
            </div>
        </form>
    );
}

export default PoemViewer;
