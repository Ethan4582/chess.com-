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
    <main className="min-h-screen bg-[#0e0e0f] grid lg:grid-cols-2 text-white font-body overflow-hidden">
      {/* Left Side: Cinematic Chess Image */}
      <section className="hidden lg:flex relative flex-col justify-end p-12 overflow-hidden border-r border-white/5 bg-[#070708]">
        <div className="absolute inset-0 z-0">
          <img 
             src="/chess_login_sidebar_1774335726334.png" 
             alt="Chess Theme" 
             className="w-full h-full object-cover opacity-60 grayscale scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0f] via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-md">
          <blockquote className="space-y-4">
            <p className="text-4xl font-black leading-tight tracking-tighter text-white">
              "Every move defines the game."
            </p>
            <footer className="text-slate-400 text-sm font-bold uppercase tracking-widest">— Blitzr Strategy</footer>
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
      <section className="flex items-center justify-center p-8 bg-[#0e0e0f] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ba9eff]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10 px-4">
          <div className="mb-12">
            <h2 className="text-4xl font-black mb-3 tracking-tighter text-white">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-slate-400 font-medium">
              {isLogin ? 'Join the arena and continue your streak.' : 'Start your journey to become a grandmaster.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-left py-4"
              >
                <div className="mb-6 flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={24} className="shrink-0" />
                  <p className="font-bold">Wait for confirmation</p>
                </div>
                <h3 className="text-2xl font-black mb-3">Registration Sent!</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">Check your email to confirm your account and enter the Blitzr arena.</p>
                <button
                  onClick={() => { setSuccess(false); setIsLogin(true); }}
                  className="w-full py-4 bg-[#ba9eff] text-black rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-[#ba9eff]/10"
                >
                  Continue to Sign In
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleAuth} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:ring-1 focus:ring-[#ba9eff] outline-none transition-all placeholder:text-slate-700 text-white font-medium"
                    placeholder="grandmaster@blitzr.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 focus:ring-1 focus:ring-[#ba9eff] outline-none transition-all placeholder:text-slate-700 text-white font-medium shadow-sm transition-all shadow-[#ba9eff]/0 focus:shadow-[#ba9eff]/5"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-[#ba9eff] disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#ba9eff]/10 flex items-center justify-center gap-3"
                >
                  {loading && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </button>

                <div className="pt-8 text-center">
                  <p className="text-slate-500 text-sm font-medium">
                    {isLogin ? "New here?" : "Already a member?"}{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-white font-black hover:text-[#ba9eff] transition-colors ml-1"
                    >
                      {isLogin ? 'Sign Up' : 'Log In'}
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
