import Link from 'next/link';

import LeadCaptureForm from '@/components/LeadCaptureForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Oplify Solutions</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Lead Capture AI Agent
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Capture inbound leads, qualify them with AI, and prepare a first response for the sales team.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-700 hover:text-teal-800"
          >
            Admin panel
          </Link>
        </header>

        <LeadCaptureForm />
      </div>
    </main>
  );
}
