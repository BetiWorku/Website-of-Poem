import React, { useState, useEffect } from 'react';
import API from '../api';

function ManageMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replying, setReplying] = useState(null); // Full message object being replied to
    const [replyContent, setReplyContent] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const { data } = await API.get('/contact');
            setMessages(data);
        } catch (error) {
            console.error("Fetch messages error:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteMessage = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await API.delete(`/contact/${id}`);
            setMessages(messages.filter(m => m._id !== id));
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setSending(true);
        try {
            await API.post('/contact/reply', {
                to: replying.email,
                originalName: replying.name,
                originalMessage: replying.message,
                replyMessage: replyContent
            });
            alert('Reply sent successfully!');
            setReplying(null);
            setReplyContent('');
        } catch (error) {
            console.error("Reply error:", error);
            alert('Error sending reply. Please check your admin email settings.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{ padding: '2rem', minHeight: '100vh', background: '#fcfcfc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>Reader Inquiries</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>Direct correspondence from your poetry audience.</p>
                </div>
                <div style={{ background: '#f1f5f9', padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: '700', color: '#475569' }}>
                    {messages.length} Active Conversations
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>Loading your inbox...</div>
            ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '2rem', border: '2px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <p style={{ color: '#64748b', fontSize: '1.2rem' }}>No pending messages from readers.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                    {messages.map((m) => (
                        <div key={m._id} style={{ 
                            background: 'white', 
                            padding: '2rem', 
                            borderRadius: '2rem', 
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '44px', height: '44px', background: '#e2e8f0', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        🖋️
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{m.name}</h3>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{m.email}</p>
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '800' }}>
                                    {new Date(m.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1.5rem', marginBottom: '1.5rem', flex: 1, minHeight: '120px', lineHeight: '1.6', color: '#334155', border: '1px solid #f1f5f9' }}>
                                <p style={{ margin: 0 }}>"{m.message}"</p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    onClick={() => deleteMessage(m._id)}
                                    style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900', cursor: 'pointer' }}
                                >
                                    ARCHIVE
                                </button>
                                <button
                                    onClick={() => setReplying(m)}
                                    style={{ background: '#92400e', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900', cursor: 'pointer' }}
                                >
                                    SEND REFLECTION
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Premium Reply Modal */}
            {replying && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'slide-up 0.3s ease-out' }}>
                        <div style={{ background: '#92400e', padding: '1.5rem', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>Replying to {replying.name}</h2>
                                    <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Direct Email Reflection</p>
                                </div>
                                <button onClick={() => setReplying(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            </div>
                        </div>

                        <form onSubmit={handleSendReply} style={{ padding: '1.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '1rem', borderLeft: '4px solid #92400e', marginBottom: '1.5rem' }}>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Original Message</p>
                                <p style={{ margin: 0, color: '#1e293b', fontStyle: 'italic', fontSize: '0.9rem' }}>"{replying.message}"</p>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>Your Response</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Pen your thoughts here..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '2px solid #f1f5f9', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem', color: '#1e293b' }}
                                    onFocus={(e) => e.target.style.borderColor = '#92400e'}
                                    onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setReplying(null)} style={{ flex: 1, padding: '0.85rem', borderRadius: '1rem', border: '2px solid #f1f5f9', background: 'transparent', color: '#64748b', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>CANCEL</button>
                                <button 
                                    type="submit" 
                                    disabled={sending}
                                    style={{ flex: 2, padding: '0.85rem', borderRadius: '1rem', border: 'none', background: '#92400e', color: 'white', fontWeight: '900', cursor: 'pointer', opacity: sending ? 0.6 : 1, transition: 'all 0.2s', fontSize: '0.85rem' }}
                                >
                                    {sending ? 'SENDING...' : 'DELIVER RESPONSE'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageMessages;
