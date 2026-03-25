import React from 'react';
import { Trophy } from 'lucide-react';

interface PlayerInfoProps {
  name: string;
  elo: string | number;
  role: 'w' | 'b';
  isCurrentTurn: boolean;
  avatarSeed?: string;
  isCompact?: boolean;
}

export function PlayerInfo({ name, elo, role, isCurrentTurn, avatarSeed, isCompact }: PlayerInfoProps) {
  return (
    <div className={`flex items-center justify-between w-full ${isCompact ? 'px-2 py-1' : 'px-4 py-3'} transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={`w-10 h-10 rounded-xl bg-[#1a1a1b] overflow-hidden border ${isCurrentTurn ? 'border-[#ba9eff]' : 'border-white/10 shadow-lg'}`}>
            <img 
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${avatarSeed || name}`} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          </div>
          {isCurrentTurn && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#ba9eff] rounded-full border-2 border-[#0a0a0b] shadow-[0_0_8px_rgba(186,158,255,0.6)]" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-tight truncate max-w-[120px]">{name}</span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${role === 'w' ? 'text-white/40' : 'text-slate-500'}`}>
            {role === 'w' ? 'White' : 'Black'}
          </span>
        </div>
      </div>
      
      <div className="bg-[#1a1a1b] border border-white/5 shadow-inner px-4 py-2 rounded-xl flex items-center gap-2">
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">ELO</span>
         <span className="text-sm font-black text-white tabular-nums tracking-tight">
            {elo}
         </span>
      </div>
    </div>
  );
}
