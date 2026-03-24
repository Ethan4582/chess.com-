'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Info, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setShowModal(true);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#ba9eff]/20 border-t-[#ba9eff] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 relative">
        <AnimatePresence>
          {showModal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full bg-[#131314] border border-white/5 p-8 rounded-3xl shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-[#ba9eff]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#ba9eff]/20">
                <Info className="text-[#ba9eff]" size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Access Restricted</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  The archives and active war rooms are reserved for registered Grandmasters.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => router.push('/login')}
                  className="w-full py-4 bg-[#ba9eff] text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <LogIn size={14} />
                  Sign In to Continue
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="w-full py-4 bg-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                >
                  Return to Lobby
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return <>{children}</>;
}
