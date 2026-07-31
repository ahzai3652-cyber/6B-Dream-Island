import React, { useState } from 'react';
import { Student } from '../types';
import confetti from 'canvas-confetti';
import { X, Droplets, Sparkles, Flower2, Heart, Lock, Trophy, RefreshCw } from 'lucide-react';

interface DreamGardenModalProps {
  student: Student;
  allStudents: Student[];
  onClose: () => void;
  onWaterPlant: (studentId: number, costCoins: number, newProgress: number) => void;
  onHarvestFlower: (studentId: number, newFlowerType: string) => void;
}

const FLOWER_TYPES = [
  { icon: '🌷', name: '浪漫郁金香' },
  { icon: '🌸', name: '娇艳樱花' },
  { icon: '🌻', name: '阳光向日葵' },
  { icon: '🌹', name: '炽热玫瑰' },
  { icon: '🌺', name: '盛夏扶桑' },
];

export const DreamGardenModal: React.FC<DreamGardenModalProps> = ({
  student,
  allStudents,
  onClose,
  onWaterPlant,
  onHarvestFlower,
}) => {
  const currentProgress = student.gardenProgress || 0;
  const currentFlowerIcon = student.gardenFlowerType || '🌷';
  const currentFlowerObj = FLOWER_TYPES.find((f) => f.icon === currentFlowerIcon) || FLOWER_TYPES[0];

  const [isWateringAnim, setIsWateringAnim] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const WATER_COST = 15; // 15 coins per watering
  const WATER_BOOST = 20; // +20% growth per watering

  // Calculate current plant stage
  const getStageInfo = (progress: number) => {
    if (progress >= 100) {
      return {
        stageName: '盛开可采摘',
        icon: currentFlowerObj.icon,
        desc: `【${currentFlowerObj.name}】已完全盛开！快来采摘送给老师或同学吧！`,
        color: 'from-pink-500 to-rose-500',
      };
    } else if (progress >= 75) {
      return {
        stageName: '花苞初绽',
        icon: '🪻',
        desc: '花苞含苞待放，再浇水几次就能繁花盛开啦！',
        color: 'from-purple-500 to-pink-500',
      };
    } else if (progress >= 40) {
      return {
        stageName: '茁壮生长',
        icon: '🪴',
        desc: '小树苗汲取足了水分，正在茁壮拔高！',
        color: 'from-teal-500 to-emerald-500',
      };
    } else if (progress >= 15) {
      return {
        stageName: '嫩芽破土',
        icon: '🌿',
        desc: '绿油油的幼嫩小芽钻出了泥土！',
        color: 'from-emerald-600 to-teal-600',
      };
    } else {
      return {
        stageName: '神秘种子',
        icon: '🌱',
        desc: '刚刚埋入泥土的花种，需要甘甜的河水润泽~',
        color: 'from-amber-600 to-emerald-600',
      };
    }
  };

  const stage = getStageInfo(currentProgress);

  // Handle Watering
  const handleWater = () => {
    if (currentProgress >= 100) {
      setFeedbackMsg('🌸 鲜花已经盛开啦，快点击【采摘鲜花】吧！');
      return;
    }

    if ((student.coins || 0) < WATER_COST) {
      setFeedbackMsg(`🪙 金币不足！浇水需要 ${WATER_COST} 金币，快去打卡或完成日常任务赚金币吧！`);
      return;
    }

    setIsWateringAnim(true);
    setFeedbackMsg(null);

    const newProgress = Math.min(100, currentProgress + WATER_BOOST);
    onWaterPlant(student.id, WATER_COST, newProgress);

    if (newProgress >= 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setFeedbackMsg(`🎉 恭喜！【${currentFlowerObj.name}】在你的精心呵护下盛开啦！`);
    } else {
      setFeedbackMsg(`🚿 浇水成功！生长进度 +${WATER_BOOST}%`);
    }

    setTimeout(() => {
      setIsWateringAnim(false);
    }, 600);
  };

  // Handle Harvesting
  const handleHarvest = () => {
    if (currentProgress < 100) return;

    // Pick a random new flower for the next cycle
    const nextFlower = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)].icon;

    onHarvestFlower(student.id, nextFlower);

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
    });

    setFeedbackMsg(`💐 成功采摘 1 朵【${currentFlowerObj.name}】！鲜花库存 +1 🌸`);
  };

  // Sort students by total flowers for garden ranking
  const topGardeners = [...allStudents].sort((a, b) => (b.flowers || 0) - (a.flowers || 0)).slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#12092b] border border-pink-500/40 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto relative animate-fade-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-900/80 via-purple-900/80 to-emerald-900/80 p-5 border-b border-pink-500/30 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-emerald-400 p-0.5 shadow-lg flex items-center justify-center text-2xl">
              🌷
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>梦幻花园庄园</span>
                <span className="bg-pink-950 border border-pink-500/60 text-pink-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  6B 唯一鲜花产地
                </span>
              </h2>
              <p className="text-xs text-pink-200/80 mt-0.5">花金币买水浇花，培育并采摘鲜花送给老师同学吧！</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-purple-900/60 border border-purple-600/50 hover:bg-purple-800 text-purple-200 flex items-center justify-center cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance Stats Bar */}
        <div className="bg-[#1a0e3d] px-6 py-2.5 border-b border-purple-800/40 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
              🪙 我的金币: <strong className="text-white text-sm">{student.coins || 0}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-pink-300 bg-pink-950/60 px-3 py-1 rounded-full border border-pink-500/30">
              🌸 拥有鲜花: <strong className="text-white text-sm">{student.flowers || 0}</strong> 朵
            </span>
          </div>

          <span className="text-[11px] text-purple-300/70 hidden sm:inline">
            💧 浇水 1 次需 15 金币
          </span>
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-5">
          
          {/* Garden Planting Bed */}
          <div className="bg-gradient-to-b from-[#1c2c30] to-[#121c1f] border border-emerald-500/40 rounded-3xl p-6 relative overflow-hidden text-center shadow-inner">
            {/* Background sparkle accents */}
            <div className="absolute top-3 left-4 text-emerald-400/20 text-2xl">✨</div>
            <div className="absolute top-6 right-6 text-pink-400/20 text-3xl">🌸</div>
            <div className="absolute bottom-4 left-8 text-amber-400/20 text-2xl">🦋</div>

            {/* Stage Title Pill */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold px-4 py-1 rounded-full shadow-md mb-4">
              <Sparkles size={14} className="text-emerald-400" />
              <span>当前阶段: {stage.stageName} ({currentProgress}%)</span>
            </div>

            {/* Plant Container Display */}
            <div className="relative my-4 flex flex-col items-center justify-center">
              {/* Soil / Flower Pot */}
              <div className="relative">
                {/* Plant Icon with Growth scaling and bounce animation */}
                <div
                  className={`text-7xl sm:text-8xl transition-all duration-500 filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)] ${
                    isWateringAnim ? 'scale-125 rotate-6' : 'hover:scale-110'
                  } ${currentProgress >= 100 ? 'animate-bounce' : ''}`}
                >
                  {stage.icon}
                </div>

                {/* Watering droplets effect */}
                {isWateringAnim && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl animate-ping">
                    💦💧
                  </div>
                )}
              </div>

              {/* Soil Mound */}
              <div className="w-36 h-8 bg-gradient-to-r from-amber-950 via-[#3a2012] to-amber-950 rounded-full border border-amber-800/60 shadow-xl -mt-3 -z-0 flex items-center justify-center text-[10px] text-amber-500/60 font-mono">
                🪴 沃土花园
              </div>
            </div>

            {/* Flower Type Name */}
            <h3 className="text-lg font-black text-white mt-2">
              当前种植：<span className="text-pink-300">{currentFlowerObj.name}</span> {currentFlowerObj.icon}
            </h3>
            <p className="text-xs text-emerald-200/80 max-w-md mx-auto mt-1 font-medium">
              {stage.desc}
            </p>

            {/* Progress Bar */}
            <div className="mt-5 max-w-md mx-auto space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-emerald-300">
                <span>🌱 幼苗</span>
                <span>生长进度 {currentProgress}%</span>
                <span>盛开 🌷</span>
              </div>
              <div className="w-full bg-[#0d1618] border border-emerald-500/30 rounded-full h-4 p-0.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-pink-500 h-full rounded-full transition-all duration-500 shadow-md relative overflow-hidden"
                  style={{ width: `${currentProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {currentProgress >= 100 ? (
                <button
                  onClick={handleHarvest}
                  className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-400 hover:to-rose-400 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-2xl transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer border border-pink-300 animate-pulse"
                >
                  <Flower2 size={20} />
                  <span>采摘鲜花 (+1🌸 朵)</span>
                </button>
              ) : (
                <button
                  onClick={handleWater}
                  className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-white font-black text-sm px-8 py-3 rounded-2xl shadow-xl transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer border border-teal-300"
                >
                  <Droplets size={18} className="text-cyan-200" />
                  <span>买水浇花 (消耗 15 🪙 / +20% 进度)</span>
                </button>
              )}
            </div>

            {/* Feedback Message Alert */}
            {feedbackMsg && (
              <div className="mt-4 bg-purple-950/80 border border-purple-500/50 text-purple-200 text-xs font-bold px-4 py-2.5 rounded-xl max-w-md mx-auto animate-fade-in shadow">
                {feedbackMsg}
              </div>
            )}
          </div>

          {/* Leaderboard & Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Garden Rules Card */}
            <div className="bg-[#190d3d] border border-purple-800/50 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                <Heart size={16} className="text-pink-400" />
                <span>梦幻花园规则与用途</span>
              </h4>
              <ul className="text-[11px] text-purple-200/80 space-y-1.5 list-disc list-inside leading-relaxed">
                <li><strong className="text-pink-300">唯一产地</strong>：梦幻花园是班级内唯一获取鲜花的地方。</li>
                <li><strong className="text-amber-300">浇花育种</strong>：花费 15 金币买水浇灌，进度达到 100% 即可采摘 1 朵鲜花。</li>
                <li><strong className="text-emerald-300">鲜花用途</strong>：可用于在【赠花中心】向老师和同学表达谢意，或在【派对房间】与大家互动送礼！</li>
              </ul>
            </div>

            {/* Top Gardeners Leaderboard */}
            <div className="bg-[#190d3d] border border-purple-800/50 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                <Trophy size={16} className="text-amber-400" />
                <span>6B 班级鲜花富豪榜</span>
              </h4>

              <div className="space-y-1.5">
                {topGardeners.map((s, index) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-xs bg-[#12072e] px-3 py-1.5 rounded-xl border border-purple-900/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold w-4 text-center ${
                        index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-purple-400'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-base">{s.equipped?.avatar || '👦'}</span>
                      <span className="font-bold text-white">{s.name}</span>
                    </div>

                    <span className="text-pink-300 font-bold font-mono">
                      🌸 {s.flowers || 0} 朵
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
