import React, { useState } from 'react';
import { Student, ShopCategoryKey, ShopItem } from '../types';
import { SHOP_CATEGORIES } from '../data';
import { Search, Check, Lock, Sparkles, Filter, Tag } from 'lucide-react';

interface ShopViewProps {
  student: Student;
  onItemClick: (item: ShopItem, categoryKey: ShopCategoryKey) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ student, onItemClick }) => {
  const [activeTab, setActiveTab] = useState<ShopCategoryKey>('houses');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'locked'>('all');

  const categoryTabs: { id: ShopCategoryKey; label: string; icon: string }[] = [
    { id: 'houses', label: '房屋庄园', icon: '🏠' },
    { id: 'vehicles', label: '酷炫交通', icon: '🏎️' },
    { id: 'facilities', label: '娱乐设施', icon: '⚽' },
    { id: 'pets', label: '守护萌宠', icon: '🐉' },
    { id: 'avatars', label: '个人头像', icon: '👑' },
  ];

  const currentItems = SHOP_CATEGORIES[activeTab] || [];

  const filteredItems = currentItems.filter((item) => {
    const isUnlocked = (student.unlocked || []).includes(item.id);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'unlocked' && !isUnlocked) return false;
    if (filterMode === 'locked' && isUnlocked) return false;
    return true;
  });

  const categoryToEquipKey: Record<ShopCategoryKey, keyof Student['equipped']> = {
    houses: 'house',
    vehicles: 'vehicle',
    facilities: 'facility',
    pets: 'pet',
    avatars: 'avatar',
  };

  const currentlyEquippedIcon = student.equipped?.[categoryToEquipKey[activeTab]];

  return (
    <div className="bg-[#140b2e]/90 border border-purple-800/50 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header & Balance Display */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-purple-800/40 pb-5">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span className="text-2xl">🏪</span> 6B 班级积分小卖部
          </h2>
          <p className="text-xs text-purple-300/70 mt-1">
            使用平时好表现积累的金币兑换道具，打造专属个性梦幻小岛！
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1c0f42] border border-amber-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-amber-300 font-mono font-black text-sm shadow">
            <span>🪙</span>
            <span>{student.coins || 0}</span>
            <span className="text-[10px] text-amber-400/70 font-normal">金币</span>
          </div>
          <div className="bg-[#1c0f42] border border-pink-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-pink-300 font-mono font-black text-sm shadow">
            <span>🌸</span>
            <span>{student.flowers || 0}</span>
            <span className="text-[10px] text-pink-400/70 font-normal">鲜花</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-[#1b103c] text-purple-300/70 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Sub-filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#180e3a]/60 border border-purple-800/40 p-3 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索商品名称..."
            className="w-full bg-[#100726] border border-purple-800/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-purple-400/50 outline-none focus:border-pink-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end text-xs font-bold">
          <span className="text-purple-300/60 text-[11px] mr-1 flex items-center gap-1">
            <Filter size={12} /> 筛选:
          </span>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterMode === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-[#1b103c] text-purple-300/70 hover:text-white'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterMode('unlocked')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterMode === 'unlocked'
                ? 'bg-emerald-600 text-white'
                : 'bg-[#1b103c] text-purple-300/70 hover:text-white'
            }`}
          >
            已拥有
          </button>
          <button
            onClick={() => setFilterMode('locked')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterMode === 'locked'
                ? 'bg-amber-600 text-white'
                : 'bg-[#1b103c] text-purple-300/70 hover:text-white'
            }`}
          >
            未解锁
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isUnlocked = (student.unlocked || []).includes(item.id);
          const canAfford = student.coins >= item.price;

          // Special logic for Pet Eggs
          const isPetCategory = activeTab === 'pets';
          const requiredExp = item.requiredExp || 200;
          const isHatched = isPetCategory && isUnlocked && (student.petExp || 0) >= requiredExp;

          const displayIcon = isPetCategory
            ? isHatched
              ? item.hatchedIcon || '🐧'
              : item.icon || '🥚'
            : item.icon;

          const displayName = isPetCategory
            ? isHatched
              ? `${item.hatchedName} ✨`
              : item.name
            : item.name;

          const isEquipped = currentlyEquippedIcon === displayIcon;

          return (
            <div
              key={item.id}
              onClick={() => onItemClick(item, activeTab)}
              className={`relative bg-[#1a0f3d] border rounded-3xl p-4 flex flex-col items-center justify-between text-center transition-all cursor-pointer group hover:scale-[1.03] ${
                isEquipped
                  ? 'border-pink-500/80 bg-purple-900/30 shadow-[0_0_20px_rgba(236,72,153,0.25)]'
                  : isUnlocked
                  ? 'border-purple-600/60 hover:border-purple-400'
                  : 'border-purple-900/50 hover:border-amber-500/60'
              }`}
            >
              {/* Badges */}
              {isEquipped ? (
                <span className="absolute top-3 right-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                  <Check size={10} /> 已装备
                </span>
              ) : isUnlocked ? (
                isPetCategory ? (
                  isHatched ? (
                    <span className="absolute top-3 right-3 bg-pink-950 border border-pink-500/60 text-pink-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <Sparkles size={10} /> 已破壳
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-amber-950 border border-amber-500/60 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      🥚 孵化中
                    </span>
                  )
                ) : (
                  <span className="absolute top-3 right-3 bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    已拥有
                  </span>
                )
              ) : null}

              {/* Item Icon */}
              <div className="relative text-5xl my-2 group-hover:scale-110 transition-transform flex flex-col items-center justify-center">
                <span>{displayIcon}</span>
                {item.id === 'h3' && (
                  <div className="flex items-center gap-1 text-xs text-cyan-300 font-bold mt-1 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    <span>🌊</span>
                    <span className="text-[10px]">蔚蓝大海</span>
                    <span>🌊</span>
                  </div>
                )}
              </div>

              {/* Name & Description */}
              <div className="w-full">
                <h3 className="font-bold text-sm text-white">{displayName}</h3>
                {isPetCategory && isUnlocked && !isHatched ? (
                  <p className="text-[10px] text-amber-300/90 font-mono mt-1">
                    当前 EXP: {student.petExp || 0} / {requiredExp}
                  </p>
                ) : item.description ? (
                  <p className="text-[10px] text-purple-300/60 mt-1 line-clamp-1">
                    {item.description}
                  </p>
                ) : null}
              </div>

              {/* Status Action Button */}
              <div className="w-full mt-4">
                {isEquipped ? (
                  <button className="w-full bg-pink-950/60 border border-pink-500/50 text-pink-300 font-bold text-xs py-2 rounded-xl">
                    正在使用
                  </button>
                ) : isUnlocked ? (
                  isPetCategory && !isHatched ? (
                    <button className="w-full bg-amber-900/60 border border-amber-500/50 text-amber-200 font-bold text-xs py-2 rounded-xl shadow transition">
                      🥚 孵化中 (去小岛喂食)
                    </button>
                  ) : (
                    <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 rounded-xl shadow transition">
                      点击装备
                    </button>
                  )
                ) : (
                  <button
                    className={`w-full font-bold text-xs py-2 rounded-xl shadow transition flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black'
                        : 'bg-[#1f1345] border border-purple-800 text-purple-400/60 cursor-not-allowed'
                    }`}
                  >
                    {!canAfford && <Lock size={12} />}
                    <span>🪙 {item.price} 金币</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-[#12082b] rounded-2xl border border-purple-900/30">
          <Tag className="w-10 h-10 text-purple-500/40 mx-auto mb-2" />
          <p className="text-sm font-bold text-purple-300/70">没有找到匹配的商品</p>
        </div>
      )}
    </div>
  );
};
