import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState({ text: '', type: '' });

    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            
            // Check if the user is an admin
            if (data.role !== 'admin') {
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        setForgotMessage({ text: '', type: '' });
        setForgotLoading(true);
        try {
            await API.post('/auth/forgot-password', { email: forgotEmail });
            setForgotMessage({ text: 'Reset link sent to your inbox. Please check your email.', type: 'success' });
            setForgotEmail('');
        } catch (err) {
            setForgotMessage({ text: err.response?.data?.message || 'Error sending reset email.', type: 'error' });
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-900 relative overflow-hidden font-sans">
            {/* Dark background elements for admin vibe */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 md:p-8 relative z-10 transition-all duration-500">

                {/* Logo section */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h1 className="font-serif text-3xl font-black text-white tracking-tight">
                        {showForgot ? 'Reset Password' : 'Admin Portal'}
                    </h1>
                    <p className="font-sans text-sm text-slate-400 mt-2">
                        {showForgot ? 'Securely recover your access' : 'Secure access to PoetVerse management'}
                    </p>
                </div>

                {!showForgot ? (
                    <>
                        {error && (
                            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center font-sans">
                                <span className="flex items-center justify-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    {error}
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block font-sans text-sm font-semibold text-slate-300 ml-1">
                                    Admin Email
                                </label>
                                <div className="relative group">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="admin@poetverse.com"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 font-sans text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block font-sans text-sm font-semibold text-slate-300 ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-12 py-2.5 font-sans text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 1.24-2.34m6-6a11.09 11.09 0 0 1 3.76-.66c7 0 11 8 11 8a18.5 18.5 0 0 1-2.18 3.57M3 3l18 18"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/></svg>
                                        )}
                                    </button>
                                </div>
                                <div className="flex justify-end p-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgot(true)}
                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-blue-400 transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 bg-blue-600 text-white font-sans font-bold text-sm py-3 rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                        Authenticating…
                                    </>
                                ) : (
                                    <>
                                        Access Dashboard
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="space-y-4">
                        {forgotMessage.text && (
                            <div className={`px-4 py-3 rounded-xl border text-sm text-center font-sans ${forgotMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                {forgotMessage.text}
                            </div>
                        )}
                        <p className="text-xs text-slate-500 text-center px-2">
                            Enter your administrative email address and we will send you a secure link to reset your credentials.
                        </p>
                        <form onSubmit={handleForgot} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block font-sans text-sm font-semibold text-slate-300 ml-1">
                                    Recovery Email
                                </label>
                                <input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    placeholder="admin@poetverse.com"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 font-sans text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={forgotLoading}
                                className="w-full bg-blue-600 text-white font-sans font-bold text-sm py-3 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-60"
                            >
                                {forgotLoading ? 'Sending link…' : 'Send Reset Link'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForgot(false)}
                                className="w-full text-slate-500 hover:text-white text-xs font-bold transition-colors pt-2"
                            >
                                Return to Login
                            </button>
                        </form>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-700 flex justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="font-sans text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                        Return to Public Site
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
