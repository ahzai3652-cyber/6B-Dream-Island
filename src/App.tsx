import React, { useState, useEffect } from 'react';
import { Student, UserSession, ShopItem, ShopCategoryKey, ActiveParty, PartyAttendee, PartyGiftLog } from './types';
import { TEACHER_CODE, INITIAL_STUDENTS_TEMPLATE } from './data';
import { 
  subscribeStudents, syncStudentUpdate, syncAllStudents, getLocalStudents,
  subscribeActiveParty, createActiveParty, joinActiveParty, sendPartyGiftLog, closeActiveParty 
} from './firebase';
import { Navbar } from './components/Navbar';
import { IslandView } from './components/IslandView';
import { ShopView } from './components/ShopView';
import { FlowerGiftingModal } from './components/FlowerGiftingModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { PartyRoomModal } from './components/PartyRoomModal';
import { FootballGameModal } from './components/FootballGameModal';
import { DreamGardenModal } from './components/DreamGardenModal';
import { ClassLeaderboardView } from './components/ClassLeaderboardView';
import { Lock, Sparkles, Shield, User, PartyPopper } from 'lucide-react';

export default function App() {
  const [studentsMap, setStudentsMap] = useState<Record<number, Student>>({});
  const [activeParty, setActiveParty] = useState<ActiveParty | null>(null);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState<boolean>(false);
  const [isFootballModalOpen, setIsFootballModalOpen] = useState<boolean>(false);
  const [isGardenModalOpen, setIsGardenModalOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [inputCode, setInputCode] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [loginTab, setLoginTab] = useState<'student' | 'teacher'>('student');
  const [activeNav, setActiveNav] = useState<string>('island');

  // Realtime Firebase subscription for students & active party
  useEffect(() => {
    const unsubStudents = subscribeStudents((data, onlineStatus) => {
      setStudentsMap(data);
      setIsOnline(onlineStatus);
    });

    const unsubParty = subscribeActiveParty((party) => {
      setActiveParty(party);
    });

    return () => {
      if (unsubStudents) unsubStudents();
      if (unsubParty) unsubParty();
    };
  }, []);

  const studentsList: Student[] = (Object.values(studentsMap) as Student[]).sort((a, b) => a.id - b.id);

  // Get current student data refreshed from realtime map
  const currentStudentData =
    currentUser && !currentUser.isTeacher && currentUser.id
      ? studentsMap[currentUser.id] || null
      : null;

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim();

    if (!cleanCode) return;

    if (loginTab === 'teacher') {
      if (cleanCode === TEACHER_CODE) {
        setCurrentUser({ isTeacher: true, name: "教师管理员" });
        setLoginError('');
        setInputCode('');
        return;
      } else {
        setLoginError('教师管理密码不正确！');
        return;
      }
    }

    if (cleanCode === TEACHER_CODE) {
      setCurrentUser({ isTeacher: true, name: "教师管理员" });
      setLoginError('');
      setInputCode('');
      return;
    }

    const matched = studentsList.find((s) => s.code === cleanCode || s.id.toString() === cleanCode);
    if (matched) {
      setCurrentUser({ isTeacher: false, id: matched.id, name: matched.name });
      setLoginError('');
      setInputCode('');
      setActiveNav('island');
    } else {
      setLoginError('密码错误，请重新输入！');
    }
  };

  // Quick student button login helper
  const handleQuickStudentLogin = (studentId: number) => {
    const student = studentsMap[studentId];
    if (student) {
      setCurrentUser({ isTeacher: false, id: student.id, name: student.name });
      setLoginError('');
      setInputCode('');
      setActiveNav('island');
    }
  };

  // Teacher coin update
  const handleUpdateCoins = (studentId: number, delta: number) => {
    const target = studentsMap[studentId];
    if (!target) return;
    const newCoins = Math.max(0, (target.coins || 0) + delta);
    syncStudentUpdate(studentId, { coins: newCoins });
  };

  // Teacher flower update
  const handleUpdateFlowers = (studentId: number, delta: number) => {
    const target = studentsMap[studentId];
    if (!target) return;
    const newFlowers = Math.max(0, (target.flowers || 0) + delta);
    syncStudentUpdate(studentId, { flowers: newFlowers });
  };

  // Batch coin reward
  const handleBatchAddCoins = (delta: number) => {
    const updatedMap: Record<number, Student> = { ...studentsMap };
    Object.keys(updatedMap).forEach((idStr) => {
      const id = Number(idStr);
      updatedMap[id] = {
        ...updatedMap[id],
        coins: Math.max(0, (updatedMap[id].coins || 0) + delta),
      };
    });
    syncAllStudents(updatedMap);
  };

  // Batch flower reward
  const handleBatchAddFlowers = (delta: number) => {
    const updatedMap: Record<number, Student> = { ...studentsMap };
    Object.keys(updatedMap).forEach((idStr) => {
      const id = Number(idStr);
      updatedMap[id] = {
        ...updatedMap[id],
        flowers: Math.max(0, (updatedMap[id].flowers || 0) + delta),
      };
    });
    syncAllStudents(updatedMap);
  };

  // Reset all students
  const handleResetAll = () => {
    const resetMap: Record<number, Student> = {};
    INITIAL_STUDENTS_TEMPLATE.forEach((s) => {
      resetMap[s.id] = {
        ...s,
        coins: 0,
        flowers: 0,
        petExp: 0,
        equipped: { avatar: '', house: '', vehicle: '', facility: '', pet: '' },
        unlocked: [],
        streak: 0,
        receivedFlowers: [],
      };
    });
    syncAllStudents(resetMap);
  };

  // Shop item click (buy or equip)
  const handleShopItemClick = (item: ShopItem, categoryKey: ShopCategoryKey) => {
    if (!currentStudentData) return;

    const isUnlocked = (currentStudentData.unlocked || []).includes(item.id);
    const categoryToEquipKey: Record<ShopCategoryKey, keyof Student['equipped']> = {
      houses: 'house',
      vehicles: 'vehicle',
      facilities: 'facility',
      pets: 'pet',
      avatars: 'avatar',
    };
    const equipKey = categoryToEquipKey[categoryKey];

    if (categoryKey === 'pets') {
      const requiredExp = item.requiredExp || 200;
      const isHatched = (currentStudentData.petExp || 0) >= requiredExp;

      if (isUnlocked) {
        if (!isHatched) {
          alert(`🥚 宠物蛋还在孵化中！\n需要通过在小岛界面给宠物蛋喂食达到最高 ${requiredExp} EXP 经验值破壳解锁后，方可看清真容并放去小岛哦！`);
          return;
        }
        // Equip hatched pet icon
        const targetIcon = item.hatchedIcon || '🐧';
        syncStudentUpdate(currentStudentData.id, {
          equipped: {
            ...currentStudentData.equipped,
            pet: targetIcon,
          },
        });
      } else {
        // Purchase pet egg
        if ((currentStudentData.coins || 0) < item.price) {
          alert('金币不足！你可以通过打卡和好好表现赚取金币哦！');
          return;
        }
        const updatedUnlocked = [...(currentStudentData.unlocked || []), item.id];
        const updatedEquipped = {
          ...currentStudentData.equipped,
          pet: '🥚', // Start as egg
        };

        syncStudentUpdate(currentStudentData.id, {
          coins: (currentStudentData.coins || 0) - item.price,
          unlocked: updatedUnlocked,
          equipped: updatedEquipped,
        });

        alert(`🎉 购买成功！获得了【${item.name} 🥚】！\n请前往小岛喂食，提升经验值达到 ${requiredExp} EXP 破壳揭晓神秘宠物的真容！`);
      }
      return;
    }

    if (isUnlocked) {
      // Equip item
      syncStudentUpdate(currentStudentData.id, {
        equipped: {
          ...currentStudentData.equipped,
          [equipKey]: item.icon,
        },
      });
    } else {
      // Purchase item
      if ((currentStudentData.coins || 0) < item.price) {
        alert('金币不足！你可以通过打卡和好好表现赚取金币哦！');
        return;
      }
      const updatedUnlocked = [...(currentStudentData.unlocked || []), item.id];
      const updatedEquipped = {
        ...currentStudentData.equipped,
        [equipKey]: item.icon,
      };

      syncStudentUpdate(currentStudentData.id, {
        coins: (currentStudentData.coins || 0) - item.price,
        unlocked: updatedUnlocked,
        equipped: updatedEquipped,
      });
    }
  };

  // Feed pet
  const handleFeedPet = (expGained: number, costGained: number) => {
    if (!currentStudentData) return;
    if ((currentStudentData.coins || 0) < costGained) {
      alert('金币不足！');
      return;
    }
    const newCoins = (currentStudentData.coins || 0) - costGained;
    const newExp = Math.min((currentStudentData.petExp || 0) + expGained, 2000);

    syncStudentUpdate(currentStudentData.id, {
      coins: newCoins,
      petExp: newExp,
    });
  };

  // Daily Check In
  const handleCheckIn = (earnedCoins: number, earnedFlowers: number, earnedExp: number) => {
    if (!currentStudentData) return;
    const todayStr = new Date().toISOString().split('T')[0];

    const newCoins = (currentStudentData.coins || 0) + earnedCoins;
    const newFlowers = (currentStudentData.flowers || 0) + earnedFlowers;
    const newExp = Math.min((currentStudentData.petExp || 0) + earnedExp, 2000);
    const newStreak = (currentStudentData.streak || 0) + 1;

    syncStudentUpdate(currentStudentData.id, {
      coins: newCoins,
      flowers: newFlowers,
      petExp: newExp,
      lastCheckIn: todayStr,
      streak: newStreak,
    });
  };

  // Send flower to classmate
  const handleSendFlower = (targetStudentId: number, count: number, message: string) => {
    if (!currentStudentData) return;
    if ((currentStudentData.flowers || 0) < count) {
      alert('鲜花数量不足！');
      return;
    }

    const targetStudent = studentsMap[targetStudentId];
    if (!targetStudent) return;

    // Deduct from current
    syncStudentUpdate(currentStudentData.id, {
      flowers: (currentStudentData.flowers || 0) - count,
    });

    // Add to target
    const targetFlowers = (targetStudent.flowers || 0) + count;
    const newReceived = [
      ...(targetStudent.receivedFlowers || []),
      { from: currentStudentData.name, count, message, timestamp: Date.now() },
    ];

    syncStudentUpdate(targetStudentId, {
      flowers: targetFlowers,
      receivedFlowers: newReceived,
    });
  };

  // Dream Garden handlers
  const handleWaterPlant = (studentId: number, costCoins: number, newProgress: number) => {
    const s = studentsMap[studentId];
    if (!s) return;
    const newCoins = Math.max(0, (s.coins || 0) - costCoins);
    syncStudentUpdate(studentId, {
      coins: newCoins,
      gardenProgress: newProgress,
    });
  };

  const handleHarvestFlower = (studentId: number, nextFlowerType: string) => {
    const s = studentsMap[studentId];
    if (!s) return;
    const newFlowers = (s.flowers || 0) + 1;
    syncStudentUpdate(studentId, {
      flowers: newFlowers,
      gardenProgress: 0,
      gardenFlowerType: nextFlowerType,
    });
  };

  const handleUpdateStudentData = (studentId: number, updateObj: Partial<Student>) => {
    syncStudentUpdate(studentId, updateObj);
  };

  // Host Party Handler
  const handleHostParty = (cost: number) => {
    if (!currentStudentData) return;
    if ((currentStudentData.coins || 0) < cost) {
      alert("金币不足！筹办派对需要 200 金币");
      return;
    }

    // Deduct 200 coins
    syncStudentUpdate(currentStudentData.id, {
      coins: (currentStudentData.coins || 0) - cost,
    });

    const initialHostAttendee: PartyAttendee = {
      studentId: currentStudentData.id,
      studentName: currentStudentData.name,
      avatar: currentStudentData.equipped?.avatar || '👧',
      joinedAt: Date.now(),
    };

    const newParty: ActiveParty = {
      hostId: currentStudentData.id,
      hostName: currentStudentData.name,
      hostAvatar: currentStudentData.equipped?.avatar || '👧',
      hostHouse: currentStudentData.equipped?.house || '🏕️',
      hostVehicle: currentStudentData.equipped?.vehicle || '🚶',
      hostFacility: currentStudentData.equipped?.facility || '🌴',
      title: `${currentStudentData.name} 的狂欢派对 🥳`,
      startTime: Date.now(),
      isActive: true,
      attendees: {
        [currentStudentData.id.toString()]: initialHostAttendee,
      },
      giftLogs: {},
    };

    createActiveParty(newParty);
  };

  // Join Party Handler
  const handleJoinParty = (attendee: PartyAttendee) => {
    joinActiveParty(attendee);
  };

  // Send Party Gift / Flower Handler
  const handleSendPartyGift = (
    giftType: 'flower' | 'giftbox' | 'cake' | 'supercar',
    costCoins: number,
    costFlowers: number,
    giftName: string,
    giftIcon: string
  ) => {
    if (!currentStudentData || !activeParty) return;

    // Deduct from sender
    const senderCoins = Math.max(0, (currentStudentData.coins || 0) - costCoins);
    const senderFlowers = Math.max(0, (currentStudentData.flowers || 0) - costFlowers);
    syncStudentUpdate(currentStudentData.id, {
      coins: senderCoins,
      flowers: senderFlowers,
    });

    // Add to host
    const hostStudent = studentsMap[activeParty.hostId];
    if (hostStudent) {
      let earnedHostCoins = 0;
      let earnedHostFlowers = 0;

      if (giftType === 'flower') earnedHostFlowers = costFlowers || 1;
      else if (giftType === 'giftbox') earnedHostCoins = 10;
      else if (giftType === 'cake') { earnedHostCoins = 30; earnedHostFlowers = 1; }
      else if (giftType === 'supercar') { earnedHostCoins = 100; earnedHostFlowers = 2; }

      syncStudentUpdate(activeParty.hostId, {
        coins: (hostStudent.coins || 0) + earnedHostCoins,
        flowers: (hostStudent.flowers || 0) + earnedHostFlowers,
      });
    }

    // Log gift transaction
    const log: PartyGiftLog = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromId: currentStudentData.id,
      fromName: currentStudentData.name,
      fromAvatar: currentStudentData.equipped?.avatar || '👧',
      giftType,
      giftName,
      giftIcon,
      amount: costCoins > 0 ? costCoins : costFlowers,
      timestamp: Date.now(),
    };

    sendPartyGiftLog(log);
  };

  // Close Party Handler
  const handleCloseParty = () => {
    closeActiveParty();
    setIsPartyModalOpen(false);
  };

  // 1. Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a051b] text-white flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="bg-[#160e33]/90 border border-purple-800/50 rounded-3xl p-8 max-w-lg w-full shadow-2xl backdrop-blur-2xl text-center z-10 space-y-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-2xl p-0.5">
            <div className="w-full h-full bg-[#12082b] rounded-[22px] flex items-center justify-center text-4xl">
              🏰
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
              6B 梦幻家园
            </h1>
            <p className="text-xs text-purple-300/70 mt-1.5 font-medium">
              Firebase 实时同步版 • 班级岛屿建设与积分商城
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex bg-[#0c061d] p-1 rounded-2xl border border-purple-800/50">
            <button
              type="button"
              onClick={() => { setLoginTab('student'); setLoginError(''); setInputCode(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                loginTab === 'student'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              <span>🎓</span>
              <span>学生登录</span>
            </button>
            <button
              type="button"
              onClick={() => { setLoginTab('teacher'); setLoginError(''); setInputCode(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                loginTab === 'teacher'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              <span>👩‍🏫</span>
              <span>教师后台登录</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-purple-200 mb-1.5 block">
                {loginTab === 'student' ? '请输入密码：' : '请输入管理密码：'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full bg-[#0c061d] border border-purple-800/80 focus:border-pink-500 rounded-2xl px-4 py-3.5 text-center text-lg font-bold tracking-widest text-pink-300 outline-none transition-all shadow-inner"
                />
              </div>
              {loginError && (
                <p className="text-xs text-rose-400 font-bold mt-2 text-center bg-rose-950/60 p-2 rounded-xl border border-rose-800/40">
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full font-black py-3.5 rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] text-sm text-white ${
                loginTab === 'student'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500'
                  : 'bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:to-purple-500'
              }`}
            >
              {loginTab === 'student' ? '登 录 入 园 🏰' : '进入教师管理后台 👩‍🏫'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Main Authenticated App Layout
  return (
    <div className="min-h-screen bg-[#0a051b] text-white flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        studentData={currentStudentData}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onLogout={() => setCurrentUser(null)}
        isOnline={isOnline}
        activeParty={activeParty}
        onOpenPartyModal={() => setIsPartyModalOpen(true)}
      />

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {currentUser.isTeacher ? (
          /* Teacher Console */
          <TeacherDashboard
            studentsList={studentsList}
            onUpdateCoins={handleUpdateCoins}
            onUpdateFlowers={handleUpdateFlowers}
            onBatchAddCoins={handleBatchAddCoins}
            onBatchAddFlowers={handleBatchAddFlowers}
            onResetAll={handleResetAll}
            onLogout={() => setCurrentUser(null)}
          />
        ) : (
          /* Student Views */
          currentStudentData && (
            <>
              {activeNav === 'island' && (
                <IslandView
                  student={currentStudentData}
                  onFeedPet={handleFeedPet}
                  onOpenShop={() => setActiveNav('shop')}
                  onOpenPartyModal={() => setIsPartyModalOpen(true)}
                  onOpenFootballModal={() => setIsFootballModalOpen(true)}
                  onOpenGardenModal={() => setIsGardenModalOpen(true)}
                />
              )}

              {activeNav === 'shop' && (
                <ShopView
                  student={currentStudentData}
                  onItemClick={handleShopItemClick}
                />
              )}

              {(activeNav === 'leaderboard' || activeNav === 'checkin') && (
                <ClassLeaderboardView
                  currentStudent={currentStudentData}
                  allStudents={studentsList}
                  onCheckIn={handleCheckIn}
                  onUpdateStudentData={handleUpdateStudentData}
                />
              )}

              {activeNav === 'social' && (
                <FlowerGiftingModal
                  currentStudent={currentStudentData}
                  allStudents={studentsList}
                  onSendFlower={handleSendFlower}
                />
              )}
            </>
          )
        )}
      </main>

      {/* Party Room Modal */}
      {isPartyModalOpen && currentStudentData && (
        <PartyRoomModal
          currentStudent={currentStudentData}
          activeParty={activeParty}
          allStudents={studentsList}
          onHostParty={handleHostParty}
          onJoinParty={handleJoinParty}
          onSendPartyGift={handleSendPartyGift}
          onCloseParty={handleCloseParty}
          onCloseModal={() => setIsPartyModalOpen(false)}
          onNavigateToShop={() => {
            setIsPartyModalOpen(false);
            setActiveNav('shop');
          }}
        />
      )}

      {/* Football Game Modal */}
      {isFootballModalOpen && currentStudentData && (
        <FootballGameModal
          student={currentStudentData}
          allStudents={studentsList}
          onClose={() => setIsFootballModalOpen(false)}
          onUpdateHighScore={(studentId, score) => {
            syncStudentUpdate(studentId, { footballHighScore: score });
          }}
          onRecordPlaySession={(studentId, dateStr) => {
            syncStudentUpdate(studentId, { lastFootballPlayedDate: dateStr });
          }}
        />
      )}

      {/* Dream Garden Modal */}
      {isGardenModalOpen && currentStudentData && (
        <DreamGardenModal
          student={currentStudentData}
          allStudents={studentsList}
          onClose={() => setIsGardenModalOpen(false)}
          onWaterPlant={handleWaterPlant}
          onHarvestFlower={handleHarvestFlower}
        />
      )}
    </div>
  );
}
