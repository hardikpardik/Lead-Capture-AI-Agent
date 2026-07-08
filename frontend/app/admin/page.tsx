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
  Hot: 'bg-red-100 text-red-700 ring-red-200',
  Warm: 'bg-amber-100 text-amber-700 ring-amber-200',
  Cold: 'bg-slate-100 text-slate-700 ring-slate-200',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      setIsLoading(true);
      setError('');

      try {
        const [leadData, statsData] = await Promise.all([fetchLeads(), fetchLeadStats()]);
        if (isMounted) {
          setLeads(leadData);
          setStats(statsData);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not load admin data.';
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const scoreBars = useMemo(
    () => [
      { label: 'Hot', value: stats.hot, className: 'bg-red-500' },
      { label: 'Warm', value: stats.warm, className: 'bg-amber-500' },
      { label: 'Cold', value: stats.cold, className: 'bg-slate-500' },
    ],
    [stats]
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Admin panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Qualified leads</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Review captured leads, AI qualification, drafted replies, and duplicate-safe intake metrics.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-700 hover:text-teal-800"
          >
            Capture form
          </Link>
        </header>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total leads</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Last 7 days</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.last_7_days}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
            <p className="text-sm text-slate-500">Score distribution</p>
            <div className="mt-4 space-y-3">
              {scoreBars.map((bar) => {
                const width = stats.total > 0 ? `${Math.max((bar.value / stats.total) * 100, bar.value ? 8 : 0)}%` : '0%';
                return (
                  <div key={bar.label} className="grid grid-cols-[52px_1fr_32px] items-center gap-3 text-sm">
                    <span className="font-medium text-slate-700">{bar.label}</span>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${bar.className}`} style={{ width }} />
                    </div>
                    <span className="text-right text-slate-500">{bar.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-950">Recent submissions</h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-sm text-slate-500">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No leads captured yet.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {leads.map((lead) => (
                <article key={lead.id} className="grid gap-5 p-4 lg:grid-cols-[280px_1fr_1fr]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${scoreStyles[lead.ai_score]}`}>
                        {lead.ai_score}
                      </span>
                      <span className="text-xs text-slate-500">{lead.qualification_status}</span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-slate-950">{lead.full_name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lead.email}</p>
                    <p className="mt-1 text-sm text-slate-500">{lead.business_name || 'No business name'}</p>
                    <p className="mt-3 text-xs text-slate-400">{formatDate(lead.created_at)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI reason</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{lead.ai_score_reason}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Message</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{lead.message}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Generated email draft</p>
                    <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                      {lead.ai_email_draft}
                    </pre>
                    <p className="mt-3 text-xs text-slate-400">Model: {lead.ai_model}</p>
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
