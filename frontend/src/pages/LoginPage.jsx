import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('operator@somaiya.edu');
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
        await authApi.login(email, password);
      } else {
        await authApi.register(email, password);
      }
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        (isLogin ? 'Invalid email or password.' : 'Registration failed.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4">
      <div className="max-w-sm w-full bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm space-y-5">
        {/* Simple Brand */}
        <div className="border-b border-[#E5E7EB] pb-4">
          <span className="text-lg font-semibold tracking-wider text-[#172235]">
            THERMOCORE
          </span>
          <p className="text-xs text-[#6B7280] mt-0.5">
            EV Battery Thermal Management System
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E5E7EB] text-xs">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`pb-2 px-1 mr-4 font-medium transition-colors border-b-2 ${
              isLogin ? 'border-[#2563A6] text-[#2563A6]' : 'border-transparent text-[#6B7280] hover:text-[#202938]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`pb-2 px-1 font-medium transition-colors border-b-2 ${
              !isLogin ? 'border-[#2563A6] text-[#2563A6]' : 'border-transparent text-[#6B7280] hover:text-[#202938]'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 bg-[#FBEBEB] border border-[#F4C5C5] text-[#C34848] rounded text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block mb-1 font-medium text-[#202938]">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. operator@somaiya.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#E5E7EB] rounded px-3 py-2 text-xs text-[#202938] focus:border-[#2563A6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#202938]">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#E5E7EB] rounded px-3 py-2 text-xs text-[#202938] focus:border-[#2563A6] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#2563A6] hover:bg-[#1D4F85] text-white rounded font-medium text-xs transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="text-[11px] text-[#6B7280] pt-2 border-t border-[#E5E7EB]">
          Default evaluation credentials: <code className="text-[#202938]">operator@somaiya.edu</code> / <code className="text-[#202938]">operator123</code>
        </div>
      </div>
    </div>
  );
}
