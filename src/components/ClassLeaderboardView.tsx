import React, { useState } from 'react';
import { Student } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, Dices, Info, HelpCircle, X } from 'lucide-react';

interface ClassLeaderboardViewProps {
  currentStudent: Student;
  allStudents: Student[];
  onCheckIn?: (coins: number, flowers: number, exp: number) => void;
  onUpdateStudentData?: (studentId: number, update: Partial<Student>) => void;
}

// Exactly 3 Lucky Draw Prizes as requested: 20个印章, 文具, 神秘礼物
export const LUCKY_PRIZES = [
  { id: 1, name: '💮 20个印章', type: 'stamps', amount: 20, icon: '💮', color: 'from-rose-500 via-pink-500 to-rose-600', desc: '恭喜获得 20 个印章奖励！' },
  { id: 2, name: '✏️ 精美文具礼盒', type: 'item', amount: 1, icon: '✏️', color: 'from-blue-500 via-indigo-500 to-purple-600', desc: '包含 6B 专属水笔、笔记本与尺具文具礼盒！' },
  { id: 3, name: '🎁 神秘礼物大礼包', type: 'item', amount: 1, icon: '🎁', color: 'from-amber-500 via-rose-500 to-pink-600', desc: '班主任特供神秘惊喜超级大礼！' },
];

