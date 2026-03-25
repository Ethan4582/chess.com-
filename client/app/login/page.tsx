'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, ShieldCheck, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { secureStorage } from '@/lib/secureStorage';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // 1. Detect if we are in dev mode for DX features
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      setIsDev(true);
    }

    // 2. Load cached credentials (Secure)
    const cachedEmail = secureStorage.get('email');
    const cachedPassword = secureStorage.get('password');
    if (cachedEmail) {
      setEmail(cachedEmail);
      setRememberMe(true);
      if (cachedPassword) setPassword(cachedPassword);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Caching for DX/UX if "Remember Me" is checked
        if (rememberMe) {
          secureStorage.save('email', email);
          secureStorage.save('password', password);
        } else {
          secureStorage.clear('email');
          secureStorage.clear('password');
        }

        router.push('/lobby');
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

  const handleQuickLogin = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('password123'); // Custom test password if they use standard one
  };

  return (
    <main className="min-h-screen bg-[#0e0e0f] grid lg:grid-cols-2 text-white overflow-hidden">
      
      <section className="hidden lg:flex relative flex-col justify-end p-12 overflow-hidden border-r border-white/5 bg-[#070708]">
        <div className="absolute inset-0 z-0">
          <img 
             src="/assets/chess_login_sidebar_1774335726334.png" 
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
            <p className="text-3xl font-black leading-tight tracking-tight text-white italic">
              "Victory belongs to the most persevering."
            </p>
            <footer className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#ba9eff]/30" />
              Blitzr Anthology
            </footer>
          </blockquote>
        </div>
        
        <Link href="/" className="absolute top-12 left-12 group">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/logo1.png" 
              alt="Blitzr Logo" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </div>
        </Link>
      </section>

      
      <section className="flex items-center justify-center p-8 bg-[#0e0e0f] relative overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-xs relative z-10 py-12">
          
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/5 mb-6">
              {isLogin ? <LogIn className="text-[#ba9eff]" size={20} /> : <UserPlus className="text-[#ba9eff]" size={20} />}
            </div>
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
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3.5 px-4 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-[#ba9eff]/50 focus:bg-white/[0.05] transition-all font-medium"
                    placeholder="grandmaster@blitzr.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Secure Password</label>
                  <input
                    type="password"
                    required
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3.5 px-4 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-[#ba9eff]/50 focus:bg-white/[0.05] transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border transition-colors ${rememberMe ? 'bg-[#ba9eff] border-[#ba9eff]' : 'bg-white/5 border-white/10 group-hover:border-white/20'}`} />
                        {rememberMe && (
                          <div className="absolute inset-0 flex items-center justify-center text-black">
                            <CheckCircle2 size={10} strokeWidth={4} />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">Remember Credentials</span>
                    </label>
                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-[#ba9eff]/60 hover:text-[#ba9eff] transition-colors">Forgot?</button>
                  </div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/10">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 bg-gradient-to-r from-[#ba9eff] to-[#a084ff] hover:from-[#c5b0ff] hover:to-[#ba9eff] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black text-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#ba9eff]/10 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>{isLogin ? 'Sign In to Arena' : 'Join the Ranks'}</>
                  )}
                </button>

                <div className="pt-8 text-center border-t border-white/5">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {isLogin ? "New to Blitzr?" : "Already joined?"}{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-white hover:text-[#ba9eff] transition-colors ml-1 font-black"
                    >
                      {isLogin ? 'Create Account' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Accent */}
        <div className="fixed bottom-0 right-0 w-[40vw] h-[40vh] bg-[#ba9eff]/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mb-40" />
      </section>
    </main>
  );
}
