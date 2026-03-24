'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0e0e0f] grid lg:grid-cols-2 text-white overflow-hidden">
      {/* Left Side: Cinematic Chess Image */}
      <section className="hidden lg:flex relative flex-col justify-end p-12 overflow-hidden border-r border-white/5 bg-[#070708]">
        <div className="absolute inset-0 z-0">
          <img 
             src="/assets/sidebar_chess.png" 
             alt="Chess Theme" 
             className="w-full h-full object-cover opacity-60 grayscale scale-110"
             onError={(e) => {
               (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1529697210544-134fbd815a51?q=80&w=1200'
             }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0f] via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-sm">
          <blockquote className="space-y-4">
            <p className="text-3xl font-black leading-tight tracking-tight text-white">
              "Victory belongs to the most persevering."
            </p>
            <footer className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Blitzr Anthology</footer>
          </blockquote>
        </div>
        
        {/* Brand */}
        <Link href="/" className="absolute top-12 left-12 hover:opacity-80 transition-opacity">
          <img 
            src="/assets/logo1.png" 
            alt="Blitzr Logo" 
            className="h-10 w-auto object-contain" 
          />
        </Link>
      </section>

      {/* Right Side: Clean Auth Card */}
      <section className="flex items-center justify-center p-8 bg-[#0e0e0f] relative">
        <div className="w-full max-w-xs relative z-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              {isLogin ? 'Enter your credentials to enter the arena.' : 'Join the world-class chess community.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 justify-center">
                  <CheckCircle2 size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Email Sent</p>
                </div>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">Please check your inbox to verify your account.</p>
                <button
                  onClick={() => { setSuccess(false); setIsLogin(true); }}
                  className="w-full py-3.5 bg-[#ba9eff] text-black rounded-lg font-black text-xs uppercase tracking-widest transition-all hover:translate-y-[-1px] shadow-lg shadow-[#ba9eff]/10"
                >
                  Confirm & Sign In
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleAuth} 
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3 px-4 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-[#ba9eff]/50 transition-all font-medium"
                    placeholder="grandmaster@blitzr.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Secure Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3 px-4 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-[#ba9eff]/50 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/10">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 bg-[#ba9eff] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-black text-black text-[10px] uppercase tracking-widest transition-all hover:translate-y-[-1px] shadow-lg shadow-[#ba9eff]/5 flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </button>

                <div className="pt-6 text-center border-t border-white/5">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {isLogin ? "New to Blitzr?" : "Already joined?"}{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-white hover:text-[#ba9eff] transition-colors ml-1"
                    >
                      {isLogin ? 'Create Account' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
