import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, Play, RotateCcw, X, Zap, Award, ShieldAlert, Sparkles, Target, Flame } from 'lucide-react';

interface FootballGameModalProps {
  student: Student;
  allStudents: Student[];
  onClose: () => void;
  onUpdateHighScore: (studentId: number, score: number) => void;
  onRecordPlaySession?: (studentId: number, dateStr: string) => void;
}

export const FootballGameModal: React.FC<FootballGameModalProps> = ({
  student,
  allStudents,
  onClose,
  onUpdateHighScore,
  onRecordPlaySession,
}) => {
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalShots, setTotalShots] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  
  // Goalkeeper animation state
  const [keeperX, setKeeperX] = useState(25); // 0 to 55 %
  const keeperXRef = useRef(25);
  const [keeperDir, setKeeperDir] = useState<1 | -1>(1);

  // Ball shooting animation
  const [ballAnim, setBallAnim] = useState<{ x: number; y: number; targetX: number; targetY: number } | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'goal' | 'save'; id: number } | null>(null);

  const goalAreaRef = useRef<HTMLDivElement>(null);

  // Keep keeperXRef always up to date for precise real-time hit test (prevents stale closure bug)
  useEffect(() => {
    keeperXRef.current = keeperX;
  }, [keeperX]);

  // Get current local date string (YYYY-MM-DD)
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();
  const hasPlayedToday = student.lastFootballPlayedDate === todayStr;

  // High Difficulty Goalkeeper movement loop (Moves between 0% and 55% for 45% wide keeper)
  useEffect(() => {
    if (!isGameActive) return;

    const interval = setInterval(() => {
      setKeeperX((prevX) => {
        let currentDir = keeperDir;
        if (Math.random() < 0.08) { // 8% chance per tick to suddenly switch direction
          currentDir = currentDir === 1 ? -1 : 1;
          setKeeperDir(currentDir);
        }

        const baseSpeed = 2.5;
        const comboSpeed = Math.min(combo * 0.3, 2.0);
        const speed = baseSpeed + comboSpeed;
        
        let nextX = prevX + currentDir * speed;
        if (nextX >= 55) {
          setKeeperDir(-1);
          nextX = 55;
        } else if (nextX <= 0) {
          setKeeperDir(1);
          nextX = 0;
        }
        keeperXRef.current = nextX;
        return nextX;
      });
    }, 20); // 50fps tick rate for smooth movement

    return () => clearInterval(interval);
  }, [isGameActive, keeperDir, combo]);

  // Game timer
  useEffect(() => {
    if (!isGameActive) return;

    if (timeLeft <= 0) {
      setIsGameActive(false);
      setIsGameOver(true);

      // Check for high score
      const currentHighScore = student.footballHighScore || 0;
      if (score > currentHighScore) {
        onUpdateHighScore(student.id, score);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isGameActive, timeLeft, score, student.id, student.footballHighScore, onUpdateHighScore]);

  // Start / Restart game
  const handleStartGame = () => {
    if (hasPlayedToday && !isGameActive && !isGameOver) {
      alert('⚠️ 今天你已经参加过足球点球大挑战啦！每日限挑战 1 次，请明天再来刷新高分排行榜吧！');
      return;
    }

    // Record session date
    if (onRecordPlaySession) {
      onRecordPlaySession(student.id, todayStr);
    }

    setIsGameActive(true);
    setIsGameOver(false);
    setTimeLeft(15);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalShots(0);
    setTotalGoals(0);
    setBallAnim(null);
    setIsShooting(false);
    setFeedback(null);
  };

  // Handle Shoot action
  const handleGoalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isGameActive || isShooting || !goalAreaRef.current) return;

    const rect = goalAreaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to percentages
    const targetXPercent = Math.max(5, Math.min(95, (clickX / rect.width) * 100));
    const targetYPercent = Math.max(10, Math.min(85, (clickY / rect.height) * 100));

    setIsShooting(true);
    setBallAnim({ x: 50, y: 90, targetX: targetXPercent, targetY: targetYPercent });

    // Calculate hit detection after ball animation using real-time keeperXRef
    setTimeout(() => {
      const currentKeeperLeft = keeperXRef.current;
      const currentKeeperRight = currentKeeperLeft + 45; // 45% goalkeeper width
      
      // Check if targetX is caught by goalkeeper body
      const isSaved = targetXPercent >= (currentKeeperLeft - 2) && targetXPercent <= (currentKeeperRight + 2);

      if (isSaved) {
        // Saved by Goalkeeper!
        setTotalShots((s) => s + 1);
        setCombo(0);
        setFeedback({
          text: '🧤 惨遭门将挡出！Combo 重置',
          type: 'save',
          id: Date.now(),
        });
      } else {
        // GOAL Scored!
        setTotalShots((s) => s + 1);
        setTotalGoals((g) => g + 1);
        
        setCombo((prevCombo) => {
          const newCombo = prevCombo + 1;
          setMaxCombo((m) => Math.max(m, newCombo));
          
          // Score formula: 10 points base per goal + small combo bonus
          const bonus = (newCombo - 1) * 2;
          const pointsGained = 10 + bonus;
          
          setScore((prevScore) => prevScore + pointsGained);
          
          setFeedback({
            text: `⚽ GOAL!! +${pointsGained}分 ${newCombo > 1 ? `(连击 x${newCombo}!)` : ''}`,
            type: 'goal',
            id: Date.now(),
          });

          return newCombo;
        });

        // Small confetti trigger for goal
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.7 },
        });
      }

      // Reset shooting state
      setTimeout(() => {
        setBallAnim(null);
        setIsShooting(false);
      }, 200);
    }, 200);
  };

  // Top 5 Leaderboard calculation
  const leaderboard = [...allStudents]
    .sort((a, b) => (b.footballHighScore || 0) - (a.footballHighScore || 0))
    .slice(0, 5);

  const currentHighScore = student.footballHighScore || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-gradient-to-b from-[#180d38] via-[#12082b] to-[#0a041a] border border-purple-600/50 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#1e1047] border-b border-purple-700/50 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shadow-lg">
              ⚽
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>15秒极限点球大挑战</span>
                <span className="bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  6B 地狱难度
                </span>
              </h2>
              <p className="text-xs text-purple-300/70">15秒极速挑战！高频极速守门员，避开抓扑连击破榜！</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 flex items-center justify-center transition border border-purple-700/50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Game Canvas & Pitch (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* HUD Status Bar */}
            <div className="bg-[#150a33] border border-purple-800/60 rounded-2xl p-3 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">倒计时</span>
                  <span className={`text-xl font-black font-mono ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
                    ⏱️ {timeLeft}s
                  </span>
                </div>
                <div className="h-8 w-px bg-purple-800/60" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">当前得分</span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {score} <span className="text-xs text-purple-300 font-normal">分</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {combo > 1 && (
                  <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-xl animate-bounce flex items-center gap-1 shadow">
                    <Flame size={14} /> 连击 x{combo}
                  </div>
                )}
                <div className="bg-purple-900/50 border border-purple-700/40 px-3 py-1 rounded-xl text-right">
                  <span className="text-[10px] text-purple-300 block font-bold">最高连击</span>
                  <span className="text-xs font-mono font-bold text-amber-300">{maxCombo} 次</span>
                </div>
              </div>
            </div>

            {/* Pitch / Goal Interactive Area */}
            <div className="relative bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-950 border-2 border-emerald-500/60 rounded-2xl p-4 min-h-[300px] flex flex-col items-center justify-between shadow-2xl overflow-hidden select-none">
              {/* Field Grass Texture Line */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-emerald-950/30 border-b border-emerald-400/20 pointer-events-none" />
              
              {/* Goal Frame */}
              <div
                ref={goalAreaRef}
                onClick={handleGoalClick}
                className={`relative w-full h-44 bg-emerald-950/60 border-4 border-white rounded-t-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] cursor-crosshair overflow-hidden group transition ${
                  !isGameActive ? 'opacity-90' : 'hover:border-amber-300'
                }`}
              >
                {/* Goal Net Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                {/* Goalkeeper (Super Wide 45% Iron-Wall) */}
                <div
                  className="absolute top-4 h-16 w-[45%] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-2xl border-2 border-white shadow-xl flex items-center justify-between px-3 text-2xl transition-all duration-75 pointer-events-none z-10"
                  style={{ left: `${keeperX}%` }}
                >
                  <span className="drop-shadow-md">🧤</span>
                  <span className="text-[10px] sm:text-xs font-black text-amber-950 uppercase tracking-wider bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-900/30 shrink-0 shadow-sm">
                    巨型超长铁壁门将
                  </span>
                  <span className="drop-shadow-md">🧤</span>
                </div>

                {/* Aiming Crosshair Prompt when active */}
                {isGameActive && !isShooting && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    <span className="bg-black/60 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/50 shadow flex items-center gap-1">
                      <Target size={14} /> 点击瞄准此处射门！
                    </span>
                  </div>
                )}

                {/* Floating Feedback Popup */}
                {feedback && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none animate-bounce">
                    <span
                      className={`text-sm font-black px-4 py-2 rounded-2xl shadow-2xl border ${
                        feedback.type === 'goal'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-300'
                          : 'bg-gradient-to-r from-rose-700 to-red-800 text-white border-rose-300'
                      }`}
                    >
                      {feedback.text}
                    </span>
                  </div>
                )}

                {/* Animated Football */}
                {ballAnim && (
                  <div
                    className="absolute text-3xl z-20 transition-all duration-200 ease-out pointer-events-none drop-shadow-xl"
                    style={{
                      left: `${ballAnim.targetX}%`,
                      top: `${ballAnim.targetY}%`,
                      transform: 'translate(-50%, -50%) scale(0.85)',
                    }}
                  >
                    ⚽
                  </div>
                )}
              </div>

              {/* Penalty Spot & Kicker Stand Area */}
              <div className="relative w-full flex flex-col items-center justify-center mt-3">
                {/* Penalty spot dot */}
                <div className="w-4 h-4 rounded-full bg-white border-2 border-emerald-950 shadow mb-1" />
                
                {/* Static football if not shooting */}
                {!ballAnim && (
                  <div className="text-4xl animate-pulse drop-shadow-md">⚽</div>
                )}

                <p className="text-[11px] text-emerald-100/90 font-bold mt-1 text-center">
                  {isGameActive
                    ? '点击球门内部任何位置完成点球攻门！'
                    : isGameOver
                    ? '比赛结束！查看你的最终成绩与排行榜吧！'
                    : '准备好了吗？点击下方【开始15秒极限挑战】！'}
                </p>
              </div>

              {/* Game Overlay for Start / Game Over */}
              {!isGameActive && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-40">
                  {isGameOver ? (
                    <div className="space-y-3 animate-fade-in max-w-sm">
                      <div className="text-4xl">🏆</div>
                      <h3 className="text-xl font-black text-white">挑战结束！本局得分</h3>
                      <div className="text-4xl font-black font-mono text-amber-300 drop-shadow-md">
                        {score} <span className="text-base text-white">分</span>
                      </div>

                      <div className="bg-purple-950/80 border border-purple-700/50 rounded-2xl p-3 grid grid-cols-3 gap-2 text-xs font-mono text-purple-200">
                        <div>
                          <span className="block text-[10px] text-purple-400 font-bold">总射门</span>
                          <span className="font-bold text-white">{totalShots} 次</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-purple-400 font-bold">成功进球</span>
                          <span className="font-bold text-emerald-400">{totalGoals} 球</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-purple-400 font-bold">最高连击</span>
                          <span className="font-bold text-amber-300">{maxCombo} 次</span>
                        </div>
                      </div>

                      {score > currentHighScore && (
                        <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs px-3 py-1.5 rounded-full shadow animate-pulse">
                          🎉 刷新个人历史最高纪录！已即时同步榜单！
                        </div>
                      )}

                      <div className="bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs px-3 py-2 rounded-xl text-center">
                        ⚠️ 每日仅限挑战 1 次，今日成绩已记录！明天再来吧！
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in max-w-sm">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-xl">
                        ⚽
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">15秒地狱级点球大挑战</h3>
                        <p className="text-xs text-purple-200/80 mt-1.5">
                          🔥 巨型超长铁壁门将（占据近半球门）极速闪现扑救！精准避开门将射门，每球得 10 分+连击加成！
                        </p>
                      </div>

                      {hasPlayedToday ? (
                        <div className="space-y-2">
                          <div className="bg-amber-950/80 border border-amber-500/60 text-amber-200 text-xs font-bold px-4 py-3 rounded-2xl shadow-lg">
                            🔒 今天你已经参加过点球大挑战啦！
                            <span className="block text-[10px] text-amber-300/80 mt-1 font-normal">
                              每日限量 1 次，明日（00:00后）重置挑战机会！
                            </span>
                          </div>
                          <button
                            disabled
                            className="bg-gray-700 text-gray-400 font-bold text-xs px-6 py-2.5 rounded-2xl shadow cursor-not-allowed opacity-70 w-full"
                          >
                            今日已挑战 (明天再来)
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleStartGame}
                          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:scale-105 text-white font-black text-sm px-8 py-3 rounded-2xl shadow-2xl transition flex items-center justify-center gap-2 mx-auto cursor-pointer border border-emerald-300 w-full"
                        >
                          <Play size={18} fill="white" /> 开始 15 秒极限挑战
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Real-time Leaderboard (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Leaderboard Card Container */}
            <div className="bg-[#150a33] border border-purple-700/60 rounded-2xl p-4 flex-1 flex flex-col shadow-xl">
              <div className="flex items-center justify-between border-b border-purple-800/60 pb-3 mb-3">
                <h3 className="font-black text-sm text-amber-300 flex items-center gap-2">
                  <Trophy size={18} className="text-amber-400" />
                  <span>🏆 6B 足球神射手排行榜</span>
                </h3>
                <span className="bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  秒级实时同步
                </span>
              </div>

              <p className="text-[11px] text-purple-300/70 mb-3">
                展现全班踢球技术最高的 5 位神射手：
              </p>

              {/* Leaderboard Student List */}
              <div className="space-y-2.5 flex-1">
                {leaderboard.map((s, idx) => {
                  const rank = idx + 1;
                  const isCurrentStudent = s.id === student.id;
                  const highScore = s.footballHighScore || 0;

                  let rankBadge = `${rank}`;
                  let rankBg = 'bg-purple-900/40 text-purple-300 border-purple-700/40';

                  if (rank === 1) {
                    rankBadge = '🥇 1';
                    rankBg = 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black border-amber-300';
                  } else if (rank === 2) {
                    rankBadge = '🥈 2';
                    rankBg = 'bg-gradient-to-r from-slate-300 to-slate-400 text-black font-black border-slate-200';
                  } else if (rank === 3) {
                    rankBadge = '🥉 3';
                    rankBg = 'bg-gradient-to-r from-amber-700 to-amber-800 text-white font-black border-amber-500';
                  }

                  return (
                    <div
                      key={s.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isCurrentStudent
                          ? 'bg-amber-950/40 border-amber-500/70 shadow-lg'
                          : 'bg-[#1b0e42] border-purple-800/40 hover:border-purple-600/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs border shadow ${rankBg}`}>
                          {rankBadge}
                        </span>

                        <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center text-xl shrink-0">
                          {s.equipped?.avatar || '👦'}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white">{s.name}</span>
                            {isCurrentStudent && (
                              <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-400/40">
                                我
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-purple-300/60 block">#{s.id} 号学生</span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-sm font-black text-emerald-400 block">
                          {highScore} <span className="text-[10px] text-purple-300 font-normal">分</span>
                        </span>
                        {highScore === 0 && (
                          <span className="text-[9px] text-purple-400/60">暂未挑战</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current Student's Personal High Score Summary */}
              <div className="mt-4 pt-3 border-t border-purple-800/60 bg-[#1e1047]/60 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                <span className="text-purple-300 font-bold flex items-center gap-1.5">
                  <Award size={14} className="text-amber-400" /> 我的最佳战绩:
                </span>
                <span className="text-amber-300 font-black text-sm">
                  {currentHighScore} 分
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
