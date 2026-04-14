import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import API from '../api';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // Mobile toggle

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await API.get('/notifications');
                setNotifications(data);
            } catch (error) {
                console.error("Fetch notifications error:", error);
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllAsRead = async () => {
        try {
            await API.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Mark read error:", error);
        }
    };

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
        { name: 'Add New Poem', path: '/admin/add-poem', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
        { name: 'Manage Poems', path: '/admin/manage', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
        { name: 'Engagement', path: '/admin/interactions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
        { name: 'Financials', path: '/admin/transactions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
        { name: 'User Messages', path: '/admin/messages', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
        { name: 'Manage Users', path: '/admin/users', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
        { name: 'Register Admin', path: '/admin/register-admin', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
        { name: 'Settings', path: '/admin/settings', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
        { name: 'Logout', path: '#logout', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> },
    ];

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-2xl z-[100] flex items-center justify-center transition-transform active:scale-95"
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                )}
            </button>

            {/* Backdrop Layer */}
            {isOpen && (
                <div onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[51] animate-fade-in" />
            )}

            <aside className={`fixed left-0 top-0 h-full w-64 bg-slate-900 text-slate-300 flex flex-col z-[52] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Section */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between relative">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                                <line x1="16" y1="8" x2="2" y2="22" />
                                <line x1="17.5" y1="15" x2="9" y2="15" />
                            </svg>
                        </div>
                        <span className="font-serif font-black text-xl tracking-tight text-white">PoetVerse</span>
                    </div>

                    {/* Notification Bell */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative text-slate-400 hover:text-white transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-accent text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute left-64 top-4 w-80 bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden z-[100] animate-fade-in shadow-black/80">
                            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                                <h4 className="font-bold text-sm text-white">Reflections & Sparks</h4>
                                <div className="flex items-center gap-4">
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-[10px] text-accent font-bold uppercase tracking-widest hover:text-white">Clear All</button>
                                    )}
                                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white transition-colors" title="Close notifications">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif._id} 
                                            onClick={() => setShowNotifications(false)}
                                            className={`p-4 border-b border-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer ${!notif.isRead ? 'border-l-2 border-l-accent' : ''}`}
                                        >
                                            <p className="text-xs text-slate-300 leading-snug">
                                                <span className="font-bold text-white">{notif.senderName}</span>
                                                {notif.type === 'like' && ` appreciated your poem "${notif.poemTitle}" ❤️`}
                                                {notif.type === 'comment' && ` left a reflection on "${notif.poemTitle}" 💬`}
                                                {notif.type === 'subscribe' && ` started following your poetic journey ⭐`}
                                                {notif.type === 'contact' && ` sent a new inquiry: "${notif.poemTitle}" ✉️`}
                                            </p>
                                            <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 block">
                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <p className="text-xs text-slate-500 italic">No new sparks yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        item.path === '#logout' ? (
                            <button
                                key={item.path}
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium hover:bg-red-600/10 hover:text-red-500"
                            >
                                <div className="flex-shrink-0 text-slate-400 group-hover:text-white transition-colors">
                                    {item.icon}
                                </div>
                                {item.name}
                            </button>
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/admin'}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${isActive
                                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                            >
                                <div className="flex-shrink-0 text-slate-400 group-hover:text-white transition-colors">
                                    {item.icon}
                                </div>
                                {item.name}
                            </NavLink>
                        )
                    ))}
                </nav>

                {/* User Profile / Logout */}
                <div className="p-6 mt-auto border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-accent uppercase">
                            {(user?.username?.substring(0, 2)) || 'AD'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white leading-tight truncate">
                                {user?.username || 'Admin User'}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Administrator'}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
