import React, { useState, useEffect } from 'react';
import { Student, ActiveParty, PartyAttendee, PartyGiftLog } from '../types';
import { partyAudio } from '../utils/partyAudio';
import confetti from 'canvas-confetti';
import { 
  PartyPopper, Volume2, VolumeX, Music, Users, Gift, Heart, Sparkles, Check, Lock, ShoppingBag, X, Radio, ArrowRight 
} from 'lucide-react';

interface PartyRoomModalProps {
  currentStudent: Student;
  activeParty: ActiveParty | null;
  allStudents: Student[];
  onHostParty: (cost: number) => void;
  onJoinParty: (attendee: PartyAttendee) => void;
  onSendPartyGift: (giftType: 'flower' | 'giftbox' | 'cake' | 'supercar', costCoins: number, costFlowers: number, giftName: string, giftIcon: string) => void;
  onCloseParty: () => void;
  onCloseModal: () => void;
  onNavigateToShop: () => void;
}

export const PartyRoomModal: React.FC<PartyRoomModalProps> = ({
  currentStudent,
  activeParty,
  allStudents,
  onHostParty,
  onJoinParty,
  onSendPartyGift,
  onCloseParty,
  onCloseModal,
  onNavigateToShop,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(true);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.3);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Check hosting requirements
  const unlocked = currentStudent.unlocked || [];
  const equipped = currentStudent.equipped || {};

  const hasVilla = unlocked.includes('h3') || equipped.house === '🏛️' || equipped.house === '🏖️' || equipped.house === '🏘️';
  const hasSportsCar = unlocked.includes('v2') || equipped.vehicle === '🏎️';
  const hasFerrisWheel = unlocked.includes('f3') || equipped.facility === '🎡';
  const hasEnoughCoins = (currentStudent.coins || 0) >= 200;

  const canHost = hasVilla && hasSportsCar && hasFerrisWheel && hasEnoughCoins;

  const tracks = partyAudio.getTracks();

  // Auto start music when in active party
  useEffect(() => {
    if (activeParty) {
      partyAudio.startTrack(currentTrack);
      setIsPlayingMusic(true);
    } else {
      partyAudio.stopTrack();
      setIsPlayingMusic(false);
    }
    return () => {
      partyAudio.stopTrack();
    };
  }, [activeParty]);

  const toggleMusic = () => {
    if (isPlayingMusic) {
      partyAudio.stopTrack();
      setIsPlayingMusic(false);
    } else {
      partyAudio.startTrack(currentTrack);
      setIsPlayingMusic(true);
    }
  };

  const changeTrack = (idx: number) => {
    setCurrentTrack(idx);
    partyAudio.startTrack(idx);
    setIsPlayingMusic(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    partyAudio.setVolume(newVol);
  };

  const handleStartHosting = () => {
    if (!canHost) return;
    onHostParty(200);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  const isHost = activeParty && activeParty.hostId === currentStudent.id;
  const attendeesList = activeParty?.attendees ? (Object.values(activeParty.attendees) as PartyAttendee[]) : [];
  const giftLogsList = activeParty?.giftLogs ? (Object.values(activeParty.giftLogs) as PartyGiftLog[]).sort((a,b) => b.timestamp - a.timestamp) : [];

  const hasJoined = activeParty?.attendees && !!activeParty.attendees[currentStudent.id.toString()];

  const handleJoin = () => {
    onJoinParty({
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      avatar: currentStudent.equipped?.avatar || '👧',
      joinedAt: Date.now(),
    });
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setToastMsg(`你已成功加入 ${activeParty?.hostName} 的派对！`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleGiveGift = (
    type: 'flower' | 'giftbox' | 'cake' | 'supercar',
    costCoins: number,
    costFlowers: number,
    name: string,
    icon: string
  ) => {
    if (costCoins > 0 && (currentStudent.coins || 0) < costCoins) {
      setToastMsg(`金币不足！需要 ${costCoins} 金币`);
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }
    if (costFlowers > 0 && (currentStudent.flowers || 0) < costFlowers) {
      setToastMsg(`鲜花不足！需要 ${costFlowers} 朵鲜花`);
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    onSendPartyGift(type, costCoins, costFlowers, name, icon);
    setToastMsg(`成功送出 ${icon} ${name} 给房主！`);
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 }
    });
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#12092b] border border-purple-700/60 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-white flex flex-col">
        
        {/* Header Close Button */}
        <button
          onClick={() => {
            partyAudio.stopTrack();
            onCloseModal();
          }}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-purple-900/40 hover:bg-rose-900/60 text-purple-200 transition z-20"
        >
          <X size={20} />
        </button>

        {/* 1. NO ACTIVE PARTY OR CREATING PARTY CHECKLIST */}
        {!activeParty ? (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2 pt-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 mx-auto shadow-2xl flex items-center justify-center text-3xl">
                🥳
              </div>
              <h2 className="text-2xl font-black text-white">举办 6B 梦幻派对</h2>
              <p className="text-xs text-purple-300/80 max-w-md mx-auto">
                集齐三件顶尖岛屿装备并支付 200 金币，即可为全班同学开启热闹派对！
              </p>
            </div>

            {/* Checklist */}
            <div className="bg-[#180e3a] border border-purple-800/50 rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-purple-200 border-b border-purple-800/40 pb-2 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                派对举办门槛核验清单：
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Villa */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  hasVilla ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🏘️</span>
                    <div>
                      <div className="text-xs font-bold text-white">海景别墅</div>
                      <div className="text-[10px] opacity-70">最高级豪华住宅</div>
                    </div>
                  </div>
                  {hasVilla ? (
                    <span className="text-xs font-bold bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Check size={12} /> 已解锁
                    </span>
                  ) : (
                    <span className="text-xs font-bold bg-rose-900/60 text-rose-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Lock size={12} /> 未解锁
                    </span>
                  )}
                </div>

                {/* 2. Sports Car */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  hasSportsCar ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🏎️</span>
                    <div>
                      <div className="text-xs font-bold text-white">酷炫跑车</div>
                      <div className="text-[10px] opacity-70">极速赛道座驾</div>
                    </div>
                  </div>
                  {hasSportsCar ? (
                    <span className="text-xs font-bold bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Check size={12} /> 已解锁
                    </span>
                  ) : (
                    <span className="text-xs font-bold bg-rose-900/60 text-rose-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Lock size={12} /> 未解锁
                    </span>
                  )}
                </div>

                {/* 3. Ferris Wheel */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  hasFerrisWheel ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🎡</span>
                    <div>
                      <div className="text-xs font-bold text-white">七彩摩天轮</div>
                      <div className="text-[10px] opacity-70">浪漫观景游乐设施</div>
                    </div>
                  </div>
                  {hasFerrisWheel ? (
                    <span className="text-xs font-bold bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Check size={12} /> 已解锁
                    </span>
                  ) : (
                    <span className="text-xs font-bold bg-rose-900/60 text-rose-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Lock size={12} /> 未解锁
                    </span>
                  )}
                </div>

                {/* 4. 200 Coins Fee */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  hasEnoughCoins ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🪙</span>
                    <div>
                      <div className="text-xs font-bold text-white">派对筹办费</div>
                      <div className="text-[10px] opacity-70">需要 200 金币</div>
                    </div>
                  </div>
                  {hasEnoughCoins ? (
                    <span className="text-xs font-bold bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Check size={12} /> {currentStudent.coins}/200
                    </span>
                  ) : (
                    <span className="text-xs font-bold bg-rose-900/60 text-rose-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Lock size={12} /> {currentStudent.coins}/200
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!canHost && (
                <button
                  onClick={() => {
                    onCloseModal();
                    onNavigateToShop();
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
                >
                  <ShoppingBag size={16} />
                  前往商城购买缺少的装备
                </button>
              )}

              <button
                onClick={handleStartHosting}
                disabled={!canHost}
                className={`flex-1 font-black py-3.5 rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-sm ${
                  canHost
                    ? 'bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white cursor-pointer hover:scale-[1.01]'
                    : 'bg-[#1e133d] border border-purple-900 text-purple-400/50 cursor-not-allowed'
                }`}
              >
                <PartyPopper size={18} />
                <span>{canHost ? '扣除 200 金币，开启盛大派对！' : '条件未满足，无法举办'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 2. ACTIVE PARTY ROOM DISPLAY */
          <div className="p-5 space-y-5">
            {/* Top Bar Banner */}
            <div className="bg-gradient-to-r from-purple-900/90 via-pink-900/80 to-indigo-900/90 border border-pink-500/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-4xl animate-bounce">🥳</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white">{activeParty.title}</h2>
                    <span className="bg-pink-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                      派对热播中
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/80 mt-0.5 flex items-center gap-2">
                    <span>房主: {activeParty.hostName}</span>
                    <span>•</span>
                    <span>出席人数: {attendeesList.length} 人</span>
                  </p>
                </div>
              </div>

              {/* Host actions or visitor exit */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {isHost ? (
                  <button
                    onClick={onCloseParty}
                    className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-600/60 font-bold text-xs px-4 py-2 rounded-xl transition shadow"
                  >
                    结束派对
                  </button>
                ) : (
                  <button
                    onClick={onCloseModal}
                    className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50 font-bold text-xs px-4 py-2 rounded-xl transition"
                  >
                    暂时离开
                  </button>
                )}
              </div>
            </div>

            {/* Music DJ Synthesizer Controls */}
            <div className="bg-[#180e3c] border border-purple-800/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={toggleMusic}
                  className={`p-3 rounded-2xl font-bold transition flex items-center justify-center shadow ${
                    isPlayingMusic
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white animate-pulse'
                      : 'bg-purple-900/60 text-purple-300'
                  }`}
                  title={isPlayingMusic ? '暂停派对音乐' : '播放派对音乐'}
                >
                  {isPlayingMusic ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>

                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Music size={14} className="animate-spin text-pink-400" />
                    <span>正在播放: {tracks[currentTrack].name}</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {tracks.map((tr, idx) => (
                      <button
                        key={idx}
                        onClick={() => changeTrack(idx)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold transition ${
                          currentTrack === idx
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-[#100726] border-purple-900 text-purple-400/70 hover:text-white'
                        }`}
                      >
                        曲目 {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Volume Slider & Visualizer Bars */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                {/* Audio Bars Animation */}
                <div className="flex items-end gap-1 h-6">
                  <div className="w-1 bg-pink-500 rounded-full animate-[bounce_0.6s_infinite]" style={{ height: '80%' }} />
                  <div className="w-1 bg-amber-400 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '100%' }} />
                  <div className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.5s_infinite]" style={{ height: '60%' }} />
                  <div className="w-1 bg-purple-400 rounded-full animate-[bounce_0.7s_infinite]" style={{ height: '90%' }} />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold">
                  <span>音量</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-pink-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Notification Toast */}
            {toastMsg && (
              <div className="bg-purple-950 border border-pink-500 text-pink-200 text-xs font-bold px-4 py-2.5 rounded-2xl animate-fade-in flex items-center justify-between">
                <span>{toastMsg}</span>
                <Sparkles size={16} className="text-amber-400 animate-spin" />
              </div>
            )}

            {/* Stage Grid & Features */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left 7 cols: Party Stage & Attendance */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Visual Party Island Stage */}
                <div className="relative bg-gradient-to-b from-[#1c0f42] to-[#0c061d] border border-purple-800/50 rounded-2xl p-5 min-h-[260px] flex flex-col items-center justify-center overflow-hidden shadow-inner">
                  {/* Rotating Stage Light Effect */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(236,72,153,0.2),transparent_70%)]" />

                  {/* House, Car, Ferris Wheel Trio Stage */}
                  <div className="flex items-center justify-center gap-4 relative z-10 my-2">
                    <div className="text-center relative">
                      <span className="text-5xl drop-shadow-lg animate-bounce block">🏘️</span>
                      <div className="text-[10px] text-cyan-300 font-bold mt-1 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full shadow flex items-center justify-center gap-1">
                        <span>🌊</span>
                        <span>海景别墅</span>
                        <span>🌊</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-5xl drop-shadow-lg animate-pulse">🏎️</span>
                      <div className="text-[10px] text-cyan-300 font-bold mt-1">酷炫跑车</div>
                    </div>
                    <div className="text-center">
                      <span className="text-5xl drop-shadow-lg animate-[spin_10s_linear_infinite]">🎡</span>
                      <div className="text-[10px] text-pink-300 font-bold mt-1">七彩摩天轮</div>
                    </div>
                  </div>

                  {/* Dancing Attendees Avatars */}
                  <div className="w-full mt-4 border-t border-purple-800/40 pt-3 relative z-10">
                    <div className="text-[11px] font-bold text-purple-300/80 mb-2 text-center">
                      💃 派对现场跳舞同学 (已出席 {attendeesList.length} 人):
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {attendeesList.map((att) => (
                        <div
                          key={att.studentId}
                          className="bg-[#12082e] border border-pink-500/40 px-2.5 py-1 rounded-2xl flex items-center gap-1.5 hover:scale-110 transition animate-bounce"
                        >
                          <span className="text-xl">{att.avatar}</span>
                          <span className="text-xs font-bold text-white">{att.studentName}</span>
                          {att.studentId === activeParty.hostId && (
                            <span className="text-[9px] bg-amber-500 text-black font-black px-1 rounded-full">
                              房主
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                {!hasJoined && (
                  <button
                    onClick={handleJoin}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black py-3 rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-xs"
                  >
                    <Users size={16} />
                    出席本场派对，和大家一起欢聚！
                  </button>
                )}

                {/* Attendance List */}
                <div className="bg-[#180e3a] border border-purple-800/50 rounded-2xl p-4 space-y-2">
                  <h3 className="text-xs font-bold text-white flex items-center justify-between border-b border-purple-800/40 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-amber-400" /> 出席人员名单
                    </span>
                    <span className="text-purple-300/60 font-mono text-[10px]">
                      {attendeesList.length} / {allStudents.length} 人
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
                    {attendeesList.map((att) => (
                      <div
                        key={att.studentId}
                        className="bg-[#12082e] border border-purple-800/60 p-2 rounded-xl flex items-center gap-2 text-xs"
                      >
                        <span className="text-lg">{att.avatar}</span>
                        <span className="font-bold text-purple-100 truncate">{att.studentName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 5 cols: Gift & Flower Sending Station */}
              <div className="lg:col-span-5 bg-[#180e3a] border border-purple-800/50 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
                
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-purple-800/40 pb-2">
                    <Gift size={16} className="text-pink-400" />
                    给房主送礼与送花 (给 {activeParty.hostName})
                  </h3>

                  <p className="text-[11px] text-purple-300/70 mt-1.5">
                    出席派对时给房主送上精美礼品与鲜花，房主将实时收到对应金币与鲜花！
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {/* 1. Flower */}
                    <button
                      onClick={() => handleGiveGift('flower', 0, 1, '鲜花', '🌸')}
                      className="bg-[#12082e] border border-pink-500/40 hover:border-pink-400 p-3 rounded-2xl flex flex-col items-center justify-center text-center transition hover:scale-105"
                    >
                      <span className="text-3xl mb-1">🌸</span>
                      <span className="font-bold text-xs text-white">送 1 朵鲜花</span>
                      <span className="text-[10px] text-pink-300 font-mono font-bold mt-1">消耗: 1 朵鲜花</span>
                    </button>

                    {/* 2. Gift Box */}
                    <button
                      onClick={() => handleGiveGift('giftbox', 10, 0, '派对礼盒', '🎁')}
                      className="bg-[#12082e] border border-purple-700/50 hover:border-amber-400 p-3 rounded-2xl flex flex-col items-center justify-center text-center transition hover:scale-105"
                    >
                      <span className="text-3xl mb-1">🎁</span>
                      <span className="font-bold text-xs text-white">派对礼盒</span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold mt-1">🪙 10金币 (房主+10)</span>
                    </button>

                    {/* 3. Party Cake */}
                    <button
                      onClick={() => handleGiveGift('cake', 30, 0, '狂欢蛋糕', '🍰')}
                      className="bg-[#12082e] border border-purple-700/50 hover:border-amber-400 p-3 rounded-2xl flex flex-col items-center justify-center text-center transition hover:scale-105"
                    >
                      <span className="text-3xl mb-1">🍰</span>
                      <span className="font-bold text-xs text-white">狂欢大蛋糕</span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold mt-1">🪙 30金币 (房主+30/花+1)</span>
                    </button>

                    {/* 4. Supercar Model */}
                    <button
                      onClick={() => handleGiveGift('supercar', 100, 0, '跑车模型', '🏎️')}
                      className="bg-[#12082e] border border-purple-700/50 hover:border-amber-400 p-3 rounded-2xl flex flex-col items-center justify-center text-center transition hover:scale-105"
                    >
                      <span className="text-3xl mb-1">🏎️</span>
                      <span className="font-bold text-xs text-white">跑车模型</span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold mt-1">🪙 100金币 (房主+100/花+2)</span>
                    </button>
                  </div>
                </div>

                {/* Live Gift Broadcast Feed */}
                <div className="border-t border-purple-800/40 pt-3">
                  <div className="text-[11px] font-bold text-purple-300/80 mb-2 flex items-center justify-between">
                    <span>🎉 现场送礼播报动态:</span>
                    <span className="text-[9px] font-mono text-purple-400">{giftLogsList.length} 条互动</span>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto text-[11px] pr-1">
                    {giftLogsList.map((log) => (
                      <div
                        key={log.id}
                        className="bg-[#100726] border border-purple-900/60 p-2 rounded-xl flex items-center gap-2"
                      >
                        <span>{log.fromAvatar}</span>
                        <span className="font-bold text-pink-300">{log.fromName}</span>
                        <span className="text-gray-300">送出了</span>
                        <span className="font-bold text-amber-300">{log.giftIcon} {log.giftName}</span>
                      </div>
                    ))}

                    {giftLogsList.length === 0 && (
                      <div className="text-center py-4 text-[11px] text-purple-400/50">
                        暂无送礼动态，快来给房主送礼物吧！
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
