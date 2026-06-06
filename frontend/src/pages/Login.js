import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// ── Tab IDs ───────────────────────────────────────────────────────────────────
const TAB_SIGNIN  = 'signin';
const TAB_SIGNUP  = 'signup';
const TAB_FORGOT  = 'forgot';

// ── Eye icon ──────────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ── Shared field styles ───────────────────────────────────────────────────────
const inputCls =
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 ' +
  'placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 ' +
  'focus:ring-cyan-500/40 transition-colors text-sm';
const labelCls = 'block text-xs uppercase tracking-widest text-slate-500 mb-2';

// ─────────────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate       = useNavigate();
  const { signIn }     = useAuth();

  const [tab, setTab]         = useState(TAB_SIGNIN);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // Sign-in fields
  const [siEmail, setSiEmail]   = useState('');
  const [siPw,    setSiPw]      = useState('');

  // Sign-up fields
  const [suName,  setSuName]    = useState('');
  const [suEmail, setSuEmail]   = useState('');
  const [suPw,    setSuPw]      = useState('');
  const [suPw2,   setSuPw2]     = useState('');

  // Forgot-password field
  const [fpEmail, setFpEmail]   = useState('');

  // ── Reset state on tab change ───────────────────────────────────────────
  const switchTab = (t) => {
    setTab(t);
    setError('');
    setInfo('');
  };

  // ── Sign In ─────────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      if (supabase) {
        // Real Supabase auth
        const { data, error: sbErr } = await supabase.auth.signInWithPassword({
          email:    siEmail,
          password: siPw,
        });
        if (sbErr) throw new Error(sbErr.message);
        // Sync user into AuthContext
        await signIn(siEmail, siPw);
      } else {
        // Mock fallback
        await signIn(siEmail, siPw);
      }
      navigate('/');
    } catch (err) {
      setError(err.message ?? 'Sign in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ─────────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');

    if (suPw !== suPw2) {
      setError('Passwords do not match.');
      return;
    }
    if (suPw.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (supabase) {
        const { data, error: sbErr } = await supabase.auth.signUp({
          email:    suEmail,
          password: suPw,
          options: {
            data: { full_name: suName },
          },
        });
        if (sbErr) throw new Error(sbErr.message);

        // If email confirmation is required, session will be null
        if (data.session) {
          await signIn(suEmail, suPw);
          navigate('/');
        } else {
          setInfo(
            'Account created! Check your email for a confirmation link, then sign in.'
          );
          switchTab(TAB_SIGNIN);
          setSiEmail(suEmail);
        }
      } else {
        // Mock: just sign in directly
        await signIn(suEmail, suPw);
        navigate('/');
      }
    } catch (err) {
      setError(err.message ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ─────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      if (supabase) {
        const { error: sbErr } = await supabase.auth.resetPasswordForEmail(fpEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (sbErr) throw new Error(sbErr.message);
      }
      setInfo(`Password reset link sent to ${fpEmail}. Check your inbox.`);
      setFpEmail('');
    } catch (err) {
      setError(err.message ?? 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-violet-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 mb-4 shadow-lg shadow-cyan-500/10">
            <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">MartFlow</h1>
          <p className="text-slate-400 text-sm mt-1">Inventory &amp; Asset Management</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/60 overflow-hidden">

          {/* Tab bar — only shown for signin / signup */}
          {tab !== TAB_FORGOT && (
            <div className="flex border-b border-slate-800">
              {[
                { id: TAB_SIGNIN, label: 'Sign In'  },
                { id: TAB_SIGNUP, label: 'Sign Up'  },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => switchTab(id)}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${
                    tab === id
                      ? 'text-cyan-400 border-b-2 border-cyan-500 bg-slate-900'
                      : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="p-7 sm:p-8">

            {/* Global feedback banners */}
            {error && (
              <div className="mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-300 flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                {error}
              </div>
            )}
            {info && (
              <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300 flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {info}
              </div>
            )}

            {/* ── SIGN IN ─────────────────────────────────────────────── */}
            {tab === TAB_SIGNIN && (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    value={siEmail}
                    onChange={e => setSiEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className={inputCls}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`${labelCls} mb-0`}>Password</label>
                    <button
                      type="button"
                      onClick={() => switchTab(TAB_FORGOT)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={siPw}
                      onChange={e => setSiPw(e.target.value)}
                      placeholder="••••••••••"
                      required
                      autoComplete="current-password"
                      className={`${inputCls} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <><Spinner /> Signing in…</> : 'Sign In'}
                </button>

                {/* Demo hint */}
                {!supabase && (
                  <p className="text-center text-xs text-slate-600 pt-1">
                    Demo: use any email + <span className="text-slate-500">password123</span>
                  </p>
                )}
              </form>
            )}

            {/* ── SIGN UP ─────────────────────────────────────────────── */}
            {tab === TAB_SIGNUP && (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input
                    type="text"
                    value={suName}
                    onChange={e => setSuName(e.target.value)}
                    placeholder="Jane Smith"
                    autoComplete="name"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Email *</label>
                  <input
                    type="email"
                    value={suEmail}
                    onChange={e => setSuEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Password *</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={suPw}
                      onChange={e => setSuPw(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      autoComplete="new-password"
                      className={`${inputCls} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                  {/* Strength hint */}
                  {suPw.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4].map(n => (
                        <div key={n} className={`flex-1 h-1 rounded-full transition-colors ${
                          suPw.length >= n * 3
                            ? n <= 1 ? 'bg-rose-500' : n <= 2 ? 'bg-amber-500' : n <= 3 ? 'bg-cyan-500' : 'bg-emerald-500'
                            : 'bg-slate-800'
                        }`}/>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showPw2 ? 'text' : 'password'}
                      value={suPw2}
                      onChange={e => setSuPw2(e.target.value)}
                      placeholder="Repeat password"
                      required
                      autoComplete="new-password"
                      className={`${inputCls} pr-12 ${suPw2 && suPw2 !== suPw ? 'border-rose-500/50' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw2(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <EyeIcon open={showPw2} />
                    </button>
                  </div>
                  {suPw2 && suPw2 !== suPw && (
                    <p className="mt-1.5 text-xs text-rose-400">Passwords don't match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || (suPw2.length > 0 && suPw !== suPw2)}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <><Spinner /> Creating account…</> : 'Create Account'}
                </button>

                <p className="text-center text-xs text-slate-600 pt-1">
                  By signing up you agree to our{' '}
                  <span className="text-slate-500">Terms of Service</span>.
                </p>
              </form>
            )}

            {/* ── FORGOT PASSWORD ──────────────────────────────────────── */}
            {tab === TAB_FORGOT && (
              <div className="space-y-5">
                <div>
                  <button
                    onClick={() => switchTab(TAB_SIGNIN)}
                    className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back to Sign In
                  </button>
                  <h2 className="text-base font-semibold text-slate-100">Reset your password</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      type="email"
                      value={fpEmail}
                      onChange={e => setFpEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className={inputCls}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <><Spinner /> Sending…</> : 'Send Reset Link'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 mt-6">
          MartFlow · Inventory &amp; Asset Management
        </p>
      </div>
    </div>
  );
}
