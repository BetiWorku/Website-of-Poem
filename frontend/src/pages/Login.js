import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            // Redirect based on role
            if (data.role === 'admin') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setError('Admin users must use the Admin Portal to log in.');
                setLoading(false);
                return;
            } else {
                navigate('/');
            }

            // Force a slight delay to ensure localStorage is ready if needed, 
            // though SPA navigation usually handles this fine.
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-8 bg-cream relative overflow-hidden">
            {/* Background elements for depth */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-accent-light to-accent opacity-30"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-5 md:p-6 relative z-10 transition-all duration-500 hover:shadow-2xl">

                {/* Logo section */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-parchment flex items-center justify-center text-accent mb-2 transform -rotate-3 hover:rotate-0 transition-transform duration-300 shadow-inner">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                    </div>
                    <h1 className="font-serif text-3xl font-black text-ink tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="font-sans text-sm text-muted mt-2">
                        Sign in to your PoetVerse account
                    </p>
                </div>

                {error && (
                    <div className="mb-8 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-600 text-sm text-center font-sans animate-shake">
                        <span className="flex items-center justify-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {error}
                        </span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="block font-sans text-sm font-semibold text-ink ml-1">
                            Email Address
                        </label>
                        <div className="relative group">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                                className="w-full bg-cream/50 border border-border rounded-xl pl-11 pr-4 py-2.5 font-sans text-sm text-ink placeholder-muted/60 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="block font-sans text-sm font-semibold text-ink">
                                Password
                            </label>
                            <button type="button" className="text-xs text-accent hover:underline font-medium">Forgot?</button>
                        </div>
                        <div className="relative group">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-cream/50 border border-border rounded-xl pl-11 pr-12 py-2.5 font-sans text-sm text-ink placeholder-muted/60 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all duration-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 1.24-2.34m6-6a11.09 11.09 0 0 1 3.76-.66c7 0 11 8 11 8a18.5 18.5 0 0 1-2.18 3.57M3 3l18 18"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-1 bg-ink text-cream font-sans font-bold text-sm py-2.5 rounded-xl hover:bg-accent hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-black/5 hover:shadow-accent/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                Signing in…
                            </>
                        ) : (
                            <>
                                Sign In
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
