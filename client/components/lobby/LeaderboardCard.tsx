'use client'

import React from 'react';
import { Trophy, TrendingUp, User, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Profile {
  id: string;
  username: string;
  points: number;
}

interface LeaderboardCardProps {
  topProfiles: Profile[];
  profile: Profile | null;
  loading: boolean;
}

export function LeaderboardCard({ topProfiles, profile, loading }: LeaderboardCardProps) {
  return (
    <div className="bg-[#131314] rounded-[2rem] p-8 h-full space-y-8 flex flex-col border border-white/[0.03]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Leaderboard</h2>
        <span className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded uppercase tracking-widest">GLOBAL</span>
      </div>

      <div className="space-y-6 flex-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse bg-white/5 rounded-xl" />
          ))
        ) : (
          topProfiles.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <span className="text-2xl font-black italic text-[#ba9eff]/40 group-hover:text-[#ba9eff] transition-colors">
                0{i + 1}
              </span>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 group-hover:border-[#ba9eff]/30 transition-all">
                <img 
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${p.username}`} 
                  alt={p.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{p.username}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Elo: {p.points}</p>
              </div>
              <TrendingUp size={14} className="text-[#ff97b5] shrink-0" />
            </motion.div>
          ))
        )}
      </div>

      {/* Your Position */}
      {!loading && profile && (
        <div className="pt-8 border-t border-white/5">
          <p className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-[0.2em]">Your Position</p>
          <div className="flex items-center gap-4 p-4 bg-[#ba9eff]/5 rounded-2xl border border-[#ba9eff]/10">
            <span className="text-2xl font-black text-[#ba9eff] italic">412</span>
            <div className="w-12 h-12 rounded-xl bg-[#ba9eff]/10 border border-[#ba9eff]/20 overflow-hidden shrink-0">
              <img 
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.username}`} 
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile.username}</p>
              <p className="text-[10px] text-[#ba9eff] font-bold uppercase tracking-widest">Elo: {profile.points}</p>
            </div>
          </div>
        </div>
      )}

      <Link 
        href="/leaderboard"
        className="w-full py-3 rounded-xl bg-white/5 text-slate-500 font-bold text-[10px] uppercase tracking-widest text-center hover:bg-white/10 hover:text-white transition-all mt-4"
      >
        View Full Standings
      </Link>
    </div>
  );
}
