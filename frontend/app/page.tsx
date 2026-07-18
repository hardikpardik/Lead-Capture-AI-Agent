"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [loadStage, setLoadStage] = useState(1);
  const [renderMain, setRenderMain] = useState(false);

  useEffect(() => {
    // Sequence the loading text
    const t1 = setTimeout(() => setLoadStage(2), 800);
    const t2 = setTimeout(() => setLoadStage(3), 1600);
    
    // Fade out splash screen
    const t3 = setTimeout(() => setShowSplash(false), 2500);
    
    // Completely unmount splash screen from DOM after fade finishes
    const t4 = setTimeout(() => setRenderMain(true), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <>
      {/* Cinematic Splash Screen */}
      {!renderMain && (
        <div 
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] transition-opacity duration-1000 ${
            showSplash ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="loader-ring mb-8"></div>
          <h1 className="text-4xl font-bold text-white tracking-widest glitch-text font-mono uppercase">Oplify.AI</h1>
          <p className="mt-4 text-[#00f3ff] font-mono text-sm opacity-80 tracking-widest uppercase">Initializing Neural Networks...</p>
          
          <div className="mt-8 text-xs text-gray-500 font-mono flex flex-col items-center gap-1">
            <span>Loading secure environment... [OK]</span>
            <span className={`transition-opacity duration-300 ${loadStage >= 2 ? 'opacity-100' : 'opacity-0'}`}>Establishing database connection... [OK]</span>
            <span className={`transition-opacity duration-300 ${loadStage >= 3 ? 'opacity-100' : 'opacity-0'}`}>Waking Gemini-2.5-Flash agent... [OK]</span>
          </div>
        </div>
      )}

      {/* 3D Cyber Grid Background */}
      <div className="cyber-grid" />
      <div className="fixed inset-0 bg-gradient-to-t from-transparent to-[#050505] z-0 pointer-events-none opacity-80" />

      {/* Main Content */}
      <main 
        className={`relative z-10 min-h-screen transition-opacity duration-1000 ${
          showSplash ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Futuristic Header */}
          <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_8px_#00f3ff]"></div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#00f3ff]">System Online</p>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-mono">
                Command<span className="text-[#00f3ff]">Center</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400 font-mono">
                Internal Agent Network // Secured Connection. Capture inbound data streams and initialize automated response protocols.
              </p>
            </div>
            
            <Link
              href="/admin"
              className="inline-flex h-10 items-center justify-center rounded-md border border-[#00f3ff]/30 bg-black/50 px-6 text-sm font-semibold text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all hover:bg-[#00f3ff]/10 hover:border-[#00f3ff] hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] font-mono tracking-wide backdrop-blur-md"
            >
              Access Admin Grid
            </Link>
          </header>

          {/* Form Container */}
          <div className="relative z-10 backdrop-blur-xl bg-[#0a0f14]/60 border border-[#00f3ff]/20 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-2 sm:p-4">
             {/* Decorative Corner Accents */}
             <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00f3ff] opacity-50 rounded-tl-xl pointer-events-none"></div>
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00f3ff] opacity-50 rounded-br-xl pointer-events-none"></div>
             
             <LeadCaptureForm />
          </div>

        </div>
      </main>
    </>
  );
}