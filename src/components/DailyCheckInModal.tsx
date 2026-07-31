import React, { useState } from 'react';
import { Student } from '../types';
import confetti from 'canvas-confetti';
import { Calendar, CheckCircle2, Award, Flame, Sparkles, Star } from 'lucide-react';

interface DailyCheckInModalProps {
  student: Student;
  onCheckIn: (earnedCoins: number, earnedFlowers: number, earnedExp: number) => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  student,
  onCheckIn,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = student.lastCheckIn === todayStr;
  const currentStreak = student.streak || 0;

  const [completedQuests, setCompletedQuests] = useState<number[]>([]);

  const quests = [
    { id: 1, title: '准时上学，不迟到不早退', rewardCoins: 10, rewardExp: 20, icon: '⏰' },
    { id: 2, title: '课堂发言积极，思维活跃', rewardCoins: 15, rewardExp: 30, icon: '🙋‍♂️' },
    { id: 3, title: '作业书写工整，按时交齐', rewardCoins: 20, rewardExp: 40, icon: '📚' },
    { id: 4, title: '爱护班级卫生，乐于助人', rewardCoins: 15, rewardExp: 25, icon: '🧹' },
    { id: 5, title: '坚持自主课外阅读30分钟', rewardCoins: 20, rewardExp: 30, icon: '📖' },
  ];

  const handleDoCheckIn = () => {
    if (hasCheckedInToday) return;

    // Base reward + streak bonus
    const bonusCoins = 20 + Math.min(currentStreak * 5, 30);
    const bonusFlowers = 0;
    const bonusExp = 50;

    onCheckIn(bonusCoins, bonusFlowers, bonusExp);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleClaimQuest = (quest: typeof quests[0]) => {
    if (completedQuests.includes(quest.id)) return;
    setCompletedQuests([...completedQuests, quest.id]);
    onCheckIn(quest.rewardCoins, 0, quest.rewardExp);

    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="bg-[#140b2e]/90 border border-purple-800/50 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Daily Check-in Card Banner */}
      <div className="bg-gradient-to-r from-purple-900/80 via-pink-900/60 to-indigo-900/80 border border-purple-700/50 rounded-3xl p-6 text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-2 right-4 text-purple-300/30 text-xs font-mono flex items-center gap-1">
          <Calendar size={14} /> Today: {todayStr}
        </div>

        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-pink-500 p-0.5 mx-auto mb-3 shadow-xl flex items-center justify-center text-3xl">
          🗓️
        </div>

        <h2 className="text-2xl font-black text-white">每日打卡签到</h2>
        <p className="text-xs text-purple-200/80 mt-1 max-w-md mx-auto">
          每天打卡领取金币与宠物经验，保持连续打卡可获得更多奖励！(鲜花需前往【梦幻花园】种植)
        </p>

        {/* Streak Counter Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#12082b] border border-amber-500/40 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold my-4 shadow">
          <Flame size={16} className="text-amber-400 animate-bounce" />
          <span>连续签到 {currentStreak} 天</span>
        </div>

        {/* Big Check In Action Button */}
        <div>
          {hasCheckedInToday ? (
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold px-6 py-3 rounded-2xl shadow">
              <CheckCircle2 size={18} />
              <span>今日已完成签到 (+20金币已领取)</span>
            </div>
          ) : (
            <button
              onClick={handleDoCheckIn}
              className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-xl transition hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Sparkles size={18} />
              <span>立即打卡 (领取 +20金币 +50EXP)</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily Quests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
          <h3 className="font-black text-base text-white flex items-center gap-2">
            <Award size={18} className="text-amber-400" />
            6B 每日良好习惯挑战
          </h3>
          <span className="text-xs text-purple-300/60 font-medium">每天独立完成打卡即可领赏</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quests.map((quest) => {
            const isCompleted = completedQuests.includes(quest.id);
            return (
              <div
                key={quest.id}
                className={`bg-[#180e3a] border rounded-2xl p-4 flex items-center justify-between gap-3 transition ${
                  isCompleted
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-purple-800/50 hover:border-purple-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-[#12082d] rounded-2xl border border-purple-800/40">
                    {quest.icon}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-white">{quest.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono font-bold">
                      <span className="text-amber-400">🪙 +{quest.rewardCoins}</span>
                      <span className="text-purple-300">🐾 +{quest.rewardExp} EXP</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleClaimQuest(quest)}
                  disabled={isCompleted}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shadow transition whitespace-nowrap ${
                    isCompleted
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white cursor-pointer'
                  }`}
                >
                  {isCompleted ? '已打卡' : '打卡打标'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
