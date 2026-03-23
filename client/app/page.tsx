'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { User, Users, View, Sparkles, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [name, setName] = useState('');
  const router = useRouter();
  const socket = getSocket();

  useEffect(() => {
    socket.connect();
  }, [socket]);

  const handlePlayFriend = () => {
    const roomId = Math.random().toString(36).substring(2, 10);
    router.push(`/game/${roomId}?name=${encodeURIComponent(name || 'Player')}`);
  };

  const handleViewGame = () => {
    const id = prompt('Enter Game ID:');
    if (id) router.push(`/game/${id}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b] text-slate-100 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 8 }}
            className="inline-flex items-center justify-center mb-4 text-indigo-500"
          >
            <Trophy size={64} fill="currentColor" fillOpacity={0.1} />
          </motion.div>
          <h1 className="text-5xl font-black mb-2 tracking-tight">
            Chess <span className="gradient-text">Master</span>
          </h1>
          <p className="text-slate-400">Play, compete, and master the board</p>
        </div>

        <div className="glass p-8 rounded-3xl space-y-8 shadow-2xl">
          <div className="space-y-4">
            <label className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Profile</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <button 
              onClick={handlePlayFriend}
              disabled={!name}
              className={cn(
                "w-full py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all relative overflow-hidden group",
                !name ? "bg-indigo-600/50 opacity-50 cursor-not-allowed text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              )}
            >
              <Users size={20} />
              Challenge a Friend
            </button>

            <button 
              onClick={handleViewGame}
              className="w-full py-5 text-slate-400 font-semibold hover:text-slate-100 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <View size={18} />
              View Existing Game
            </button>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-slate-600 text-sm font-medium">
        <div className="flex items-center gap-2"><Sparkles size={16} /> 1.2k Active</div>
        <div className="flex items-center gap-2"><Users size={16} /> 450 Games</div>
      </div>
    </main>
  );
}
