'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    <main className="min-h-screen bg-[#0e0e0f] flex flex-col items-center justify-center p-6 text-white font-body selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-5 grayscale pointer-events-none" />

      {/* Brand */}
      <Link href="/" className="absolute top-8 left-8 text-2xl font-black tracking-tighter text-white font-headline flex items-center gap-2 z-10 hover:opacity-80 transition-opacity">
        Blitzr <span className="w-2 h-2 rounded-full bg-[#b9a2ff]" />
      </Link>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative w-full max-w-md bg-[#121213] rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/10 z-10"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b9a2ff] to-indigo-500 rounded-t-[32px]" />

          <div className="mb-8 text-center pt-2">
            <h2 className="text-3xl font-black mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 font-medium">
              {isLogin ? 'Ready for another grandmaster match?' : 'Join a community of master players.'}
            </p>
          </div>

          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
              <div className="mb-6 inline-flex items-center justify-center p-4 rounded-3xl bg-green-500/10 text-green-500 border border-green-500/20">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-xl font-bold mb-2">Registration Successful!</h3>
              <p className="text-slate-400 mb-8 px-4 leading-relaxed">Please check your email to confirm your account and start playing.</p>
              <button
                onClick={() => { setSuccess(false); setIsLogin(true); }}
                className="w-full py-4 bg-white text-black rounded-2xl font-bold transition-all hover:bg-slate-200"
              >
                Continue to Login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#b9a2ff] transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#b9a2ff] focus:border-transparent outline-none transition-all placeholder:text-slate-600 text-white"
                    placeholder="grandmaster@chess.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#b9a2ff] transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#b9a2ff] focus:border-transparent outline-none transition-all placeholder:text-slate-600 text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-[#b9a2ff] hover:bg-[#a285ff] disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-black text-lg shadow-[0_0_20px_rgba(185,162,255,0.2)] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading && <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                {isLogin ? 'Enter The Arena' : 'Join The Club'}
              </button>

              <p className="text-center text-slate-400 text-sm mt-8 border-t border-white/5 pt-6">
                {isLogin ? "New to the arena?" : "Already a member?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-white font-bold hover:text-[#b9a2ff] transition-colors"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