export const ClassLeaderboardView: React.FC<ClassLeaderboardViewProps> = ({
  currentStudent,
  allStudents,
  onUpdateStudentData,
}) => {
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [targetDrawStudent, setTargetDrawStudent] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activePrizeIndex, setActivePrizeIndex] = useState<number | null>(null);
  const [wonPrize, setWonPrize] = useState<typeof LUCKY_PRIZES[0] | null>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenDrawModal = (student: Student) => {
    setTargetDrawStudent(student);
    setIsDrawModalOpen(true);
    setWonPrize(null);
  };

  // Calculate scores for each student
  const calculatedLeaderboard = allStudents.map((student) => {
    const footballPts = student.footballHighScore || 0;
    const flowerPts = (student.flowers || 0) * 20;
    const coinPts = (student.coins || 0) * 2;
    const assetPts = ((student.unlocked || []).length * 50) + ((student.petExp || 0) * 2);
    
    // Total & Average
    const totalPoints = footballPts + flowerPts + coinPts + assetPts;
    const avgScore = Math.round(totalPoints / 4);

    return {
      student,
      footballPts,
      flowerPts,
      coinPts,
      assetPts,
      totalPoints,
      avgScore,
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  // Find current student's rank
  const currentRankIndex = calculatedLeaderboard.findIndex((item) => item.student.id === currentStudent.id);
  const currentRank = currentRankIndex !== -1 ? currentRankIndex + 1 : 99;

  // Perform Random Lucky Draw among the 3 prizes
  const handleStartDraw = () => {
    if (isSpinning) return;

    const recipient = targetDrawStudent || currentStudent;

    setIsSpinning(true);
    setWonPrize(null);

    // Random choice among the 3 prizes
    const prizeIndex = Math.floor(Math.random() * LUCKY_PRIZES.length);
    const selectedPrize = LUCKY_PRIZES[prizeIndex];

    let current = 0;
    let rounds = 0;
    const totalSteps = 12 + prizeIndex;
    let speed = 90;

    const spinInterval = setInterval(() => {
      setActivePrizeIndex(current % LUCKY_PRIZES.length);
      current++;
      rounds++;

      if (rounds >= totalSteps) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setActivePrizeIndex(prizeIndex);
        setWonPrize(selectedPrize);

        // Apply reward to recipient student
        if (onUpdateStudentData && recipient) {
          const newRewards = [...(recipient.drawRewards || []), selectedPrize.name];
          const updateObj: Partial<Student> = {
            drawRewards: newRewards,
            lastDrawDate: todayStr,
          };

          if (selectedPrize.type === 'stamps') {
            updateObj.stamps = (recipient.stamps || 0) + selectedPrize.amount;
          }

          onUpdateStudentData(recipient.id, updateObj);
        }

        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
        });
      }
    }, speed);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Leaderboard Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-amber-900/90 border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-0.5 shadow-xl flex items-center justify-center text-3xl shrink-0">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">6B 班级风云排行榜</h2>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                综合评分实况
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
              结合【⚽足球分数】+【🌸鲜花】+【🪙金币】+【🏰小岛资产】加权计算全班平均综合分！第一至第三名专享【幸运抽奖】！
            </p>
          </div>
        </div>

        {/* Header Control Buttons */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="px-4 py-2.5 rounded-2xl bg-purple-900/60 border border-purple-700/50 hover:bg-purple-800 text-purple-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <HelpCircle size={16} />
            <span>算分规则</span>
          </button>
        </div>
      </div>

      {/* Formula Explanation Card */}
      {showFormulaInfo && (
        <div className="bg-[#180e38] border border-purple-700/60 rounded-2xl p-4 text-xs space-y-2 animate-fade-in text-purple-200">
          <div className="font-bold text-white flex items-center gap-1.5 text-sm">
            <Info size={16} className="text-amber-400" />
            <span>6B 班级综合平均分计算公式说明：</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div className="bg-[#12082b] p-2.5 rounded-xl border border-purple-900">
              <span className="font-bold text-emerald-300">⚽ 足球得分</span> = 足球高分记录
            </div>
            <div className="bg-[#12082b] p-2.5 rounded-xl border border-purple-900">
              <span className="font-bold text-pink-300">🌸 鲜花得分</span> = 拥有鲜花数 × 20分
            </div>
            <div className="bg-[#12082b] p-2.5 rounded-xl border border-purple-900">
              <span className="font-bold text-amber-300">🪙 金币得分</span> = 金币总数 × 2分
            </div>
            <div className="bg-[#12082b] p-2.5 rounded-xl border border-purple-900">
              <span className="font-bold text-cyan-300">🏰 资产得分</span> = (解锁设施数×50分) + (宠物EXP×2分)
            </div>
          </div>
          <p className="text-[11px] text-purple-300/70 pt-1 font-mono">
            <strong>综合评分 (平均分)</strong> = (足球得分 + 鲜花得分 + 金币得分 + 资产得分) / 4
          </p>
        </div>
      )}

      {/* Student Personal Rank Card Banner */}
      <div className="bg-[#160b33] border border-purple-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-900/80 border border-purple-600/50 flex items-center justify-center text-2xl">
            {currentStudent.equipped?.avatar || '👦'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base">{currentStudent.name}</span>
              <span className="bg-pink-950 text-pink-300 border border-pink-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                我的实时排名
              </span>
            </div>
            <p className="text-xs text-purple-300/80 mt-0.5 font-mono">
              获得抽奖奖励: <strong className="text-pink-300">{(currentStudent.drawRewards || []).length}</strong> 次
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[10px] text-purple-300/70 block">当前全班排名</span>
            <span className={`text-xl font-black font-mono ${
              currentRank === 1 ? 'text-amber-400' : currentRank === 2 ? 'text-slate-300' : currentRank === 3 ? 'text-amber-600' : 'text-purple-200'
            }`}>
              {currentRank === 1 ? '🥇 第 1 名' : currentRank === 2 ? '🥈 第 2 名' : currentRank === 3 ? '🥉 第 3 名' : `第 ${currentRank} 名`}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-purple-300/70 block">综合平均分</span>
            <span className="text-xl font-black font-mono text-amber-300">
              {calculatedLeaderboard[currentRankIndex]?.avgScore || 0} 分
            </span>
          </div>
        </div>
      </div>

      {/* Full Class Leaderboard List */}
      <div className="bg-[#140a2d] border border-purple-800/60 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" />
            <span>6B 班级风云全景排行榜 (共 {calculatedLeaderboard.length} 人)</span>
          </h3>
          <span className="text-xs text-purple-300/60 font-mono">第一至第三名专享【幸运抽奖】</span>
        </div>

        <div className="space-y-3">
          {calculatedLeaderboard.map((item, index) => {
            const rank = index + 1;
            const isMe = item.student.id === currentStudent.id;
            const isTop3Rank = rank <= 3;

            return (
              <div
                key={item.student.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isMe
                    ? 'bg-gradient-to-r from-purple-900/90 via-pink-900/60 to-purple-900/90 border-pink-500/70 shadow-lg ring-1 ring-pink-500/50'
                    : isTop3Rank
                    ? 'bg-[#1b0e3e] border-amber-500/40 hover:border-amber-400/70'
                    : 'bg-[#110729] border-purple-900/50 hover:border-purple-700/50'
                }`}
              >
                {/* Left Rank & Student Info */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  {/* Rank Badge */}
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 font-mono">
                    {rank === 1 ? (
                      <span className="text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-2xl drop-shadow-[0_0_10px_rgba(203,213,225,0.8)]">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-2xl drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]">🥉</span>
                    ) : (
                      <span className="text-purple-400 text-sm">{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-700/50 flex items-center justify-center text-xl shrink-0">
                    {item.student.equipped?.avatar || '👦'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{item.student.name}</span>
                      {isMe && (
                        <span className="bg-pink-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md">
                          我
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto text-xs">
                  <div className="bg-[#12072a] px-3 py-1.5 rounded-xl border border-purple-900/60 flex items-center justify-between gap-2">
                    <span className="text-purple-300/80">⚽ 足球:</span>
                    <strong className="text-emerald-400 font-mono">{item.footballPts}</strong>
                  </div>

                  <div className="bg-[#12072a] px-3 py-1.5 rounded-xl border border-purple-900/60 flex items-center justify-between gap-2">
                    <span className="text-purple-300/80">🌸 鲜花:</span>
                    <strong className="text-pink-400 font-mono">{item.flowerPts}</strong>
                  </div>

                  <div className="bg-[#12072a] px-3 py-1.5 rounded-xl border border-purple-900/60 flex items-center justify-between gap-2">
                    <span className="text-purple-300/80">🪙 金币:</span>
                    <strong className="text-amber-300 font-mono">{item.coinPts}</strong>
                  </div>

                  <div className="bg-[#12072a] px-3 py-1.5 rounded-xl border border-purple-900/60 flex items-center justify-between gap-2">
                    <span className="text-purple-300/80">🏰 资产:</span>
                    <strong className="text-cyan-300 font-mono">{item.assetPts}</strong>
                  </div>
                </div>

                {/* Total Average Score & Lucky Draw Button for Top 3 */}
                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 border-purple-800/40 pt-2 md:pt-0">
                  <div className="text-right">
                    <span className="text-[10px] text-purple-300/70 block">综合平均分</span>
                    <span className="text-lg font-black font-mono text-amber-300">
                      {item.avgScore} <span className="text-xs text-purple-300 font-normal">分</span>
                    </span>
                  </div>

                  {/* Rank 1, 2, and 3 ALL have the Lucky Draw Button */}
                  {isTop3Rank && (
                    <div className="shrink-0">
                      <button
                        onClick={() => handleOpenDrawModal(item.student)}
                        className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 hover:from-amber-300 hover:to-pink-400 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg transition hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer border border-amber-300 animate-pulse"
                      >
                        <Dices size={16} />
                        <span>幸运抽奖</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Lucky Draw Modal (Strictly 3 Prizes Random Draw) */}
      {isDrawModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#13082b] border border-amber-500/50 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto relative animate-fade-in">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-900/90 via-pink-900/90 to-purple-900/90 p-5 border-b border-amber-500/40 flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 p-0.5 shadow-lg flex items-center justify-center text-2xl">
                  🎁
                </div>
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span>Top 3 专属幸运大抽奖</span>
                    {targetDrawStudent && (
                      <span className="text-xs bg-amber-500/30 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-lg font-normal">
                        为 {targetDrawStudent.name} 抽奖
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    排名全班前 3 名尊享！点击一键随机抽取三大经典奖项！
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawModalOpen(false)}
                disabled={isSpinning}
                className="w-9 h-9 rounded-full bg-purple-900/60 border border-purple-600/50 hover:bg-purple-800 text-purple-200 flex items-center justify-center cursor-pointer transition disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lucky Draw Showcase Cards - Strictly 3 Prizes */}
            <div className="p-6 space-y-6">
              
              <div className="text-center text-xs text-purple-200/80">
                系统将在以下三种顶级大奖中进行随机抽选：
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LUCKY_PRIZES.map((prize, idx) => {
                  const isActive = activePrizeIndex === idx;
                  const isWon = wonPrize?.id === prize.id;

                  return (
                    <div
                      key={prize.id}
                      className={`p-4 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-between relative ${
                        isActive || isWon
                          ? 'bg-gradient-to-b from-amber-400 via-pink-500 to-purple-600 border-white text-white scale-105 shadow-2xl ring-4 ring-amber-300 z-10'
                          : 'bg-[#1c0f3d] border-purple-800/50 text-purple-200'
                      }`}
                    >
                      <div className="text-4xl my-2">{prize.icon}</div>
                      <span className="text-xs font-black leading-tight">
                        {prize.name}
                      </span>
                      <p className="text-[10px] text-purple-200/80 mt-1.5 leading-relaxed">
                        {prize.desc}
                      </p>

                      {(isActive || isWon) && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-300 text-purple-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow animate-bounce">
                          {isWon ? '🎉 中奖！' : '✨ 抽中...'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Won Prize Result Display */}
              {wonPrize && (
                <div className="bg-gradient-to-r from-amber-950/90 via-pink-950/90 to-purple-950/90 border border-amber-500/60 p-4 rounded-2xl text-center animate-fade-in space-y-1 shadow-lg">
                  <div className="text-amber-300 font-black text-base flex items-center justify-center gap-2">
                    <span>🎉 恭喜抽中：{wonPrize.name}！</span>
                  </div>
                  <p className="text-xs text-pink-200">{wonPrize.desc}</p>
                </div>
              )}

              {/* Spin Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartDraw}
                  disabled={isSpinning}
                  className="w-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 hover:from-amber-300 hover:to-pink-400 text-white font-black text-base py-3.5 rounded-2xl shadow-xl transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-amber-300 disabled:opacity-50"
                >
                  <Dices size={22} className={isSpinning ? 'animate-spin' : ''} />
                  <span>{isSpinning ? '光速随机抽取中...' : wonPrize ? '再次随机抽奖 🎲' : '开始随机抽奖 🎰'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

const CrownIcon = () => (
  <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
  </svg>
);
