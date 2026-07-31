import React, { useState } from 'react';
import { Student } from '../types';
import confetti from 'canvas-confetti';
import { PartyPopper, Sparkles, Utensils, ShoppingBag, MessageSquare, Egg, Lock, Trophy } from 'lucide-react';
import { getPetEggInfo, SHOP_CATEGORIES } from '../data';

interface IslandViewProps {
  student: Student;
  onFeedPet: (expGained: number, costGained: number) => void;
  onOpenShop: () => void;
  onOpenPartyModal?: () => void;
  onOpenFootballModal?: () => void;
  onOpenGardenModal?: () => void;
}

export const IslandView: React.FC<IslandViewProps> = ({
  student,
  onFeedPet,
  onOpenShop,
  onOpenPartyModal,
  onOpenFootballModal,
  onOpenGardenModal,
}) => {
  const [feedMessage, setFeedMessage] = useState<string | null>(null);

  const foods = [
    { name: '新鲜牛奶', icon: '🥛', exp: 10, cost: 10 },
    { name: '香甜苹果', icon: '🍎', exp: 30, cost: 30 },
    { name: '草莓蛋糕', icon: '🍰', exp: 55, cost: 50 },
    { name: '彩虹冰淇淋', icon: '🍦', exp: 120, cost: 100 },
  ];

  // Determine current pet egg & hatching status
  const currentPetIconOrId = student.equipped?.pet || '';
  const hasPet = Boolean(student.equipped?.pet);
  const petEggInfo = getPetEggInfo(currentPetIconOrId, student.petExp || 0);

  // Calculate pet stage based on equipped/bought pet
  let petStage = { title: '🥚 暂无宠物', color: 'text-purple-300/60 font-bold', level: 0 };
  if (hasPet) {
    if (petEggInfo.isHatched) {
      petStage = {
        title: `${petEggInfo.displayIcon} ${petEggInfo.displayName}`,
        color: 'text-pink-300 font-black',
        level: 2,
      };
    } else {
      petStage = {
        title: `🥚 ${petEggInfo.petItem.name} (孵化中)`,
        color: 'text-amber-300 font-bold',
        level: 1,
      };
    }
  }

  const handleTriggerParty = () => {
    if (onOpenPartyModal) {
      onOpenPartyModal();
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleFeed = (food: { name: string; icon: string; exp: number; cost: number }) => {
    if (!hasPet) {
      setFeedMessage(`你还没有宠物哦！请先前往【微型商城】购买领养宠物蛋后再来喂食！`);
      setTimeout(() => setFeedMessage(null), 3000);
      return;
    }

    if (student.coins < food.cost) {
      setFeedMessage(`金币不足！需要 ${food.cost} 金币`);
      setTimeout(() => setFeedMessage(null), 2500);
      return;
    }

    const currentExp = student.petExp || 0;
    const newExp = currentExp + food.exp;
    const isNowHatching = !petEggInfo.isHatched && newExp >= petEggInfo.requiredExp;

    onFeedPet(food.exp, food.cost);

    if (isNowHatching) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 }
      });
      setFeedMessage(`🎉🎉 破壳成功大爆发！！！恭喜！【${petEggInfo.petItem.name}】成功吞噬美食，打破封印破壳为【${petEggInfo.petItem.hatchedName} ${petEggInfo.petItem.hatchedIcon}】！已成功放去你的专属小岛！`);
      setTimeout(() => setFeedMessage(null), 5000);
    } else {
      setFeedMessage(`成功喂食 ${food.icon} ${food.name}！宠物获得 +${food.exp} EXP！`);
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 }
      });
      setTimeout(() => setFeedMessage(null), 2500);
    }
  };

  const hasFootballField = (student.unlocked || []).includes('f1') || student.equipped?.facility === '⚽';
  const hasDreamGarden = (student.unlocked || []).includes('f2') || student.equipped?.facility === '🌷';

  const handleEnterGarden = () => {
    if (!hasDreamGarden) {
      alert('需在商城购买【梦幻花园】才能拥有专属花园种植鲜花哦！');
      return;
    }
    if (onOpenGardenModal) {
      onOpenGardenModal();
    }
  };

  const handleEnterFootball = () => {
    if (!hasFootballField) {
      alert('需在商城购买【足球草场】才能入场踢球哦！');
      return;
    }
    if (onOpenFootballModal) {
      onOpenFootballModal();
    }
  };

  const handleFacilityClick = () => {
    if (student.equipped?.facility === '🌷') {
      handleEnterGarden();
    } else if (student.equipped?.facility === '⚽') {
      handleEnterFootball();
    } else if (hasDreamGarden) {
      handleEnterGarden();
    } else {
      handleEnterFootball();
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Card Header */}
      <div className="bg-[#160d38]/90 border border-purple-800/50 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-xl flex items-center justify-center text-3xl bg-[#12092b]">
              {student.equipped?.avatar || '👧'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{student.name}</h2>
              <span className="bg-purple-900/60 border border-purple-700/50 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                6B班学生
              </span>
            </div>
            <p className="text-xs text-purple-300/70 mt-1 flex items-center gap-2">
              <span className={petStage.color}>{petStage.title}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Dream Garden Button */}
          <button
            onClick={handleEnterGarden}
            className={`flex-1 md:flex-none font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              hasDreamGarden
                ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-emerald-600 hover:from-pink-500 hover:to-emerald-500 text-white border border-pink-400/40'
                : 'bg-purple-900/50 hover:bg-purple-800/60 text-purple-300 border border-purple-700/50'
            }`}
          >
            <span className="text-sm">🌷</span>
            <span>梦幻花园</span>
            {!hasDreamGarden && <Lock size={12} className="text-amber-400 shrink-0" />}
          </button>

          {/* Football Field Button */}
          <button
            onClick={handleEnterFootball}
            className={`flex-1 md:flex-none font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              hasFootballField
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40'
                : 'bg-purple-900/50 hover:bg-purple-800/60 text-purple-300 border border-purple-700/50'
            }`}
          >
            <span className="text-sm">⚽</span>
            <span>足球场</span>
            {!hasFootballField && <Lock size={12} className="text-amber-400 shrink-0" />}
          </button>

          <button
            onClick={handleTriggerParty}
            className="flex-1 md:flex-none bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PartyPopper size={16} />
            举办派对
          </button>

          <button
            onClick={onOpenShop}
            className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag size={16} />
            前往商城
          </button>
        </div>
      </div>

      {/* Received Encouragement Messages Preview Banner */}
      {student.receivedFlowers && student.receivedFlowers.length > 0 && (
        <div className="bg-gradient-to-r from-[#1f0e40] via-[#160b33] to-[#240e3d] border border-pink-500/40 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-pink-300 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-pink-400" />
              <span>最新收到的同窗表达 ({student.receivedFlowers.length} 条)</span>
            </h3>
            <span className="text-[10px] text-purple-300/60 font-mono">
              共收到 🌸 {student.flowers || 0} 朵鲜花
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {[...student.receivedFlowers].reverse().slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="bg-[#100726]/80 border border-purple-800/50 rounded-2xl p-2.5 flex flex-col justify-between space-y-1.5 hover:border-pink-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <span>来自: {item.from}</span>
                  </span>
                  <span className="text-[10px] text-pink-300 font-bold bg-pink-950/60 border border-pink-500/30 px-1.5 py-0.5 rounded-lg font-mono">
                    🌸 +{item.count || 1}
                  </span>
                </div>
                <div className="text-[11px] text-purple-200 bg-[#1a0f3d] px-2.5 py-1 rounded-xl truncate italic border border-purple-800/30">
                  “{item.message}”
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Island Visual Canvas */}
      <div className="relative bg-gradient-to-b from-[#180e3c] via-[#12092b] to-[#0a051a] border border-purple-800/40 rounded-3xl p-6 min-h-[420px] shadow-2xl flex flex-col items-center justify-center overflow-hidden">
        {/* Background Ambient Glow & Particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute top-4 left-6 text-purple-300/40 text-xs font-mono font-bold flex items-center gap-1.5">
          <Sparkles size={14} /> 6B 专属三维浮空岛屿
        </div>

        {/* Floating Island Geometry Container */}
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center my-4">
          {/* Outer Rotating Halo Ring */}
          <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-pink-500/20 animate-[spin_15s_linear_infinite_reverse]" />

          {/* Core Island Base */}
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-b from-purple-900/40 via-indigo-950/70 to-slate-950/90 border-2 border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.25)] flex items-center justify-center relative">
            
            {/* Center Main House */}
            <div
              onClick={() => {
                if (!student.equipped?.house) onOpenShop();
              }}
              className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full border shadow-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer group relative overflow-hidden ${
                (student.equipped?.house === '🏘️' || student.equipped?.house === '🏖️' || student.equipped?.house === '🏛️')
                  ? 'border-cyan-400/60 bg-gradient-to-b from-indigo-950/80 via-blue-950/90 to-cyan-950/90 shadow-[0_0_30px_rgba(6,182,212,0.35)]'
                  : student.equipped?.house
                  ? 'border-pink-400/40 bg-[#0c061d]/90'
                  : 'border-2 border-dashed border-purple-600/40 bg-[#0a0518]/60 hover:border-purple-400'
              }`}
            >
              {student.equipped?.house ? (
                <>
                  <span className="text-6xl sm:text-7xl animate-bounce drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-10">
                    {student.equipped.house}
                  </span>

                  {(student.equipped?.house === '🏘️' || student.equipped?.house === '🏖️' || student.equipped?.house === '🏛️') ? (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-200 font-bold z-10 -mt-1 bg-cyan-950/80 border border-cyan-400/50 px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
                      <span>🌊</span>
                      <span>蔚蓝大海</span>
                      <span>🌊</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-purple-300/70 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      当前房屋
                    </span>
                  )}

                  {/* Ocean Water Floor Effect for Villa */}
                  {(student.equipped?.house === '🏘️' || student.equipped?.house === '🏖️' || student.equipped?.house === '🏛️') && (
                    <div className="absolute bottom-0 inset-x-0 h-11 bg-gradient-to-t from-cyan-500/50 via-blue-600/30 to-transparent flex items-end justify-center pb-1 text-sm tracking-widest pointer-events-none">
                      🌊 🌊 🌊
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2 z-10">
                  <div className="w-10 h-10 rounded-full border border-dashed border-purple-500/40 flex items-center justify-center text-purple-400/40 mb-1 group-hover:border-purple-400 text-xs">
                    —
                  </div>
                  <span className="text-[11px] text-purple-300 font-bold bg-purple-950/80 border border-purple-500/30 px-2.5 py-0.5 rounded-full shadow">
                    空地 (去建造)
                  </span>
                </div>
              )}
            </div>

            {/* Orbiting Elements */}
            {/* Top: Vehicle */}
            <div 
              onClick={() => {
                if (!student.equipped?.vehicle) onOpenShop();
              }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1b0f42] border border-cyan-500/40 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 hover:scale-110 transition cursor-pointer"
            >
              {student.equipped?.vehicle ? (
                <>
                  <span className="text-3xl animate-pulse">{student.equipped.vehicle}</span>
                  <span className="text-[10px] text-cyan-300 font-bold hidden sm:inline">座驾</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-cyan-400/50 font-bold">—</span>
                  <span className="text-[10px] text-cyan-300/60 font-bold hidden sm:inline">未解锁/空</span>
                </>
              )}
            </div>

            {/* Bottom: Facility */}
            <div 
              onClick={() => {
                if (!student.equipped?.facility) {
                  onOpenShop();
                } else {
                  handleFacilityClick();
                }
              }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#1b0f42] border border-amber-500/40 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 hover:scale-110 transition cursor-pointer group"
              title={student.equipped?.facility ? "点击进入岛屿设施" : "前往商城建设设施"}
            >
              {student.equipped?.facility ? (
                <>
                  <span className="text-3xl">{student.equipped.facility}</span>
                  <span className="text-[10px] text-amber-300 font-bold hidden sm:inline flex items-center gap-1">
                    <span>{student.equipped.facility === '🌷' ? '梦幻花园' : '设施'}</span>
                    {student.equipped.facility === '🌷' ? (!hasDreamGarden && <Lock size={10} className="text-amber-400" />) : (!hasFootballField && <Lock size={10} className="text-amber-400" />)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-amber-400/50 font-bold">—</span>
                  <span className="text-[10px] text-amber-300/60 font-bold hidden sm:inline">未解锁/空</span>
                </>
              )}
            </div>

            {/* Right: Pet / Pet Egg */}
            <div 
              onClick={() => {
                if (!hasPet) onOpenShop();
              }}
              className="absolute -right-4 top-1/2 -translate-y-1/2 bg-[#1b0f42] border border-pink-500/40 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 hover:scale-110 transition cursor-pointer"
            >
              {hasPet ? (
                <>
                  <span className={`text-3xl ${petEggInfo.isHatched ? 'animate-bounce' : 'animate-pulse'}`}>
                    {petEggInfo.displayIcon}
                  </span>
                  <span className="text-[10px] text-pink-300 font-bold hidden sm:inline">
                    {petEggInfo.isHatched ? '守护兽' : '宠物蛋'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-pink-400/50 font-bold">—</span>
                  <span className="text-[10px] text-pink-300/60 font-bold hidden sm:inline">未解锁/空</span>
                </>
              )}
            </div>

            {/* Left: Avatar */}
            <div 
              onClick={onOpenShop}
              className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#1b0f42] border border-purple-500/40 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 hover:scale-110 transition cursor-pointer"
            >
              {student.equipped?.avatar ? (
                <>
                  <span className="text-3xl">{student.equipped.avatar}</span>
                  <span className="text-[10px] text-purple-300 font-bold hidden sm:inline">形象</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-purple-400/50 font-bold">—</span>
                  <span className="text-[10px] text-purple-300/60 font-bold hidden sm:inline">未解锁/空</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Current Equipment Summary Pills */}
        <div className="w-full max-w-2xl grid grid-cols-5 gap-2 mt-2">
          {[
            { label: '房屋', icon: student.equipped?.house || '—', sub: student.equipped?.house ? '已建' : '未解锁/空' },
            { label: '交通', icon: student.equipped?.vehicle || '—', sub: student.equipped?.vehicle ? '已购' : '未解锁/空' },
            { label: '设施', icon: student.equipped?.facility || '—', sub: student.equipped?.facility ? '已建' : '未解锁/空' },
            {
              label: hasPet ? (petEggInfo.isHatched ? '守护兽' : '宠物蛋') : '宠物',
              icon: hasPet ? petEggInfo.displayIcon : '—',
              sub: hasPet ? (petEggInfo.isHatched ? '已唤醒' : '孵化中') : '未解锁/空',
            },
            { label: '头像', icon: student.equipped?.avatar || '—', sub: student.equipped?.avatar ? '形象' : '未解锁/空' },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={onOpenShop}
              className="bg-[#180e3a]/80 border border-purple-800/40 rounded-2xl p-2 text-center flex flex-col items-center justify-center hover:border-purple-500 transition cursor-pointer"
            >
              <span className="text-xl sm:text-2xl mb-0.5 font-bold text-purple-200">{item.icon}</span>
              <span className="text-[10px] text-purple-300/90 font-bold">{item.label}</span>
              <span className="text-[9px] text-purple-400/60">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pet Incubator & Cultivation System */}
      <div className="bg-[#140b2e]/90 border border-purple-800/50 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-800/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Utensils size={18} className="text-amber-400" />
                <span>{hasPet ? (petEggInfo.isHatched ? '守护神兽培养与喂食' : '神秘宠物蛋孵化系统') : '守护宠物养成板块'}</span>
              </h3>
              {hasPet && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full border border-purple-500/30 bg-purple-950/60 ${petStage.color}`}>
                  {petStage.title}
                </span>
              )}
            </div>
            <p className="text-xs text-purple-300/70 mt-1">
              {hasPet
                ? (petEggInfo.isHatched
                  ? `🎉 你的【${petEggInfo.displayName}】已成功破壳破界！继续喂食增加经验，让神兽更加强大！`
                  : `🥚 宠物蛋孕育中！继续喂食达到最高 ${petEggInfo.requiredExp} EXP 经验值即可破壳解构真相并放去小岛展示！`)
                : '未拥有宠物，请前往商城购买你的第一只宠物/宠物蛋！'}
            </p>
          </div>

          {hasPet && (
            <div className="flex items-center gap-2 text-xs font-mono font-bold bg-[#1d1145] border border-purple-700/40 px-3.5 py-2 rounded-2xl text-amber-300 shadow">
              <span>{petEggInfo.isHatched ? '神兽经验:' : '破壳 EXP:'}</span>
              <span className="text-white text-sm font-black">{student.petExp || 0}</span>
              <span className="text-purple-400">/ {petEggInfo.requiredExp} EXP</span>
            </div>
          )}
        </div>

        {/* Pet Egg / Pet Incubator Spotlight Card */}
        {!hasPet ? (
          <div className="bg-[#180e3d]/80 border border-purple-700/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-2xl text-purple-400/60">
                🐾
              </div>
              <div>
                <h4 className="text-base font-black text-white">未拥有宠物，请前往商城购买</h4>
                <p className="text-xs text-purple-200/70 mt-1">
                  前往【微型商城】选购你心仪的宠物蛋，就能在这里喂食培育出你的专属守护神兽！
                </p>
              </div>
            </div>
            <button
              onClick={onOpenShop}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag size={14} />
              去商城领养宠物
            </button>
          </div>
        ) : (
          <div className="bg-[#180e3d]/80 border border-purple-700/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-purple-600/30 border border-amber-500/40 flex items-center justify-center text-5xl shadow-inner">
                <span className={petEggInfo.isHatched ? 'animate-bounce' : 'animate-pulse'}>
                  {petEggInfo.displayIcon}
                </span>
                {!petEggInfo.isHatched && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-200 shadow">
                    孵化中
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <span>{petEggInfo.isHatched ? petEggInfo.petItem.hatchedName : petEggInfo.petItem.name}</span>
                  {petEggInfo.isHatched && <Sparkles size={16} className="text-amber-400" />}
                </h4>
                <p className="text-xs text-purple-200/80 mt-1">
                  {petEggInfo.isHatched
                    ? '已成功破壳解锁真容，已在小岛展现高能守护力！'
                    : `还需要 ${Math.max(0, petEggInfo.requiredExp - (student.petExp || 0))} EXP 即可唤醒神兽破壳！`}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span className="text-purple-300">破壳解锁进度</span>
                <span className={petEggInfo.isHatched ? 'text-emerald-400' : 'text-amber-300'}>
                  {petEggInfo.isHatched
                    ? '100% (完全破壳)'
                    : `${Math.min(100, Math.floor(((student.petExp || 0) / petEggInfo.requiredExp) * 100))}%`}
                </span>
              </div>
              <div className="w-full bg-[#0d0620] h-3.5 rounded-full overflow-hidden border border-purple-900/60 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    petEggInfo.isHatched
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-pink-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                  }`}
                  style={{
                    width: `${
                      petEggInfo.isHatched
                        ? 100
                        : Math.min(100, ((student.petExp || 0) / petEggInfo.requiredExp) * 100)
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Feedback Alert Message */}
        {feedMessage && (
          <div className="bg-purple-950/90 border border-pink-500 text-pink-200 text-xs font-bold px-4 py-3 rounded-2xl animate-fade-in flex items-center justify-between shadow-xl">
            <span>{feedMessage}</span>
            <Sparkles size={18} className="text-amber-400 animate-spin shrink-0" />
          </div>
        )}

        {/* Food Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {foods.map((food) => {
            const canAfford = student.coins >= food.cost;
            return (
              <button
                key={food.name}
                onClick={() => handleFeed(food)}
                className={`bg-[#1a0f3d] border rounded-2xl p-3.5 flex flex-col items-center justify-between text-center transition-all ${
                  canAfford
                    ? 'border-purple-800/60 hover:border-pink-500 hover:bg-purple-900/40 cursor-pointer hover:scale-105 shadow-md'
                    : 'border-purple-950 bg-[#12092b] opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="text-3xl my-1">{food.icon}</div>
                <div className="font-bold text-xs text-purple-100">{food.name}</div>
                <div className="text-[11px] text-amber-300 font-bold mt-1">
                  +{food.exp} EXP
                </div>
                <div className="mt-2 text-[10px] bg-[#241552] border border-purple-700/40 text-amber-400 font-mono font-bold px-2.5 py-1 rounded-xl">
                  🪙 {food.cost} 金币
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
