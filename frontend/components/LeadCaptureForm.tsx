'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { submitLead } from '@/lib/api';
import { leadFormSchema, type LeadFormSchema } from '@/lib/validation';
import type { Lead, LeadScore } from '@/types/lead';

const scoreStyles: Record<LeadScore, string> = {
  Hot: 'border-red-200 bg-red-50 text-red-700',
  Warm: 'border-amber-200 bg-amber-50 text-amber-700',
  Cold: 'border-slate-200 bg-slate-50 text-slate-700',
};

function fieldClasses(hasError: boolean) {
  return [
    'mt-2 w-full rounded-md border bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm transition',
    'placeholder:text-slate-400 focus:outline-none focus:ring-2',
    hasError ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-100',
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
      toast.success(result.message || 'Lead captured and qualified.');
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

      toast.error(error.message || 'Could not submit the lead.');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="text-sm font-medium text-slate-800">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              className={fieldClasses(!!errors.fullName)}
              placeholder="Aarav Sharma"
              {...register('fullName')}
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-800">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={fieldClasses(!!errors.email)}
              placeholder="aarav@company.com"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="businessName" className="text-sm font-medium text-slate-800">
            Business name
          </label>
          <input
            id="businessName"
            type="text"
            autoComplete="organization"
            className={fieldClasses(!!errors.businessName)}
            placeholder="Northstar Retail"
            {...register('businessName')}
          />
          {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>}
        </div>

        <div className="mt-4">
          <label htmlFor="message" className="text-sm font-medium text-slate-800">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            className={`${fieldClasses(!!errors.message)} resize-y`}
            placeholder="Tell us what you want to automate, improve, or build."
            {...register('message')}
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Capturing and qualifying...' : 'Capture lead'}
        </button>
      </form>

      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI qualification preview</p>
        {qualifiedLead ? (
          <div className="mt-4 space-y-4">
            <div className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${scoreStyles[qualifiedLead.ai_score]}`}>
              {qualifiedLead.ai_score}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Reason</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{qualifiedLead.ai_score_reason}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Generated first response</h2>
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                {qualifiedLead.ai_email_draft}
              </pre>
            </div>
            <p className="text-xs text-slate-500">Model: {qualifiedLead.ai_model}</p>
          </div>
        ) : (
          <div className="mt-8 rounded-md border border-dashed border-slate-200 p-4 text-sm leading-6 text-slate-500">
            Submit a lead to see the saved AI score, one-line reason, and drafted reply returned by the API.
          </div>
        )}
      </aside>
    </div>
  );
}
