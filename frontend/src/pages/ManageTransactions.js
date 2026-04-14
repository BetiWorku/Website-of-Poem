import React, { useState, useEffect } from 'react';
import API from '../api';

const ManageTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { data } = await API.get('/transactions');
                setTransactions(data);
            } catch (err) {
                console.error("Fetch transactions error:", err);
                setError('Failed to load transaction history.');
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    return (
        <div className="p-8 space-y-12 bg-cream min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="font-serif text-4xl font-black text-ink tracking-tight mb-2">Financial Records</h1>
                    <p className="font-sans text-muted">A complete history of all poem purchases and reader support.</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-2xl border border-border shadow-sm">
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-black text-emerald-600">${totalRevenue.toFixed(2)}</h3>
                </div>
            </header>

            <div className="bg-card rounded-2xl shadow-xl border border-border p-8 relative overflow-hidden">
                {error ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center font-bold">
                        {error}
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border text-muted uppercase text-xs tracking-tighter font-bold">
                                    <th className="pb-4 pt-0 pl-4 w-12">#</th>
                                    <th className="pb-4 pt-0">Reader (User)</th>
                                    <th className="pb-4 pt-0">Poem Title</th>
                                    <th className="pb-4 pt-0">Method</th>
                                    <th className="pb-4 pt-0">Amount</th>
                                    <th className="pb-4 pt-0 text-right pr-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {transactions.map((t, idx) => (
                                    <tr key={t._id} className="group hover:bg-parchment/30 transition-colors">
                                        <td className="py-5 pl-4 text-muted font-mono text-sm">{idx + 1}</td>
                                        <td className="py-5 font-bold text-ink transition-colors group-hover:text-accent">
                                            <div className="flex flex-col">
                                                <span>{t.userId?.username || t.guestName || 'Anonymous Reader'}</span>
                                                <span className="text-[10px] text-muted font-bold tracking-tight">
                                                    {t.userId?.email || t.guestEmail || 'No contact provided'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 text-ink font-medium">
                                            {t.poemId?.title || 'Deleted Poem'}
                                        </td>
                                        <td className="py-5">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                                t.paymentMethod === 'stripe' || t.paymentMethod === 'Stripe' ? 'bg-indigo-100 text-indigo-600' : 
                                                t.paymentMethod === 'PayPal' ? 'bg-blue-100 text-blue-600' :
                                                t.paymentMethod === 'Chapa' ? 'bg-emerald-100 text-emerald-600' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {t.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="py-5 font-black text-emerald-600">
                                            +${t.amount?.toFixed(2)}
                                        </td>
                                        <td className="py-5 text-right pr-4 text-xs text-muted font-bold">
                                            {new Date(t.createdAt).toLocaleDateString()} <br/>
                                            <span className="opacity-50 font-normal">{new Date(t.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {transactions.length === 0 && (
                            <div className="p-12 text-center text-muted italic">
                                No transactions recorded yet.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageTransactions;
