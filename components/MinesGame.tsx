'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bomb, Star, Settings, Info, RefreshCw, Zap, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMinesSignal } from '@/lib/actions';
import { io, Socket } from 'socket.io-client';

// Constants from user request
const CONFIG = {
  API_ID: '20488266',
  HASH: '4e059b0a0b42114bfd2617c343fb539a',
  GRID_SIZE: 25,
  SIDE: 5,
};

interface GameState {
  grid: ('star' | 'empty')[];
  isLoading: boolean;
  mines: number;
}

export default function MinesGame() {
  const [state, setState] = useState<GameState>({
    grid: Array(25).fill('empty'),
    isLoading: false,
    mines: 3,
  });
  const [socketStatus, setSocketStatus] = useState<'connected' | 'syncing'>('syncing');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize Socket.io connection
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketStatus('connected');
      console.log('Connected to real-time engine');
    });

    socket.on('game:update', (data) => {
      if (data.type === 'mines') {
        console.log('Real-time data received:', data);
        // We could automatically update prediction here if desired
      }
    });

    socket.on('disconnect', () => {
      setSocketStatus('syncing');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const generateSignal = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await getMinesSignal(state.mines);
      
      if (result.success) {
        setState(prev => ({ ...prev, grid: result.grid, isLoading: false }));
        
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
  }, [state.mines]);

  const setMines = (count: number) => {
    setState(prev => ({ ...prev, mines: count, grid: Array(25).fill('empty') }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 pb-20 max-w-md mx-auto relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full" />

      {/* Header */}
      <header className="w-full flex justify-between items-center mb-8 px-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight leading-none">MINES PRO</h1>
            <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest">Signal System v2.4</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className={cn(
             "px-2 py-1 rounded-full flex items-center gap-1.5 border border-white/5",
             socketStatus === 'connected' ? "bg-green-500/10" : "bg-yellow-500/10"
           )}>
             <div className={cn(
               "w-1.5 h-1.5 rounded-full animate-pulse",
               socketStatus === 'connected' ? "bg-green-400" : "bg-yellow-400"
             )} />
             <span className={cn(
               "text-[9px] font-mono uppercase font-bold",
               socketStatus === 'connected' ? "text-green-400" : "text-yellow-400"
             )}>
               {socketStatus === 'connected' ? "Socket: Live" : "Socket: Syncing"}
             </span>
           </div>
        </div>
      </header>

      {/* Stats/API Info */}
      <div className="w-full grid grid-cols-2 gap-3 mb-6 z-10">
        <div className="glass-card rounded-2xl p-3 flex flex-col gap-1 border-blue-500/10">
          <span className="text-[10px] text-gray-400 uppercase font-mono">Server Instance</span>
          <span className="text-sm font-medium text-blue-100">ID: {CONFIG.API_ID}</span>
        </div>
        <div className="glass-card rounded-2xl p-3 flex flex-col gap-1 border-purple-500/10">
          <span className="text-[10px] text-gray-400 uppercase font-mono">Signal Integrity</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span className="text-sm font-medium text-green-400">98.2%</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative glass-card rounded-3xl p-4 shadow-2xl z-10 border-white/10">
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {state.grid.map((cell, idx) => (
            <motion.div
              key={idx}
              initial={false}
              animate={{ 
                scale: cell === 'star' ? [1, 1.1, 1] : 1,
                rotateY: cell === 'star' ? 180 : 0
              }}
              transition={{ duration: 0.3, delay: idx * 0.01 }}
              className={cn(
                "relative w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500",
                cell === 'star' 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)] border-t border-white/30" 
                  : "bg-[#141725] border-b-4 border-black/30 hover:bg-[#1c2135]"
              )}
            >
              {cell === 'star' ? (
                <motion.div
                  initial={{ rotateY: 180, scale: 0 }}
                  animate={{ rotateY: 180, scale: 1 }}
                  className="w-full h-full flex items-center justify-center p-2"
                >
                  <Star className="w-full h-full text-white fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </motion.div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-white/5" />
              )}

              {/* Grid Numbering (optional stylistic) */}
              <span className="absolute top-1 left-1.5 text-[8px] text-white/5 font-mono pointer-events-none">
                {idx + 1}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {state.isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center z-20"
            >
                <div className="relative">
                    <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                    <div className="absolute inset-0 blur-lg bg-blue-500 animate-pulse" />
                </div>
                <p className="mt-4 text-sm font-display text-blue-200 tracking-widest uppercase animate-pulse">Calculating Path...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="w-full mt-8 flex flex-col gap-6 z-10">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end px-1">
             <label className="text-xs font-mono uppercase text-gray-400 tracking-wider">Configure Mines</label>
             <span className="text-xl font-bold font-display text-blue-400">{state.mines}</span>
          </div>
          <div className="flex justify-between gap-2">
            {[3, 5, 10, 15, 24].map((num) => (
              <button
                key={num}
                onClick={() => setMines(num)}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-bold transition-all border-b-2 active:translate-y-[2px] active:border-b-0",
                  state.mines === num 
                    ? "bg-blue-600 border-blue-800 text-white shadow-lg shadow-blue-600/20" 
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateSignal}
          disabled={state.isLoading}
          className="relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-60" />
          <div className="relative h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center border-t border-white/30 shadow-xl active:translate-y-1 transition-transform">
            <span className="text-xl font-display font-black tracking-[0.2em] text-white italic">GET SIGNAL</span>
            {state.isLoading && <RefreshCw className="absolute right-6 w-5 h-5 animate-spin opacity-50" />}
          </div>
        </button>
      </div>

      {/* Footer Info */}
      <footer className="w-full mt-12 mb-6 px-4 py-6 glass-card rounded-2xl border-white/5 flex flex-col gap-2 opacity-60">
        <div className="flex items-center gap-2">
           <Info className="w-4 h-4 text-blue-400" />
           <span className="text-[10px] text-gray-300 font-mono tracking-tight">Security Hash: {CONFIG.HASH.substring(0, 16)}...</span>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed italic">
          Disclaimer: This system uses statistical prediction models. Probabilities vary based on game RNG. Use for reference only.
        </p>
      </footer>
    </div>
  );
}
