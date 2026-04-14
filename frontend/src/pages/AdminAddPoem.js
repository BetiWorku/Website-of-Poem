import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate, useParams } from 'react-router-dom';

const AdminAddPoem = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        authorNote: '',
        category: '',
        price: 0,
        isFree: false
    });
    const [videoFile, setVideoFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            const fetchPoem = async () => {
                try {
                    const { data } = await API.get(`/poems/${id}`);
                    setFormData({
                        title: data.title || '',
                        content: data.content || '',
                        authorNote: data.authorNote || '',
                        category: data.category || '',
                        price: data.price || 0,
                        isFree: data.isFree || false
                    });
                } catch (error) {
                    setMessage('❌ Error loading poem details.');
                }
            };
            fetchPoem();
        }
    }, [id]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        setPdfFile(file);
        
        // Auto-fill title if empty
        if (file && !formData.title) {
            const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
            setFormData(prev => ({ ...prev, title: cleanTitle }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const data = new FormData();
        const finalData = { 
            ...formData, 
            category: formData.category || 'Manuscript',
            content: formData.content || "Full-length illustrated manuscript. Open the book to explore the complete collection."
        };
        Object.keys(finalData).forEach(key => data.append(key, finalData[key]));
        if (videoFile) data.append('video', videoFile);
        if (audioFile) data.append('audio', audioFile);
        if (pdfFile) data.append('pdf', pdfFile);
        if (imageFile) data.append('image', imageFile);

        try {
            if (id) {
                await API.put(`/poems/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setMessage('✅ Poem successfully updated! Redirecting...');
            } else {
                await API.post('/poems', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setMessage('✅ Poem successfully uploaded and published! Redirecting...');
            }

            setFormData({ title: '', content: '', authorNote: '', category: '', price: 0, isFree: false });
            setVideoFile(null);
            setAudioFile(null);
            setPdfFile(null);
            setImageFile(null);

            // Redirect to home or manage
            setTimeout(() => {
                navigate(id ? '/admin/manage' : '/');
            }, 2000);
        } catch (error) {
            setMessage(`❌ Error: ${error.response?.data?.message || 'Upload failed'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <header>
                <h1 className="font-serif text-4xl font-black text-ink tracking-tight mb-2">
                    {id ? 'Edit Masterpiece' : 'Compose Masterpiece'}
                </h1>
                <p className="font-sans text-muted">Let your soul speak through the ink. Every word is a step towards eternity.</p>
            </header>

            <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-border shadow-2xl relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-700"></div>

                <h2 className="font-serif text-2xl font-black text-ink dark:text-white mb-8 relative z-10 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-accent rounded-full"></span>
                    Work Details
                </h2>

                {message && (
                    <div className={`mb-10 p-5 rounded-2xl flex items-center gap-3 animate-slideDown ${message.includes('Error')
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-100 dark:border-red-500/20'
                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20'
                        }`}>
                        <span className="text-xl">{message.includes('Error') ? '⚠️' : '✨'}</span>
                        <p className="text-sm font-bold">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="space-y-2">
                        <label className="block font-sans text-sm font-bold text-ink/70 dark:text-slate-300 ml-1">Work Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., The Midnight Whisper..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-6 py-4 font-sans text-ink dark:text-white outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all duration-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-sans text-sm font-bold text-ink/70 dark:text-slate-300 ml-1">Full Content</label>
                        <textarea
                            rows="10"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Breathe life into your verses here... (Optional if uploading a secure PDF book)"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-6 py-4 font-sans text-ink dark:text-white outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all duration-300 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-sans text-sm font-bold text-ink/70 dark:text-slate-300 ml-1">Author's Note (Optional, Story behind the verse)</label>
                        <textarea
                            rows="4"
                            name="authorNote"
                            value={formData.authorNote}
                            onChange={handleChange}
                            placeholder="Share the personal story or inspiration behind this poem..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-6 py-4 font-sans text-ink dark:text-white outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all duration-300 resize-none italic"
                        />
                    </div>

                    {/* PDF-Title Auto-suggest script logic */}
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-slate-900/50 rounded-xl border border-amber-200/50">
                        <span className="text-lg">✨</span>
                        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest">
                            Quick Book Upload: You can now skip the "Full Content" box if you are uploading a Secure PDF.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block font-sans text-sm font-bold text-ink/70 dark:text-slate-300 ml-1">Style / Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-6 py-4 font-sans text-ink dark:text-white outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent appearance-none transition-all duration-300"
                            >
                                <option value="">Select Genre (Optional)</option>
                                <option value="Manuscript">📜 Full Manuscript / Book</option>
                                <option value="Love">Love & Romance</option>
                                <option value="Nature">Nature & Solitude</option>
                                <option value="Life">Existential Life</option>
                                <option value="Loss">Loss & Memory</option>
                                <option value="Hope">Hope & Dawn</option>
                                <option value="Freedom">Freedom & Flight</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block font-sans text-sm font-bold text-ink/70 dark:text-slate-300 ml-1">Required PDF Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setFormData({ ...formData, price: val, isFree: val === 0 });
                                }}
                                min="0"
                                step="0.01"
                                placeholder="Enter price (e.g. 10.00)"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-accent/20 rounded-xl px-6 py-4 font-sans text-ink dark:text-white outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all duration-300"
                            />
                            <p className="text-[10px] text-accent font-bold uppercase tracking-widest ml-1">
                                💰 Readers must pay this amount to download the PDF
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Video Upload */}
                        <div className="p-4 bg-accent/5 dark:bg-accent/10 border-2 border-dashed border-accent/20 rounded-2xl transition-all hover:bg-accent/10 hover:border-accent/40 group/video cursor-pointer">
                            <label className="flex flex-col items-center justify-center gap-2 cursor-pointer h-full">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xl shadow-sm transition-transform group-hover/video:-translate-y-1">📽️</div>
                                <p className="font-bold text-ink/80 dark:text-slate-200">Video</p>
                                <input
                                    type="file"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                    accept="video/*"
                                    className="hidden"
                                />
                                {videoFile && <p className="mt-2 text-[8px] font-bold text-accent truncate w-full italic text-center px-1">{videoFile.name}</p>}
                            </label>
                        </div>

                        {/* Audio Upload */}
                        <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 border-2 border-dashed border-blue-500/20 rounded-2xl transition-all hover:bg-blue-500/10 hover:border-blue-500/40 group/audio cursor-pointer">
                            <label className="flex flex-col items-center justify-center gap-2 cursor-pointer h-full">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xl shadow-sm transition-transform group-hover/audio:-translate-y-1">🎙️</div>
                                <p className="font-bold text-ink/80 dark:text-slate-200">Audio</p>
                                <input
                                    type="file"
                                    onChange={(e) => setAudioFile(e.target.files[0])}
                                    accept="audio/*"
                                    className="hidden"
                                />
                                {audioFile && <p className="mt-2 text-[8px] font-bold text-blue-600 truncate w-full italic text-center px-1">{audioFile.name}</p>}
                            </label>
                        </div>

                        {/* PDF Upload */}
                        <div className="p-4 bg-gold-500/5 dark:bg-gold-500/10 border-2 border-dashed border-gold-500/20 rounded-2xl transition-all hover:bg-gold-500/10 hover:border-gold-500/40 group/pdf cursor-pointer">
                            <label className="flex flex-col items-center justify-center gap-2 cursor-pointer h-full">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xl shadow-sm transition-transform group-hover/pdf:-translate-y-1">📄</div>
                                <p className="font-bold text-ink/80 dark:text-slate-200 text-center leading-tight">Secure PDF</p>
                                <input
                                    type="file"
                                    onChange={handlePdfChange}
                                    accept="application/pdf"
                                    className="hidden"
                                />
                                {pdfFile && <p className="mt-2 text-[8px] font-bold text-gold-600 truncate w-full italic text-center px-1">{pdfFile.name}</p>}
                            </label>
                        </div>

                        {/* Cover Image Upload */}
                        <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border-2 border-dashed border-emerald-500/20 rounded-2xl transition-all hover:bg-emerald-500/10 hover:border-emerald-500/40 group/image cursor-pointer">
                            <label className="flex flex-col items-center justify-center gap-2 cursor-pointer h-full">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xl shadow-sm transition-transform group-hover/image:-translate-y-1">🖼️</div>
                                <p className="font-bold text-ink/80 dark:text-slate-200">Cover Art</p>
                                <input
                                    type="file"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {imageFile && <p className="mt-2 text-[8px] font-bold text-emerald-600 truncate w-full italic text-center px-1">{imageFile.name}</p>}
                            </label>
                        </div>
                    </div>

                    {/* Reading is always free policy notification */}
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                        <span className="text-xl">📖</span>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                            READER ACCESS: This work will be available for reading and viewing for FREE to all visitors. The price above only applies to PDF downloads.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-ink dark:bg-accent text-white dark:text-slate-900 font-bold text-lg rounded-2xl shadow-xl hover:shadow-accent/20 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {id ? 'Updating...' : 'Publishing...'}
                            </>
                        ) : (
                            <>
                                <span>{id ? '✨ Save Changes' : '✨ Publish Masterpiece'}</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminAddPoem;
