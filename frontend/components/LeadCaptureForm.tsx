'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { submitLead } from '@/lib/api';
import { leadFormSchema, type LeadFormSchema } from '@/lib/validation';
import type { Lead, LeadScore } from '@/types/lead';

const scoreStyles: Record<LeadScore, string> = {
  Hot: 'border-[#ff003c] bg-[#ff003c]/10 text-[#ff003c] shadow-[0_0_10px_rgba(255,0,60,0.2)]',
  Warm: 'border-[#ffb700] bg-[#ffb700]/10 text-[#ffb700] shadow-[0_0_10px_rgba(255,183,0,0.2)]',
  Cold: 'border-[#00f3ff] bg-[#00f3ff]/10 text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.2)]',
};

function fieldClasses(hasError: boolean) {
  return [
    'mt-2 w-full rounded-md border bg-black/50 px-3 py-3 text-sm text-white shadow-sm transition-all duration-300 font-mono backdrop-blur-sm',
    'placeholder:text-gray-600 focus:outline-none focus:ring-1',
    hasError 
      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
      : 'border-[#00f3ff]/30 focus:border-[#00f3ff] focus:ring-[#00f3ff]/20 focus:shadow-[0_0_15px_rgba(0,243,255,0.15)] focus:bg-[#00f3ff]/5',
  ].join(' ');
}

export default function LeadCaptureForm() {
  const [qualifiedLead, setQualifiedLead] = useState<Lead | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormSchema>({
    resolver: zodResolver(leadFormSchema),
    mode: 'onBlur',
  });

  async function onSubmit(values: LeadFormSchema) {
    setQualifiedLead(null);

    try {
      const result = await submitLead(values);
      if (result.data) {
        setQualifiedLead(result.data);
      }
      toast.success(result.message || 'Transmission intercepted and analyzed.', {
        style: { background: '#0a0f14', color: '#00f3ff', border: '1px solid #00f3ff' }
      });
      reset();
    } catch (err: unknown) {
      const error = err as Error & { fieldErrors?: Record<string, string> };

      if (error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field in leadFormSchema.shape) {
            setError(field as keyof LeadFormSchema, { message });
          }
        }
      }

      toast.error(error.message || 'Signal lost. Could not submit lead.', {
        style: { background: '#1a0505', color: '#ff003c', border: '1px solid #ff003c' }
      });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      
      {/* Left Column: Data Input */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-xl border border-slate-800 bg-[#050505]/40 p-5 shadow-sm sm:p-6 backdrop-blur-sm relative overflow-hidden"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
              Target Identity
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              className={fieldClasses(!!errors.fullName)}
              placeholder="e.g. Sarah Connor"
              {...register('fullName')}
            />
            {errors.fullName && <p className="mt-1.5 text-xs font-mono text-red-400">{errors.fullName.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
              Comms Link (Email)
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={fieldClasses(!!errors.email)}
              placeholder="sarah@cyberdyne.com"
              {...register('email')}
            />
            {errors.email && <p className="mt-1.5 text-xs font-mono text-red-400">{errors.email.message}</p>}
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="businessName" className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
            Corporate Entity
          </label>
          <input
            id="businessName"
            type="text"
            autoComplete="organization"
            className={fieldClasses(!!errors.businessName)}
            placeholder="Cyberdyne Systems"
            {...register('businessName')}
          />
          {errors.businessName && <p className="mt-1.5 text-xs font-mono text-red-400">{errors.businessName.message}</p>}
        </div>

        <div className="mt-5">
          <label htmlFor="message" className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
            Intercepted Transmission
          </label>
          <textarea
            id="message"
            rows={5}
            className={`${fieldClasses(!!errors.message)} resize-y`}
            placeholder="We need to automate our defense grid immediately..."
            {...register('message')}
          />
          {errors.message && <p className="mt-1.5 text-xs font-mono text-red-400">{errors.message.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-md border border-[#00f3ff] bg-[#00f3ff]/10 px-4 py-4 text-sm font-mono font-semibold uppercase tracking-widest text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all hover:bg-[#00f3ff]/20 hover:shadow-[0_0_25px_rgba(0,243,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-[#00f3ff] border-t-transparent animate-spin"></div>
              Processing Neural Weights...
            </>
          ) : (
            'Execute Analysis'
          )}
        </button>
      </form>

      {}
      <aside className="rounded-xl border border-[#bc13fe]/30 bg-[#0a0f14]/80 p-5 shadow-[0_0_30px_rgba(188,19,254,0.05)] backdrop-blur-md relative flex flex-col">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
           <div className="w-2 h-2 bg-[#bc13fe] rounded-full animate-pulse shadow-[0_0_8px_#bc13fe]"></div>
           <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#bc13fe]">AI Telemetry</p>
        </div>
        
        {qualifiedLead ? (
          <div className="space-y-6 flex-1">
            
            <div>
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500 mb-2">Intent Score</h2>
              <div className={`inline-flex rounded-full border px-4 py-1 text-xs font-mono uppercase tracking-widest ${scoreStyles[qualifiedLead.ai_score]}`}>
                {qualifiedLead.ai_score}
              </div>
            </div>
            
            <div>
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500 mb-2">Agent Reasoning</h2>
              <p className="text-sm leading-relaxed text-gray-300 font-mono border-l-2 border-[#bc13fe]/50 pl-3 italic opacity-90">
                {qualifiedLead.ai_score_reason}
              </p>
            </div>
            
            <div className="flex-1 flex flex-col">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500 mb-2">Generated Draft</h2>
              <div className="relative flex-1 min-h-[150px]">
                <div className="absolute inset-0 bg-[#050505] rounded-md border border-slate-800"></div>
                <pre className="relative z-10 whitespace-pre-wrap p-4 text-xs leading-relaxed text-[#00f3ff] font-mono overflow-y-auto h-full max-h-[250px]">
                  {qualifiedLead.ai_email_draft}
                </pre>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-800">
               <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest flex justify-between">
                  <span>Model:</span> 
                  <span className="text-slate-400">{qualifiedLead.ai_model}</span>
               </p>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-12">
            <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-2">System Standby</p>
            <p className="text-xs text-slate-600 leading-relaxed font-mono max-w-[200px]">
              Inject lead data to initialize agent response protocol.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}