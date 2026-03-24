'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/lib/supabaseClient';
import { AnimatePresence } from 'framer-motion';
import { 
  Room, 
  WatchHeader, 
  FilterTabs, 
  FeaturedMatch, 
  GameCard, 
  EmptyState, 
  WatchPagination 
} from '../../components/WatchComponents';

const PAGE_SIZE = 9;

export default function WatchPage() {
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [finishedRooms, setFinishedRooms] = useState<Room[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingFinished, setLoadingFinished] = useState(true);
  const [page, setPage] = useState(0);
  const [totalFinished, setTotalFinished] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'finished'>('all');

  const fetchActiveRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*, white_player:profiles!white_player_id(username, points), black_player:profiles!black_player_id(username, points)')
      .eq('status', 'playing')
      .order('created_at', { ascending: false });

    if (!error && data) setActiveRooms(data as Room[]);
    setLoadingActive(false);
  };

  const fetchFinishedRooms = async (p: number) => {
    setLoadingFinished(true);
    const { data, error, count } = await supabase
      .from('rooms')
      .select('*, white_player:profiles!white_player_id(username, points), black_player:profiles!black_player_id(username, points)', { count: 'exact' })
      .eq('status', 'finished')
      .order('updated_at', { ascending: false })
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);

    if (!error && data) {
      setFinishedRooms(data as Room[]);
      if (count !== null) setTotalFinished(count);
    }
    setLoadingFinished(false);
  };

  useEffect(() => {
    fetchActiveRooms();
    fetchFinishedRooms(0);

    const channel = supabase
      .channel('watch-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        const updatedRoom = payload.new as Room;
        const oldRoom = payload.old as Room;

        if (updatedRoom.status === 'playing') {
          setActiveRooms(prev => {
            const index = prev.findIndex(r => r.id === updatedRoom.id);
            if (index !== -1) {
              const newList = [...prev];
              newList[index] = { ...prev[index], ...updatedRoom };
              return newList;
            } else {
              fetchActiveRooms();
              return prev;
            }
          });
        } 
        
        if (updatedRoom.status === 'finished' && oldRoom?.status === 'playing') {
           setActiveRooms(prev => prev.filter(r => r.id !== updatedRoom.id));
           fetchFinishedRooms(page);
        }

        if (updatedRoom.status === 'playing' && oldRoom?.status === 'waiting') {
           fetchActiveRooms();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [page]);

  const featuredGame = useMemo(() => activeRooms[0], [activeRooms]);
  
  const displayGrid = useMemo(() => {
    // FIX: In 'live' mode, show all active rooms in the grid.
    if (activeFilter === 'live') return activeRooms;
    
    // In 'all' mode, filter out the featured game from the grid to avoid duplication.
    const gridActive = activeRooms.filter(r => r.id !== featuredGame?.id);
    if (activeFilter === 'finished') return finishedRooms;
    return [...gridActive, ...finishedRooms];
  }, [activeRooms, finishedRooms, activeFilter, featuredGame]);

  const totalPages = Math.ceil(totalFinished / PAGE_SIZE);

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0a0b]">
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <WatchHeader count={activeRooms.length} />
            <FilterTabs active={activeFilter} onChange={(f) => { setActiveFilter(f); if (f === 'finished') setPage(0); }} />
          </div>

          <AnimatePresence mode="wait">
             {(activeFilter === 'all' || activeFilter === 'live') && featuredGame && (
               <FeaturedMatch room={featuredGame} />
             )}
          </AnimatePresence>

          <div className="space-y-12">
            {displayGrid.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {displayGrid.map((room) => (
                    <GameCard key={room.id} room={room} />
                  ))}
                </AnimatePresence>
              </div>
            ) : !(loadingActive || loadingFinished) && (
              <EmptyState />
            )}

            {(activeFilter === 'all' || activeFilter === 'finished') && totalPages > 1 && (
              <WatchPagination 
                page={page} 
                total={totalPages} 
                onPageChange={(p) => { setPage(p); fetchFinishedRooms(p); }} 
              />
            )}
          </div>

          {(loadingActive || loadingFinished) && (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
               <div className="w-10 h-10 rounded-xl border-2 border-[#ba9eff]/20 border-t-[#ba9eff] animate-spin mb-4" />
               <p className="text-slate-700 text-[10px] font-black uppercase tracking-widest italic tracking-wider">Syncing Battlefield States...</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
