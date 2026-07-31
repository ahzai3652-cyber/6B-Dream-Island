import React from 'react';
import { UserSession, Student, ActiveParty } from '../types';
import { LogOut, Shield, Sparkles, ShoppingBag, Home, Trophy, Gift, Wifi, PartyPopper } from 'lucide-react';

interface NavbarProps {
  currentUser: UserSession;
  studentData: Student | null;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onLogout: () => void;
  isOnline: boolean;
  activeParty?: ActiveParty | null;
  onOpenPartyModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  studentData,
  activeNav,
  setActiveNav,
  onLogout,
  isOnline,
  activeParty,
  onOpenPartyModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#120a2e]/90 backdrop-blur-md border-b border-purple-800/40 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-lg flex items-center justify-center">
              <span className="text-xl">🏰</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  6B 梦幻家园
                </h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                  isOnline 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' 
                    : 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                }`}>
                  <Wifi size={10} className={isOnline ? 'animate-pulse' : ''} />
                  {isOnline ? '实时同步' : '本地离线'}
                </span>
              </div>
              <p className="text-[10px] text-purple-300/60 font-medium">班级数字岛屿与积分激励系统</p>
            </div>
          </div>

          {/* Mobile logout */}
          <button
            onClick={onLogout}
            className="md:hidden p-2 rounded-xl bg-purple-900/40 hover:bg-rose-900/60 text-purple-200 transition"
            title="退出登录"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Navigation Tabs (for students) */}
        {!currentUser.isTeacher && (
          <nav className="flex items-center gap-1 bg-[#1a0f3b] p-1 rounded-2xl border border-purple-800/50 w-full md:w-auto justify-center overflow-x-auto">
            <button
              onClick={() => setActiveNav('island')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeNav === 'island'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <Home size={14} />
              我的小岛
            </button>
            <button
              onClick={() => setActiveNav('shop')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeNav === 'shop'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <ShoppingBag size={14} />
              积分商城
            </button>

            {/* Party Tab / Modal Trigger */}
            <button
              onClick={onOpenPartyModal}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
                activeParty
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white animate-pulse shadow-lg'
                  : 'bg-purple-900/40 text-pink-300 hover:text-white hover:bg-purple-800/50'
              }`}
            >
              <PartyPopper size={14} />
              <span>{activeParty ? '🥳 派对热播中' : '举办派对'}</span>
            </button>

            <button
              onClick={() => setActiveNav('leaderboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeNav === 'leaderboard' || activeNav === 'checkin'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <Trophy size={14} className="text-amber-400" />
              6B排行榜
            </button>
            <button
              onClick={() => setActiveNav('social')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
                activeNav === 'social'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <Gift size={14} />
              <span>同学互赠/榜单</span>
              {studentData?.receivedFlowers && studentData.receivedFlowers.length > 0 && (
                <span className="bg-pink-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                  {studentData.receivedFlowers.length}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* User Stats / Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {currentUser.isTeacher ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300">
              <Shield size={16} className="text-amber-400" />
              教师管理模式 ({currentUser.name})
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-[#1a0f3b] border border-purple-800/50 px-3 py-1.5 rounded-2xl">
              <div className="flex items-center gap-1.5 bg-[#251552] px-2.5 py-1 rounded-xl border border-amber-500/30 text-xs font-black text-amber-300">
                <span>🪙</span>
                <span>{studentData?.coins || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#251552] px-2.5 py-1 rounded-xl border border-pink-500/30 text-xs font-black text-pink-300">
                <span>🌸</span>
                <span>{studentData?.flowers || 0}</span>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-purple-950/60 hover:bg-rose-950/80 border border-purple-800/50 hover:border-rose-700/60 text-purple-200 px-3 py-2 rounded-xl transition"
          >
            <LogOut size={14} />
            <span>退出</span>
          </button>
        </div>
      </div>
    </header>
  );
};
