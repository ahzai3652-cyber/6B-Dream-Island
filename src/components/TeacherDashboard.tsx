import React, { useState } from 'react';
import { Student } from '../types';
import { 
  Shield, Plus, Minus, RefreshCw, Search, Users, Coins, Heart, Sparkles, Filter, Lock, Award
} from 'lucide-react';

interface TeacherDashboardProps {
  studentsList: Student[];
  onUpdateCoins: (studentId: number, delta: number) => void;
  onUpdateFlowers: (studentId: number, delta: number) => void;
  onBatchAddCoins: (delta: number) => void;
  onBatchAddFlowers: (delta: number) => void;
  onResetAll: () => void;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  studentsList,
  onUpdateCoins,
  onUpdateFlowers,
  onBatchAddCoins,
  onBatchAddFlowers,
  onResetAll,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'id' | 'coins' | 'flowers' | 'petExp'>('id');
  const [customCoinChange, setCustomCoinChange] = useState<number>(10);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmCode, setResetConfirmCode] = useState('');
  const [batchActionMsg, setBatchActionMsg] = useState<string | null>(null);

  // Statistics
  const totalStudents = studentsList.length;
  const totalCoins = studentsList.reduce((acc, s) => acc + (s.coins || 0), 0);
  const totalFlowers = studentsList.reduce((acc, s) => acc + (s.flowers || 0), 0);
  const avgCoins = totalStudents ? Math.round(totalCoins / totalStudents) : 0;

  // Filtered & sorted student list
  const filteredStudents = studentsList.filter((s) => {
    const query = searchQuery.trim().toLowerCase();
    return s.name.toLowerCase().includes(query) || s.id.toString() === query || `#${s.id}` === query;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortField === 'coins') return (b.coins || 0) - (a.coins || 0);
    if (sortField === 'flowers') return (b.flowers || 0) - (a.flowers || 0);
    if (sortField === 'petExp') return (b.petExp || 0) - (a.petExp || 0);
    return a.id - b.id;
  });

  const triggerBatchMsg = (msg: string) => {
    setBatchActionMsg(msg);
    setTimeout(() => setBatchActionMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Top Header Bar */}
      <div className="bg-[#140b2e]/90 border border-purple-800/50 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg flex items-center justify-center text-white font-bold">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              教师管理控制台
              <span className="text-xs font-normal text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                6B 班主控面板
              </span>
            </h1>
            <p className="text-xs text-purple-300/70 mt-0.5">
              全班 37 位同学数值实时调控、奖惩管理与一键同步
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex-1 md:flex-none bg-rose-900/80 hover:bg-rose-800 border border-rose-600/60 text-rose-200 font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg transition"
          >
            <RefreshCw size={14} /> 一键重置全班归零
          </button>
        </div>
      </div>

      {/* Class Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#180e3a]/90 border border-purple-800/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-purple-900/50 rounded-xl text-purple-300">
            <Users size={20} />
          </div>
          <div>
            <div className="text-[11px] text-purple-300/70 font-semibold">全班人数</div>
            <div className="text-xl font-black text-white font-mono">{totalStudents} 人</div>
          </div>
        </div>

        <div className="bg-[#180e3a]/90 border border-purple-800/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-900/50 rounded-xl text-amber-300">
            <Coins size={20} />
          </div>
          <div>
            <div className="text-[11px] text-purple-300/70 font-semibold">金币流通总量</div>
            <div className="text-xl font-black text-amber-300 font-mono">🪙 {totalCoins}</div>
          </div>
        </div>

        <div className="bg-[#180e3a]/90 border border-purple-800/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-pink-900/50 rounded-xl text-pink-300">
            <Heart size={20} />
          </div>
          <div>
            <div className="text-[11px] text-purple-300/70 font-semibold">全班鲜花总量</div>
            <div className="text-xl font-black text-pink-300 font-mono">🌸 {totalFlowers}</div>
          </div>
        </div>

        <div className="bg-[#180e3a]/90 border border-purple-800/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-indigo-900/50 rounded-xl text-indigo-300">
            <Award size={20} />
          </div>
          <div>
            <div className="text-[11px] text-purple-300/70 font-semibold">人均金币储备</div>
            <div className="text-xl font-black text-indigo-200 font-mono">🪙 {avgCoins}</div>
          </div>
        </div>
      </div>

      {/* Quick Batch Actions & Custom Controls */}
      <div className="bg-[#140b2e]/90 border border-purple-800/50 rounded-3xl p-5 shadow-2xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center justify-between border-b border-purple-800/40 pb-2">
          <span className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" /> 全班快捷调整与奖励快捷调控
          </span>
          {batchActionMsg && (
            <span className="text-xs font-bold text-emerald-400 animate-pulse">
              {batchActionMsg}
            </span>
          )}
        </h3>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Quick Adjustment Stepper */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-purple-200">每次调节档位：</span>
            {[5, 10, 20, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => setCustomCoinChange(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  customCoinChange === val
                    ? 'bg-amber-500 border-amber-300 text-black shadow'
                    : 'bg-[#1e123d] border-purple-800/60 text-purple-300 hover:text-white'
                }`}
              >
                {val} 金币
              </button>
            ))}
          </div>

          {/* Batch Rewards */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onBatchAddCoins(10);
                triggerBatchMsg('已为全班每位同学发放 +10 金币！');
              }}
              className="bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-200 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow"
            >
              全班 +10金币 🪙
            </button>
            <button
              onClick={() => {
                onBatchAddCoins(50);
                triggerBatchMsg('已为全班每位同学发放 +50 金币！');
              }}
              className="bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-200 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow"
            >
              全班 +50金币 🪙
            </button>
            <button
              onClick={() => {
                onBatchAddFlowers(1);
                triggerBatchMsg('已为全班每位同学发放 +1 朵鲜花！');
              }}
              className="bg-pink-900/80 hover:bg-pink-800 border border-pink-500/50 text-pink-200 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow"
            >
              全班 +1鲜花 🌸
            </button>
          </div>
        </div>
      </div>

      {/* Student List Table & Search/Sort Toolbar */}
      <div className="bg-[#140b2e]/90 border border-purple-800/50 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-purple-800/40 pb-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索名字或编号 (如 阿言 或 1)..."
              className="w-full bg-[#100726] border border-purple-800/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-purple-400/50 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs font-bold">
            <span className="text-purple-300/60 text-[11px] flex items-center gap-1">
              <Filter size={12} /> 排序:
            </span>
            <button
              onClick={() => setSortField('id')}
              className={`px-3 py-1.5 rounded-xl transition ${
                sortField === 'id' ? 'bg-purple-600 text-white' : 'bg-[#1b103c] text-purple-300/70 hover:text-white'
              }`}
            >
              编号
            </button>
            <button
              onClick={() => setSortField('coins')}
              className={`px-3 py-1.5 rounded-xl transition ${
                sortField === 'coins' ? 'bg-amber-600 text-white' : 'bg-[#1b103c] text-purple-300/70 hover:text-white'
              }`}
            >
              金币榜
            </button>
            <button
              onClick={() => setSortField('flowers')}
              className={`px-3 py-1.5 rounded-xl transition ${
                sortField === 'flowers' ? 'bg-pink-600 text-white' : 'bg-[#1b103c] text-purple-300/70 hover:text-white'
              }`}
            >
              鲜花榜
            </button>
            <button
              onClick={() => setSortField('petExp')}
              className={`px-3 py-1.5 rounded-xl transition ${
                sortField === 'petExp' ? 'bg-indigo-600 text-white' : 'bg-[#1b103c] text-purple-300/70 hover:text-white'
              }`}
            >
              守护兽EXP
            </button>
          </div>
        </div>

        {/* Realtime Students Table */}
        <div className="overflow-x-auto rounded-2xl border border-purple-900/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1c0f42] text-purple-300 text-xs border-b border-purple-800/60">
                <th className="p-3.5">学号</th>
                <th className="p-3.5">姓名与形象</th>
                <th className="p-3.5">当前金币</th>
                <th className="p-3.5">鲜花</th>
                <th className="p-3.5">守护兽EXP</th>
                <th className="p-3.5">已装备套件</th>
                <th className="p-3.5 text-center">快捷调控金币/鲜花</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30 text-xs">
              {sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-[#180e36]/70 transition">
                  <td className="p-3.5 text-purple-400 font-mono font-bold">#{student.id}</td>
                  <td className="p-3.5 font-bold text-gray-100 flex items-center gap-2">
                    <span className="text-xl p-1 bg-[#12082e] rounded-xl border border-purple-800/40">
                      {student.equipped?.avatar || '👤'}
                    </span>
                    <span>{student.name}</span>
                  </td>
                  <td className="p-3.5 font-bold text-amber-300 font-mono text-sm">
                    🪙 {student.coins || 0}
                  </td>
                  <td className="p-3.5 font-bold text-pink-300 font-mono text-sm">
                    🌸 {student.flowers || 0}
                  </td>
                  <td className="p-3.5 font-bold text-purple-300 font-mono">
                    🐾 {student.petExp || 0}
                  </td>
                  <td className="p-3.5 text-base space-x-1">
                    <span>{student.equipped?.house}</span>
                    <span>{student.equipped?.vehicle}</span>
                    <span>{student.equipped?.facility}</span>
                    <span>{student.equipped?.pet}</span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onUpdateCoins(student.id, customCoinChange)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow"
                        title={`加 ${customCoinChange} 金币`}
                      >
                        <Plus size={12} /> {customCoinChange}G
                      </button>
                      <button
                        onClick={() => onUpdateCoins(student.id, -customCoinChange)}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow"
                        title={`扣 ${customCoinChange} 金币`}
                      >
                        <Minus size={12} /> {customCoinChange}G
                      </button>
                      <button
                        onClick={() => onUpdateFlowers(student.id, 1)}
                        className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow"
                        title="加 1 朵鲜花"
                      >
                        +1🌸
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Reset Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#180e38] border border-rose-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-rose-950 border border-rose-500/50 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              <Lock />
            </div>

            <h3 className="font-black text-xl text-white">确认同步重置全班数据？</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              此操作会将 37 位同学的金币、鲜花、经验清零，重置为“初始全空 / 白手起家”状态，并同步到所有同学屏幕！
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-purple-900/50 hover:bg-purple-800 text-purple-200 py-3 rounded-2xl font-bold text-xs"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onResetAll();
                  setShowResetConfirm(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-2xl font-bold text-xs shadow-lg"
              >
                确认彻底重置归零
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
