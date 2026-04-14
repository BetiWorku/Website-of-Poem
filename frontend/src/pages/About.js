import React from 'react';

const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'A Doctor\'s Perspective',
    desc: 'Experience profound verses and unique storytelling written from the deeply empathetic lens of an experienced medical doctor.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Multisensory Poetry',
    desc: 'Poetry comes alive. Engage with the verses through pure text, listen to soulful audio recitations, or watch immersive video performances.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Exclusive Manuscripts',
    desc: 'Take the poetry with you. Download full PDF manuscripts, exclusive collections, and beautifully formatted anthologies.',
  },
];

function About() {
  return (
    <div className="animate-fade-in-up">
      {/* ── Hero ── */}
      <section className="bg-cream text-center px-6 pt-24 pb-12">
        <h1 className="font-serif text-5xl font-black text-ink tracking-tight mb-6">
          About the Poet
        </h1>
        <p className="font-sans text-muted text-lg leading-relaxed max-w-2xl mx-auto">
          Welcome to my personal digital sanctuary. By profession, I am an experienced doctor dedicated to healing; by passion, I am a poet translating the profound depth of human experience into verse.
        </p>
      </section>

      {/* ── Feature Cards ── */}
      <section className="bg-cream px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-card border border-black/[0.07] dark:border-white/[0.07] rounded-2xl px-8 py-10 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="text-accent flex justify-center mb-5">{f.icon}</div>
              <h3 className="font-serif text-xl font-bold text-ink mb-3">{f.title}</h3>
              <p className="font-sans text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="bg-parchment px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl font-black text-ink text-center mb-10">
            The Author's Journey
          </h2>
          <div className="font-sans text-base text-muted leading-loose space-y-5">
            <p>
              In a world overflowing with fleeting content, poetry remains a timeless anchor for the soul.{' '}
              <span className="text-accent">
                As a doctor with years of experience, I encounter the rawest moments of human life on a daily basis—moments of profound grief, incredible resilience, and beautiful vulnerability.
              </span>
            </p>
            <p>
              This platform was created as a dedicated home for the art that flows from those experiences. Here, poetry is not just words flat on a page. It is a living, breathing expression.{' '}
              <span className="text-accent">
                I personally curate and upload my poems, often pairing them with audio recordings or intimate video readings, allowing you to hear the rhythm and emotion exactly as I felt it.
              </span>
            </p>
            <p>
              Whether you are here to read a quick stanza, watch a spoken-word performance, or support my craft by{' '}
              <span className="text-accent">
                downloading a compiled PDF of my works
              </span>
              , I invite you to explore this space. Thank you for walking this poetic journey with me.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
