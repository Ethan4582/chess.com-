'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

// Lobby Components
import { LobbyHero } from '@/components/lobby/LobbyHero';
import { ActiveGameCard } from '@/components/lobby/ActiveGameCard';
import { LeaderboardCard } from '@/components/lobby/LeaderboardCard';
import { LiveGamesPreview } from '@/components/lobby/LiveGamesPreview';
import { RecentMatches } from '@/components/lobby/RecentMatches';
import { StatsCard } from '@/components/lobby/StatsCard';

export default function LobbyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [topProfiles, setTopProfiles] = useState<any[]>([]);
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLobbyData();

    // Set up real-time subscription for profile updates (StatsCard)
    let profileSubscription: any = null;
    const setupRealtime = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session) {
          profileSubscription = supabase
             .channel(`lobby-profile-${session.user.id}`)
             .on(
                'postgres_changes',
                {
                   event: '*',
                   schema: 'public',
                   table: 'profiles',
                   filter: `id=eq.${session.user.id}`,
                },
                (payload) => {
                   if (payload.new) setProfile(payload.new);
                }
             )
             .subscribe();
       }
    };
    setupRealtime();

    return () => {
       if (profileSubscription) profileSubscription.unsubscribe();
    };
  }, []);

  const fetchLobbyData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      const cacheKey = `lobby_data_${userId}`;
      const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

      // Check cache for non-critical data
      let cachedData: any = null;
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            cachedData = parsed;
            // Show cached data immediately while fetching fresh
            setTopProfiles(parsed.topProfiles || []);
            setRecentMatches(parsed.recentMatches || []);
          }
        }
      } catch {}

      // 1. Profile & Stats — Always fetch fresh (ELO is real-time critical)
      const [{ data: profileData }, { data: userRank }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.rpc('get_user_rank', { target_user_id: userId })
      ]);

      if (profileData) {
        setProfile({ ...profileData, rank: userRank });
      }

      // 2. Active Room — Always fetch fresh (game state critical)
      const { data: activeData } = await supabase
        .from('rooms')
        .select('id, white_player_id, black_player_id, status')
        .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
        .eq('status', 'playing')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeData) {
         const isWhite = activeData.white_player_id === userId;
         const opponentId = isWhite ? activeData.black_player_id : activeData.white_player_id;
         
         let opponentName = 'Ghost Rival';
         if (opponentId) {
            const { data: oppProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', opponentId)
              .single();
            opponentName = oppProfile?.username || 'Guest';
         }

         setActiveRoom({
            id: activeData.id,
            opponent: opponentName,
            status: activeData.status
         });
      } else {
        setActiveRoom(null);
      }

      // 3. Live Games — Always fetch fresh (real-time)
      const { data: playingRooms } = await supabase
        .from('rooms')
        .select(`
          id, 
          spectators_count,
          white_player:profiles!white_player_id(username),
          black_player:profiles!black_player_id(username)
        `)
        .eq('status', 'playing')
        .order('created_at', { ascending: false })
        .limit(3);
      setLiveGames(playingRooms || []);

      // 4. Leaderboard Top 5 — Use cache or fetch
      if (!cachedData) {
        const { data: leaderboardData } = await supabase
          .from('profiles')
          .select('id, username, points')
          .order('points', { ascending: false })
          .limit(5);
        setTopProfiles(leaderboardData || []);
      }

      // 5. Recent Matches — Use cache or fetch
      let formattedMatches = cachedData?.recentMatches;
      if (!cachedData) {
        const { data: pastRooms } = await supabase
          .from('rooms')
          .select(`
            id, created_at, winner_id,
            white_player:profiles!white_player_id(username, id),
            black_player:profiles!black_player_id(username, id)
          `)
          .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
          .eq('status', 'finished')
          .order('created_at', { ascending: false })
          .limit(5);

        if (pastRooms) {
           formattedMatches = pastRooms.map((room: any) => {
              const isWhite = room.white_player?.id === userId;
              const opponent = (isWhite ? room.black_player?.username : room.white_player?.username) || 'Guest';
              let result: 'WIN' | 'LOSS' | 'DRAW' = 'DRAW';
              if (room.winner_id === userId) result = 'WIN';
              else if (room.winner_id) result = 'LOSS';
              
              return {
                 id: room.id,
                 opponent: opponent,
                 result,
                 date: new Date(room.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              };
           });
           setRecentMatches(formattedMatches || []);
        }
      }

      // Update cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          topProfiles: cachedData ? cachedData.topProfiles : (topProfiles.length ? topProfiles : []),
          recentMatches: formattedMatches || [],
          timestamp: Date.now()
        }));
      } catch {}

    } catch (err) {
      console.error('Lobby Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          white_player_id: session.user.id,
          status: 'waiting'
        })
        .select()
        .single();
      
      if (error) throw error;
      router.push(`/game/${data.id}`);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#0a0a0b] no-scrollbar h-full">
           <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 min-h-full">
              
                
              <StatsCard stats={profile} loading={loading} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                 
                
                 <div className="lg:col-span-8 space-y-10">
                    
                    <LobbyHero 
                       username={profile?.username || 'Grandmaster'} 
                       onStartGame={handleCreateRoom} 
                    />

                    {activeRoom && (
                       <ActiveGameCard activeRoom={activeRoom} loading={loading} />
                    )}

                    <LiveGamesPreview games={liveGames} loading={loading} />

                    <RecentMatches games={recentMatches} loading={loading} />

                 </div>

                 
                 <div className="lg:col-span-4 space-y-8">
                    <LeaderboardCard topProfiles={topProfiles} profile={profile} loading={loading} />
                 </div>

              </div>

           </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
