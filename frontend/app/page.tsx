'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { fetchLeads, fetchLeadStats } from '@/lib/api';
import type { Lead, LeadScore, LeadStats } from '@/types/lead';

const emptyStats: LeadStats = {
  total: 0,
  hot: 0,
  warm: 0,
  cold: 0,
  fallback: 0,
  last_7_days: 0,
};

const scoreStyles: Record<LeadScore, string> = {
  Hot: 'border-[#ff003c] bg-[#ff003c]/10 text-[#ff003c] shadow-[0_0_10px_rgba(255,0,60,0.2)]',
  Warm: 'border-[#ffb700] bg-[#ffb700]/10 text-[#ffb700] shadow-[0_0_10px_rgba(255,183,0,0.2)]',
  Cold: 'border-[#00f3ff] bg-[#00f3ff]/10 text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.2)]',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

// Dedicated copy button component to manage the "Copied!" state
function CopyDraftButton({ draftText }: { draftText: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs font-mono uppercase tracking-widest text-[#00f3ff] transition-colors hover:text-white"
    >
      {copied ? (
        <span className="text-[#00ff9d]">✓ Copied!</span>
      ) : (
        '[ Copy Draft ]'
      )}
    </button>
  );
}

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>(emptyStats);
  const [adminToken, setAdminToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      setIsLoading(true);
      setError('');

      try {
        const [leadData, statsData] = await Promise.all([fetchLeads(adminToken), fetchLeadStats(adminToken)]);
        if (isMounted) {
          setLeads(leadData);
          setStats(statsData);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not load admin data.';
        if (isMounted) {
          // If the backend rejects the token, show a clear terminal-style error
          if (message.toLowerCase().includes('unauthorized') || message.includes('401') || message.includes('403')) {
             setError('ACCESS DENIED: Valid system override token required.');
          } else {
             setError(message);
          }
          // Clear data so it doesn't show old stuff
          setLeads([]);
          setStats(emptyStats);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    // Debounce the fetch slightly so it doesn't spam the API on every keystroke
    const timer = setTimeout(() => {
      loadAdminData();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [adminToken]);

  const scoreBars = useMemo(
    () => [
      { label: 'HOT', value: stats.hot, className: 'bg-[#ff003c] shadow-[0_0_10px_#ff003c]' },
      { label: 'WARM', value: stats.warm, className: 'bg-[#ffb700] shadow-[0_0_10px_#ffb700]' },
      { label: 'COLD', value: stats.cold, className: 'bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]' },
    ],
    [stats]
  );

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 relative overflow-hidden">
      {/* 3D Cyber Grid Background */}
      <div className="cyber-grid opacity-30" />
      <div className="fixed inset-0 bg-gradient-to-t from-[#050505] to-transparent z-0 pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#bc13fe]">Admin Panel // Secure</p>
            <h1 className="mt-2 text-3xl font-bold font-mono text-white tracking-tight">Database Grid</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 font-mono">
              Review captured leads, AI qualification, drafted replies, and duplicate-safe intake metrics.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#bc13fe]/30 bg-black/50 px-6 text-sm font-semibold text-[#bc13fe] shadow-[0_0_15px_rgba(188,19,254,0.1)] transition-all hover:bg-[#bc13fe]/10 hover:border-[#bc13fe] hover:shadow-[0_0_20px_rgba(188,19,254,0.3)] font-mono tracking-wide backdrop-blur-md"
          >
            Return to Command Center
          </Link>
        </header>

        <section className="relative z-10 backdrop-blur-xl bg-[#0a0f14]/80 border border-slate-800 rounded-xl shadow-lg p-5">
          <label htmlFor="adminToken" className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
             <div className="w-2 h-2 bg-[#ff003c] rounded-full animate-pulse shadow-[0_0_8px_#ff003c]"></div>
             Decryption Key (Admin Token)
          </label>
          <input
            id="adminToken"
            type="password"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            placeholder="Enter secure token to decrypt database..."
            className="w-full md:w-1/2 rounded-md border border-slate-700 bg-[#050505] px-4 py-3 text-sm text-white font-mono shadow-sm outline-none transition placeholder:text-slate-600 focus:border-[#ff003c] focus:ring-1 focus:ring-[#ff003c]/50 focus:shadow-[0_0_15px_rgba(255,0,60,0.15)]"
          />
        </section>

        {error && (
          <div className="rounded-md border border-[#ff003c] bg-[#ff003c]/10 px-4 py-3 text-sm font-mono text-[#ff003c] flex items-center gap-3 shadow-[0_0_15px_rgba(255,0,60,0.1)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            {error}
          </div>
        )}

        {/* STATS ROW */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-[#0a0f14]/80 p-5 shadow-lg backdrop-blur-md">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Total leads</p>
            <p className="mt-2 text-3xl font-mono font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0a0f14]/80 p-5 shadow-lg backdrop-blur-md">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Last 7 days</p>
            <p className="mt-2 text-3xl font-mono font-bold text-white">{stats.last_7_days}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0a0f14]/80 p-5 shadow-lg backdrop-blur-md md:col-span-2">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Score distribution</p>
            <div className="mt-4 space-y-3 font-mono">
              {scoreBars.map((bar) => {
                const width = stats.total > 0 ? `${Math.max((bar.value / stats.total) * 100, bar.value ? 5 : 0)}%` : '0%';
                return (
                  <div key={bar.label} className="grid grid-cols-[52px_1fr_32px] items-center gap-3 text-sm">
                    <span className="font-semibold text-slate-400">{bar.label}</span>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${bar.className}`} style={{ width }} />
                    </div>
                    <span className="text-right text-slate-400">{bar.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* LEADS LIST */}
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0a0f14]/80 shadow-lg backdrop-blur-md">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-white">Recent Data Streams</h2>
          </div>

          {isLoading ? (
            <div className="p-8 flex flex-col items-center justify-center text-center">
               <div className="w-8 h-8 rounded-full border-2 border-[#00f3ff] border-t-transparent animate-spin mb-4"></div>
               <p className="text-xs font-mono uppercase tracking-widest text-[#00f3ff]">Decrypting Database...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-sm font-mono text-slate-500 text-center">No inbound data streams detected.</div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {leads.map((lead) => (
                <article key={lead.id} className="grid gap-6 p-5 lg:grid-cols-[280px_1fr_1fr] transition-colors hover:bg-slate-800/20">
                  
                  {/* Column 1: Identity */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${scoreStyles[lead.ai_score]}`}>
                        {lead.ai_score}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{lead.qualification_status}</span>
                    </div>
                    <h3 className="text-sm font-mono font-bold text-white">{lead.full_name}</h3>
                    <p className="mt-1 text-xs font-mono text-[#00f3ff]/80">{lead.email}</p>
                    <p className="mt-1 text-xs font-mono text-slate-500">{lead.business_name || 'UNDEFINED ENTITY'}</p>
                    <p className="mt-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">{formatDate(lead.created_at)}</p>
                  </div>

                  {/* Column 2: Reasoning */}
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-2">Agent Reason</p>
                    <p className="text-xs leading-relaxed text-slate-300 font-mono border-l-2 border-slate-700 pl-3 italic">
                      {lead.ai_score_reason}
                    </p>
                    
                    <p className="mt-5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-2">Original Payload</p>
                    <p className="text-xs leading-relaxed text-slate-400 font-mono bg-black/40 p-2 rounded border border-slate-800">
                      {lead.message}
                    </p>
                  </div>

                  {/* Column 3: Draft Output */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Response Draft</p>
                       <CopyDraftButton draftText={lead.ai_email_draft} />
                    </div>
                    
                    <div className="relative flex-1 min-h-[120px]">
                      <div className="absolute inset-0 bg-[#050505] rounded border border-slate-800"></div>
                      <pre className="relative z-10 whitespace-pre-wrap p-3 text-xs leading-relaxed text-[#00f3ff] font-mono overflow-y-auto h-full max-h-[200px]">
                        {lead.ai_email_draft}
                      </pre>
                    </div>
                    
                    <div className="mt-3 text-right">
                       <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                         Model // <span className="text-slate-400">{lead.ai_model}</span>
                       </p>
                    </div>
                  </div>

                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}