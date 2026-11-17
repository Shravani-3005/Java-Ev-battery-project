import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { authApi } from '../api/client';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('operator');
  const [password, setPassword] = useState('operator123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await authApi.login(username, password);
      } else {
        await authApi.register(username, password);
      }
      navigate('/');
      window.location.reload(); // refresh session state in navbar
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        (isLogin ? 'Invalid credentials. Default: operator / operator123' : 'Registration failed.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex flex-col justify-center items-center p-4 font-mono select-none">
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-[#FF7900]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#141416] border border-[#34343A] rounded-xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#1B1B1F] border border-[#FF7900] flex items-center justify-center text-[#FF7900] shadow-lg shadow-[#FF7900]/20">
            <Zap className="w-7 h-7 fill-[#FF7900]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#F5F5F5] tracking-wider flex items-center justify-center gap-1.5">
              THERMO<span className="text-[#FF7900]">CORE</span>
            </h1>
            <p className="text-[11px] text-[#A1A1AA] uppercase tracking-widest mt-0.5">
              EV Battery Thermal Intelligence Platform
            </p>
          </div>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex bg-[#1B1B1F] p-1 rounded-lg border border-[#34343A] text-xs">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`w-1/2 py-2 rounded-md font-bold transition-all ${
              isLogin ? 'bg-[#FF7900] text-black shadow' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            Operator Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`w-1/2 py-2 rounded-md font-bold transition-all ${
              !isLogin ? 'bg-[#FF7900] text-black shadow' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Demo Credentials Hint */}
        {isLogin && (
          <div className="p-3 bg-[#1B1B1F] border border-[#34343A] rounded-lg text-[11px] text-[#A1A1AA] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#F5F5F5] font-bold">Phase 3 Evaluator Credentials:</span>
              <div className="mt-0.5">
                Username: <code className="text-[#FF7900]">operator</code> | Password: <code className="text-[#FF7900]">operator123</code>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[#A1A1AA] block mb-1.5 font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#FF7900]" />
              USERNAME
            </label>
            <input
              type="text"
              required
              placeholder="e.g. operator"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1B1B1F] border border-[#34343A] rounded-lg px-3.5 py-2.5 text-[#F5F5F5] placeholder-[#555] focus:border-[#FF7900] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[#A1A1AA] block mb-1.5 font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#FF7900]" />
              PASSWORD
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1B1B1F] border border-[#34343A] rounded-lg px-3.5 py-2.5 text-[#F5F5F5] placeholder-[#555] focus:border-[#FF7900] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#FF7900] hover:bg-[#ff8c1a] text-black font-extrabold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF7900]/20 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Authenticating with Spring Security...' : (isLogin ? 'Sign In & Enter Dashboard' : 'Register & Enter Dashboard')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
