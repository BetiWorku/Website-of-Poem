import React, { useState, useEffect } from 'react';
import API from '../api';

const ManagePoems = () => {
    const [poems, setPoems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPoems();
    }, []);

    const fetchPoems = async () => {
        try {
            const { data } = await API.get('/poems');
            setPoems(data);
        } catch (error) {
            console.error("Error fetching poems:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this poem permanently?")) return;

        try {
            await API.delete(`/poems/${id}`);
            setMessage('✅ Poem deleted successfully.');
            fetchPoems();
        } catch (error) {
            setMessage('❌ Error deleting poem.');
            console.error("Delete error:", error);
        }
    };

    return (
        <div className="space-y-10 animate-fadeIn">
            <header>
                <h1 className="font-serif text-4xl font-black text-ink dark:text-white tracking-tight mb-2">Manage Publications</h1>
                <p className="font-sans text-muted">Control your archives. Edit, update, or remove works from the platform.</p>
            </header>

            {message && (
                <div className={`p-4 rounded-xl font-bold flex items-center justify-between ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    <span>{message}</span>
                    <button onClick={() => setMessage('')} className="opacity-50 hover:opacity-100">&times;</button>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-border overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-20 flex justify-center items-center">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-border text-muted font-black text-xs uppercase tracking-widest font-sans">
                                    <th className="px-8 py-5">Work Info</th>
                                    <th className="px-8 py-5">Category</th>
                                    <th className="px-8 py-5">Access</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {poems.map((poem) => (
                                    <tr key={poem._id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-ink dark:text-white mb-1 group-hover:text-accent transition-colors">{poem.title}</span>
                                                <span className="text-xs text-muted">By {poem.authorName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-parchment dark:bg-slate-700 text-muted rounded-lg text-xs font-bold uppercase tracking-tighter">
                                                {poem.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-xs font-bold ${poem.isFree ? 'text-emerald-600' : 'text-accent'}`}>
                                                {poem.isFree ? 'PUBLIC/FREE' : `$${poem.price}`}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right space-x-2">
                                            <button
                                                onClick={() => window.location.href = `/admin/edit-poem/${poem._id}`}
                                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-ink dark:text-white rounded-xl text-xs font-bold hover:bg-accent hover:text-white transition-all">
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(poem._id)}
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagePoems;
