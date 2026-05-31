'use client';

import React, { useState } from 'react';
import MinesGame from '@/components/MinesGame';
import AviatorGame from '@/components/AviatorGame';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Plane, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

type GameMode = 'mines' | 'aviator';

export default function Home() {
  const [mode, setMode] = useState<GameMode>('mines');

  return (
    <main className="min-h-screen bg-[#060d17] text-white">
      {/* Container for game rendering */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'mines' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'mines' ? 20 : -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {mode === 'mines' ? <MinesGame /> : <AviatorGame />}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#0f111a]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-50">
         <button 
           onClick={() => setMode('mines')}
           className={cn(
             "flex flex-col items-center gap-1 transition-all duration-300",
             mode === 'mines' ? "text-blue-500 scale-110" : "text-gray-500 hover:text-gray-300"
           )}
         >
           <LayoutGrid className={cn("w-6 h-6", mode === 'mines' && "fill-blue-500/20")} />
           <span className="text-[10px] font-bold uppercase tracking-widest">Mines</span>
           {mode === 'mines' && (
             <motion.div layoutId="nav-glow" className="absolute -inset-4 bg-blue-500/10 blur-xl rounded-full -z-10" />
           )}
         </button>

         <div className="w-px h-8 bg-white/5" />

         <button 
           onClick={() => setMode('aviator')}
           className={cn(
             "flex flex-col items-center gap-1 transition-all duration-300",
             mode === 'aviator' ? "text-red-500 scale-110" : "text-gray-500 hover:text-gray-300"
           )}
         >
           <Plane className={cn("w-6 h-6 rotate-[-45deg]", mode === 'aviator' && "fill-red-500/20")} />
           <span className="text-[10px] font-bold uppercase tracking-widest">Aviator</span>
           {mode === 'aviator' && (
             <motion.div layoutId="nav-glow" className="absolute -inset-4 bg-red-400/10 blur-xl rounded-full -z-10" />
           )}
         </button>
      </nav>
    </main>
  );
}
