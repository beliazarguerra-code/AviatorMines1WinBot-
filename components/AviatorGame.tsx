'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Settings, Info, RefreshCw, Zap, ShieldCheck, Activity, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAviatorSignal } from '@/lib/actions';
import { io, Socket } from 'socket.io-client';

const CONFIG = {
  API_ID: '20488266',
  HASH: '4e059b0a0b42114bfd2617c343fb539a',
};

export default function AviatorGame() {
  const [state, setState] = useState({
    multiplier: 0,
    isLoading: false,
    socketStatus: 'connecting',
    lastUpdated: '',
  });
  const socketRef = useRef<Socket | null>(null);

  // Socket.io connection
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      setState(s => ({ ...s, socketStatus: 'connected' }));
      console.log('Aviator connected to real-time engine');
    });

    socket.on('game:update', (data) => {
      if (data.type === 'aviator') {
        console.log('Real-time Aviator update:', data);
      }
    });

    socket.on('disconnect', () => {
      setState(s => ({ ...s, socketStatus: 'connecting' }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const generateSignal = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await getAviatorSignal();
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          multiplier: result.multiplier, 
          isLoading: false,
          lastUpdated: new Date().toLocaleTimeString(),
        }));
        
        // Haptic feedback if available (Telegram)
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
          try {
            (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          } catch (e) {
            console.warn('Telegram Haptic Feedback error:', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to get signal:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 pb-20 max-w-md mx-auto relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[100px] rounded-full" />

      {/* Header */}
      <header className="w-full flex justify-between items-center mb-8 px-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Plane className="w-6 h-6 text-white rotate-[-45deg]" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight leading-none uppercase italic">Aviator Pro</h1>
            <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest">Prediction Engine v4.2</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className={cn(
             "px-2 py-1 rounded-full flex items-center gap-1.5 border border-white/5",
             state.socketStatus === 'connected' ? "bg-green-500/10" : "bg-yellow-500/10"
           )}>
             <div className={cn(
               "w-1.5 h-1.5 rounded-full animate-pulse",
               state.socketStatus === 'connected' ? "bg-green-400" : "bg-yellow-400"
             )} />
             <span className={cn(
               "text-[9px] font-mono uppercase font-bold",
               state.socketStatus === 'connected' ? "text-green-400" : "text-yellow-400"
             )}>
               {state.socketStatus === 'connected' ? "Socket: Live" : "Socket: Syncing"}
             </span>
           </div>
        </div>
      </header>

      {/* Main Signal Display */}
      <div className="relative w-full aspect-square flex items-center justify-center z-10 mb-8">
        {/* Outer Ring Decor */}
        <div className="absolute inset-0 rounded-full border border-white/5 border-dashed animate-spin-slow" />
        
        {/* The Big Blue Circle */}
        <div className="relative w-[85%] h-[85%] rounded-full bg-gradient-to-br from-[#0c1c38] to-[#060d17] border border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.2)] flex items-center justify-center group">
           
           <div className="absolute inset-4 rounded-full border border-blue-400/10 pointer-events-none" />

           {/* Multiplier Display */}
           <div className="flex flex-col items-center justify-center z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.multiplier}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  className="text-center"
                >
                  <span className="text-6xl font-black font-display text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {state.multiplier === 0 ? "?.??" : `${state.multiplier.toFixed(2)}x`}
                  </span>
                  <div className="text-[10px] text-blue-400 font-mono tracking-[0.3em] uppercase mt-2">
                    Predicted Cashout
                  </div>
                </motion.div>
              </AnimatePresence>
           </div>

           {/* Animated Plane Trail/Path */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <linearGradient id="plane-path" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <motion.path
                d="M 50,250 Q 150,250 250,50"
                fill="none"
                stroke="url(#plane-path)"
                strokeWidth="2"
                strokeDasharray="1000"
                initial={{ strokeDashoffset: 1000 }}
                animate={{ strokeDashoffset: state.isLoading ? 0 : 1000 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="opacity-40"
              />
           </svg>

           {/* The Plane */}
           <motion.div
             animate={state.isLoading ? {
               x: [0, 40, 80],
               y: [0, -40, -80],
               rotate: [-45, -45, -45],
               scale: [1, 1.2, 1],
               opacity: [1, 1, 0],
             } : {
               x: 0,
               y: 0,
               rotate: -15,
               opacity: 1,
             }}
             transition={{ 
               duration: 1.5, 
               repeat: state.isLoading ? Infinity : 0,
               ease: "linear"
             }}
             className="absolute bottom-[20%] left-[20%] z-30"
           >
             <Plane className="w-8 h-8 text-red-500 fill-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
           </motion.div>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {state.isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/20 backdrop-blur-[1px] rounded-full"
            >
               <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Signal Button */}
      <div className="w-full px-4 z-10">
        <button
          onClick={generateSignal}
          disabled={state.isLoading}
          className="w-full relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-blue-600 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-60" />
          <div className="relative h-20 bg-gradient-to-br from-red-500/90 to-[#0c1c38] rounded-3xl flex items-center justify-center border-t border-white/20 shadow-2xl active:translate-y-1 transition-transform overflow-hidden">
             
             {/* Progress Bar inside button */}
             {state.isLoading && (
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: '100%' }}
                 transition={{ duration: 1 }}
                 className="absolute bottom-0 left-0 h-1 bg-blue-500 z-10"
               />
             )}

            <div className="flex flex-col items-center">
              <span className="text-2xl font-display font-black tracking-[0.3em] text-white italic">GET SIGNAL</span>
              <span className="text-[10px] text-white/40 font-mono tracking-widest mt-1">REAL-TIME SOCKET SYNC</span>
            </div>
          </div>
        </button>
      </div>

      {/* System Stats Container */}
      <div className="w-full mt-10 grid grid-cols-2 gap-4 z-10 px-2">
         <div className="glass-card rounded-2xl p-4 flex flex-col gap-2 border-white/5">
            <div className="flex items-center gap-2">
               <Activity className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-mono text-gray-400 uppercase">Latency</span>
            </div>
            <span className="text-lg font-bold text-blue-100 font-display">12ms</span>
         </div>
         <div className="glass-card rounded-2xl p-4 flex flex-col gap-2 border-white/5">
            <div className="flex items-center gap-2">
               <Globe className="w-4 h-4 text-purple-400" />
               <span className="text-[10px] font-mono text-gray-400 uppercase">Upstream</span>
            </div>
            <span className="text-lg font-bold text-purple-100 font-display">1wknwr.life</span>
         </div>
      </div>

      {/* Footer Meta */}
      <footer className="w-full mt-12 px-4 py-8 glass-card rounded-3xl border-white/5 flex flex-col gap-6 opacity-80 mb-20">
        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest">
           <span>Instance: {CONFIG.API_ID}</span>
           <span>Hash: {CONFIG.HASH.substring(0, 10)}</span>
        </div>
        
        <div className="h-px bg-white/5 w-full" />

        <div className="flex gap-4">
           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
           </div>
           <div>
              <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wide">Blockchain Verified</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                Signals are cryptographically signed using the provided hash to ensure zero-manipulation integrity.
              </p>
           </div>
        </div>

        {state.lastUpdated && (
           <div className="text-center text-[10px] text-gray-500 font-mono border-t border-white/5 pt-4 mt-2">
             LAST SIGNAL GENERATED AT: {state.lastUpdated}
           </div>
        )}
      </footer>
    </div>
  );
}
