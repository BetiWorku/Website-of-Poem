import React, { useState } from 'react';
import API from '../api';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Contact submission error:", err);
      alert("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen animate-fade-in-up">
      {/* Header */}
      <div className="text-center px-6 pt-24 pb-10">
        <h1 className="font-serif text-5xl font-black text-ink tracking-tight mb-3">
          Get in Touch
        </h1>
        <p className="font-sans text-sm text-accent">
          Have a question, suggestion, or poem to share? We'd love to hear from you.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* ── Left: Form card ── */}
        <div className="bg-card rounded-2xl border border-black/[0.07] dark:border-white/[0.07] shadow-sm p-10">
          <h2 className="font-serif text-2xl font-bold text-ink mb-7">Send a Message</h2>

          {submitted && (
            <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-sans text-center">
              ✓ Message sent! We'll be in touch soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-sans text-sm font-medium text-ink mb-1.5">
                Name<span className="text-accent ml-0.5">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-cream border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-accent transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block font-sans text-sm font-medium text-ink mb-1.5">
                Email<span className="text-accent ml-0.5">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-cream border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-accent transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block font-sans text-sm font-medium text-ink mb-1.5">
                Message<span className="text-accent ml-0.5">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-cream border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-accent transition-colors duration-200 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-ink text-cream font-sans font-semibold text-sm px-8 py-3 rounded-xl hover:bg-accent transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* ── Right: Info cards ── */}
        <div className="flex flex-col gap-4">

          {/* Email */}
          <div className="bg-card rounded-2xl border border-black/[0.07] dark:border-white/[0.07] shadow-sm px-7 py-5 flex items-start gap-4">
            <div className="text-accent mt-0.5 shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="2,4 12,13 22,4" />
              </svg>
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-ink">Email</p>
              <p className="font-sans text-sm text-accent tracking-tighter">bwwmas@gmail.com</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-card rounded-2xl border border-black/[0.07] dark:border-white/[0.07] shadow-sm px-7 py-5 flex items-start gap-4">
            <div className="text-accent mt-0.5 shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-ink">Location</p>
              <p className="font-sans text-sm text-accent">Addis Ababa, Ethiopia</p>
            </div>
          </div>

          {/* Follow Us */}
          <div className="bg-card rounded-2xl border border-black/[0.07] dark:border-white/[0.07] shadow-sm px-7 py-5">
            <p className="font-sans text-sm font-bold text-ink mb-4">Follow Us</p>
            <div className="flex gap-4">
              {/* Instagram */}
              <button type="button" aria-label="Instagram" className="text-ink hover:text-accent transition-colors duration-200 hover:-translate-y-0.5 transform bg-transparent border-none cursor-pointer p-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </button>
              {/* Twitter */}
              <button type="button" aria-label="Twitter" className="text-ink hover:text-accent transition-colors duration-200 hover:-translate-y-0.5 transform bg-transparent border-none cursor-pointer p-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 7v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </button>
              {/* Email */}
              <a href="mailto:bwwmas@gmail.com" aria-label="Email" className="text-ink hover:text-accent transition-colors duration-200 hover:-translate-y-0.5 transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <polyline points="2,4 12,13 22,4" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;
