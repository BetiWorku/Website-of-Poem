import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalPoems: 0,
        totalRevenue: 0,
        totalUsers: 0,
        totalLikes: 0,
        totalComments: 0,
        totalSubscribers: 0,
        totalMessages: 0
    });
    const [recentPoems, setRecentPoems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchDashboardData = async () => {
            try {
                // Using Promise.allSettled so if one endpoint fails, the others still work
                const results = await Promise.allSettled([
                    API.get('/poems/admin/analytics'),
                    API.get('/auth/users'),
                    API.get('/auth/profile'),
                    API.get('/contact')
                ]);

                const analyticsRes = results[0].status === 'fulfilled' ? results[0].value : { data: {} };
                const usersRes = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
                const profileRes = results[2].status === 'fulfilled' ? results[2].value : { data: {} };
                const contactRes = results[3].status === 'fulfilled' ? results[3].value : { data: [] };

                if (results.some(r => r.status === 'rejected')) {
                    console.warn("Some dashboard stats failed to load:", results.filter(r => r.status === 'rejected'));
                }

                const data = analyticsRes.data || {};
                const statsData = data.stats || {};
                const fetchedPoems = data.recentPoems || [];

                setStats({
                    totalPoems: statsData.totalPoems || 0,
                    totalRevenue: parseFloat(statsData.estimatedRevenue) || 0,
                    totalUsers: usersRes.data?.length || 0,
                    totalLikes: statsData.totalLikes || 0,
                    totalComments: statsData.totalComments || 0,
                    totalSubscribers: profileRes.data?.subscribers?.length || 0,
                    totalMessages: contactRes.data?.length || 0
                });
                setRecentPoems(fetchedPoems);
            } catch (error) {
                console.error("Critical Dashboard failure:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = [
        { label: 'Total Works', value: stats.totalPoems, icon: '📜', color: 'from-blue-500/10 to-blue-600/5', iconColor: 'text-blue-600' },
        { label: 'Appreciation', value: stats.totalLikes, icon: '❤️', color: 'from-rose-500/10 to-rose-600/5', iconColor: 'text-rose-600' },
        { label: 'Reflections', value: stats.totalComments, icon: '💬', color: 'from-purple-500/10 to-purple-600/5', iconColor: 'text-purple-600' },
        { label: 'Followers', value: stats.totalSubscribers, icon: '⭐', color: 'from-amber-500/10 to-amber-600/5', iconColor: 'text-amber-600' },
        { label: 'User Messages', value: stats.totalMessages, icon: '✉️', color: 'from-indigo-500/10 to-indigo-600/5', iconColor: 'text-indigo-600', path: '/admin/messages' },
        { label: 'Estimated Revenue', value: stats.totalRevenue ? `$${stats.totalRevenue.toFixed(2)}` : '$0.00', icon: '💰', color: 'from-emerald-500/10 to-emerald-600/5', iconColor: 'text-emerald-600' }
    ];

    return (
        <div className="p-8 space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="font-serif text-4xl font-black text-ink tracking-tight mb-2">
                        Welcome, {user?.username || 'Admin'}
                    </h1>
                    <p className="font-sans text-muted">A summary of your artistic influence and growth.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/add-poem')}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Masterpiece
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <div
                        key={idx}
                        onClick={() => card.path && navigate(card.path)}
                        className={`relative overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-2xl border border-border shadow-sm transition-all hover:shadow-md group ${card.path ? 'cursor-pointer hover:border-accent' : ''}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted mb-1">{card.label}</p>
                                <h3 className="text-2xl font-black text-ink dark:text-white">{card.value}</h3>
                            </div>
                            <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
                                {card.icon}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-full">
                            <svg className="mr-1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                            +12.5% this month
                        </div>
                    </div>
                ))}
            </div>

            {/* Tables & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Works */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="font-serif text-2xl font-black text-ink dark:text-white">Recent Publications</h2>
                        <button className="text-xs text-accent font-bold uppercase tracking-widest hover:underline">View All</button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-8 px-8">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border text-muted uppercase text-xs tracking-tighter font-bold">
                                        <th className="pb-4 pt-0">Title</th>
                                        <th className="pb-4 pt-0">Genre</th>
                                        <th className="pb-4 pt-0">Price</th>
                                        <th className="pb-4 pt-0 text-center">❤️ Likes</th>
                                        <th className="pb-4 pt-0 text-center">💬 Comments</th>
                                        <th className="pb-4 pt-0">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {recentPoems.map((poem, idx) => (
                                        <tr key={idx} className="group hover:bg-parchment/30 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="py-4 font-semibold text-ink dark:text-slate-100">{poem.title}</td>
                                            <td className="py-4"><span className="px-2.5 py-1 bg-parchment dark:bg-slate-700 text-xs rounded-lg text-muted font-medium">{poem.category}</span></td>
                                            <td className="py-4 font-mono text-sm">{poem.isFree ? 'Free' : `$${poem.price}`}</td>
                                            <td className="py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${poem.likes > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    {poem.likes > 0 ? '❤️' : '🤍'} {poem.likes || 0}
                                                </span>
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-600">
                                                    💬 {poem.comments || 0}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <button className="p-2 text-muted hover:text-accent transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                                                <button className="p-2 text-muted hover:text-danger ml-1 transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Most Liked Poems Leaderboard */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-border shadow-sm">
                    <h2 className="font-serif text-2xl font-black text-ink dark:text-white mb-2">Most Liked</h2>
                    <p className="text-xs text-muted mb-6 uppercase tracking-widest font-bold">Top poems by appreciation</p>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {[...recentPoems]
                                .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                                .slice(0, 6)
                                .map((poem, idx) => {
                                    const maxLikes = Math.max(...recentPoems.map(p => p.likes || 0), 1);
                                    const pct = Math.round(((poem.likes || 0) / maxLikes) * 100);
                                    const medals = ['🥇', '🥈', '🥉'];
                                    return (
                                        <div key={idx}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-base flex-shrink-0">{medals[idx] || `#${idx + 1}`}</span>
                                                    <span className="text-sm font-bold text-ink dark:text-slate-200 truncate">{poem.title}</span>
                                                </div>
                                                <span className={`text-xs font-black ml-2 flex-shrink-0 flex items-center gap-1 ${poem.likes > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                                                    ❤️ {poem.likes || 0}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-700"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            {recentPoems.length === 0 && (
                                <p className="text-sm text-muted text-center py-4">No poems yet.</p>
                            )}
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                        <p className="text-xs font-black uppercase tracking-widest text-rose-500 mb-1">Total Appreciations</p>
                        <p className="text-3xl font-black text-rose-600">{stats.totalLikes.toLocaleString()} ❤️</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
