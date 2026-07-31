import React, { useState } from 'react';
import { Student } from '../types';
import confetti from 'canvas-confetti';
import { Heart, Gift, Trophy, Send, Sparkles, MessageSquare, Search } from 'lucide-react';

interface FlowerGiftingModalProps {
  currentStudent: Student;
  allStudents: Student[];
  onSendFlower: (targetStudentId: number, count: number, message: string) => void;
}

export const FlowerGiftingModal: React.FC<FlowerGiftingModalProps> = ({
  currentStudent,
  allStudents,
  onSendFlower,
}) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);
  const [flowerCount, setFlowerCount] = useState<number>(1);
  const [selectedTag, setSelectedTag] = useState<string>('学习进步！');
  const [customMsg, setCustomMsg] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'send' | 'received'>('send');

  const presetTags = [
    '学习进步！',
    '热心助人！',
    '团结友爱！',
    '字迹工整！',
    '思维敏捷！',
    '劳动积极！',
  ];

  const receivedList = currentStudent.receivedFlowers ? [...currentStudent.receivedFlowers].reverse() : [];

  // Leaderboard sorted by flowers
  const sortedByFlowers = [...allStudents].sort((a, b) => (b.flowers || 0) - (a.flowers || 0));

  // Filter recipient candidates (exclude self)
  const recipientCandidates = allStudents.filter(
    (s) => s.id !== currentStudent.id && s.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSend = () => {
    if (!selectedRecipientId) {
      setStatusMsg('请先选择要送花赠送的同学！');
      setTimeout(() => setStatusMsg(null), 2500);
      return;
    }

    if ((currentStudent.flowers || 0) < flowerCount) {
      setStatusMsg(`鲜花数量不足！你当前只有 ${currentStudent.flowers || 0} 朵鲜花`);
      setTimeout(() => setStatusMsg(null), 2500);
      return;
    }

    const recipient = allStudents.find((s) => s.id === selectedRecipientId);
    if (!recipient) return;

    const messageToSend = customMsg.trim() || selectedTag;
    onSendFlower(selectedRecipientId, flowerCount, messageToSend);

    setStatusMsg(`成功向 ${recipient.name} 赠送了 ${flowerCount} 朵鲜花！🌸`);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });

    setCustomMsg('');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="bg-[#140b2e]/90 border border-purple-800/50 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Title & Navigation Tabs */}
      <div className="border-b border-purple-800/40 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Heart size={22} className="text-pink-400 fill-pink-400" />
            6B 班级友爱送花与互动寄语
          </h2>
          <p className="text-xs text-purple-300/70 mt-1">
            将赞赏的鲜花送给互相鼓励的同学，阅读大家送给你的暖心鼓励表达！
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-[#0c061d] p-1 rounded-2xl border border-purple-800/50 flex items-center gap-1 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('send')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'send'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Gift size={14} />
              <span>赠送与榜单</span>
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative ${
                activeTab === 'received'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <MessageSquare size={14} />
              <span>我收到的表达</span>
              {receivedList.length > 0 && (
                <span className="bg-pink-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {receivedList.length}
                </span>
              )}
            </button>
          </div>

          <div className="bg-[#1c0f42] border border-pink-500/40 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-pink-300 font-mono font-black text-xs shadow whitespace-nowrap">
            <span>我的鲜花: 🌸</span>
            <span>{currentStudent.flowers || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'send' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Send Flower Form */}
          <div className="lg:col-span-7 bg-[#180e3a]/80 border border-purple-800/50 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-purple-800/40 pb-2">
              <Gift size={16} className="text-pink-400" />
              赠送鲜花给同学
            </h3>

            {statusMsg && (
              <div className="bg-purple-950 border border-pink-500 text-pink-200 text-xs font-bold p-3 rounded-2xl animate-fade-in">
                {statusMsg}
              </div>
            )}

            {/* Recipient Selector */}
            <div>
              <label className="text-xs font-bold text-purple-200 mb-2 block">1. 选择赠送对象：</label>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="搜索同学姓名或编号..."
                  className="w-full bg-[#100726] border border-purple-800/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-purple-400/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-[#100726] border border-purple-900/40 rounded-2xl">
                {recipientCandidates.map((s) => {
                  const isSelected = selectedRecipientId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedRecipientId(s.id)}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                          : 'bg-[#1b103c] border-purple-900/50 text-purple-200 hover:border-purple-600'
                      }`}
                    >
                      <span>{s.equipped?.avatar || '👧'}</span>
                      <span className="truncate">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount selection */}
            <div>
              <label className="text-xs font-bold text-purple-200 mb-2 block">2. 选择鲜花数量：</label>
              <div className="flex gap-2">
                {[1, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFlowerCount(num)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                      flowerCount === num
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 border-pink-400 text-white shadow'
                        : 'bg-[#1b103c] border-purple-800/50 text-purple-300 hover:text-white'
                    }`}
                  >
                    🌸 {num} 朵
                  </button>
                ))}
              </div>
            </div>

            {/* Encouragement Tag / Custom Message */}
            <div>
              <label className="text-xs font-bold text-purple-200 mb-2 block">3. 附上鼓励表达：</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {presetTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setCustomMsg('');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                      selectedTag === tag && !customMsg
                        ? 'bg-purple-600 text-white border border-purple-400'
                        : 'bg-[#1b103c] text-purple-300/70 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="或者填写一句个性鼓励寄语..."
                className="w-full bg-[#100726] border border-purple-800/60 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-400/50 outline-none focus:border-pink-500"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSend}
              className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-sm py-3 rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Send size={16} />
              <span>确认向同学送出鲜花 🌸</span>
            </button>
          </div>

          {/* Right 5 cols: Class 6B Flower Leaderboard */}
          <div className="lg:col-span-5 bg-[#180e3a]/80 border border-purple-800/50 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center justify-between border-b border-purple-800/40 pb-2">
              <span className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                6B 班级鲜花集赞榜
              </span>
              <span className="text-[10px] text-purple-300/60 font-mono">前 10 名</span>
            </h3>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {sortedByFlowers.slice(0, 10).map((student, rank) => {
                let medal = `Rank ${rank + 1}`;
                let medalBg = 'bg-[#1b103c] border-purple-800/50 text-purple-300';
                if (rank === 0) {
                  medal = '🥇 冠军';
                  medalBg = 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold';
                } else if (rank === 1) {
                  medal = '🥈 亚军';
                  medalBg = 'bg-slate-300/20 border-slate-300/60 text-slate-200 font-bold';
                } else if (rank === 2) {
                  medal = '🥉 季军';
                  medalBg = 'bg-amber-700/20 border-amber-600/60 text-amber-400 font-bold';
                }

                return (
                  <div
                    key={student.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${medalBg}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold w-12 text-center">{medal}</span>
                      <span className="text-xl">{student.equipped?.avatar || '👧'}</span>
                      <div>
                        <h4 className="font-bold text-xs text-white">{student.name}</h4>
                        <p className="text-[10px] text-purple-300/60">编号 #{student.id}</p>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-black text-pink-300 bg-[#12082e] px-2.5 py-1 rounded-xl border border-pink-500/30">
                      🌸 {student.flowers || 0} 朵
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Received Encouragement Messages Tab */
        <div className="bg-[#180e3a]/80 border border-purple-800/50 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-pink-400" />
              我收到的同窗鲜花与鼓励表达 ({receivedList.length} 条)
            </h3>
            <span className="text-xs text-purple-300/60">温暖问候与肯定</span>
          </div>

          {receivedList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-5xl">💌</div>
              <p className="text-xs text-purple-300/70">暂时还没有收到同学送出的鲜花和鼓励寄语哦～</p>
              <p className="text-[11px] text-purple-400/50">向同学送出第一朵鲜花，开启同窗温暖互助吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {receivedList.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#100726] border border-purple-800/60 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-2 hover:border-pink-500/50 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-pink-950 border border-pink-500/40 flex items-center justify-center text-sm font-bold text-pink-300">
                        🌸
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">来自: {item.from}</span>
                        <span className="text-[10px] text-purple-400/60 font-mono">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '刚刚'}
                        </span>
                      </div>
                    </div>

                    <span className="bg-pink-900/40 border border-pink-500/40 text-pink-300 text-xs font-black px-2.5 py-1 rounded-xl font-mono">
                      🌸 +{item.count || 1} 朵
                    </span>
                  </div>

                  <div className="bg-[#1a0f3d] border border-purple-800/40 rounded-xl p-3 text-xs text-purple-100 font-medium flex items-center gap-2">
                    <Sparkles size={14} className="text-pink-400 shrink-0" />
                    <span className="italic">“{item.message}”</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
