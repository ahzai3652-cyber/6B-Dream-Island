import { Student, ShopItem, ShopCategoryKey } from './types';

export const TEACHER_CODE = "teacher888";

const COOL_AVATARS = ['🦸‍♂️', '🦸‍♀️', '🥷', '👸', '🤴', '👩‍🎤', '🧑‍🎤', '🧝‍♀️', '🧝‍♂️', '🧚‍♀️', '🧛‍♂️', '🕶️', '🦊', '🦁'];

export const INITIAL_STUDENTS_TEMPLATE: Student[] = [
  "阿言", "锺穅杰", "杨宇俊", "菲乐", "彭家勇", "杰邓", "林晨夕", "郭宇轩", "阿吉", "义可丹",
  "迪尼", "哈迪夫", "米查", "温俊希", "卫沙", "廖嘉辉", "艾丝拉", "艾莎", "安丽娜", "陈琦琦",
  "菲卡", "蓝乙炫", "马来卡", "戴苡蒽", "陈仪彤", "黛妮雅", "迪菲娜", "莎菲卡", "王芯茹", "盘卓恩",
  "丽娃娜", "丽娜", "陈慧瑜", "陈禹瑄", "陈芝萱", "杜安妮亚", "黄思恩"
].map((name, index) => ({
  id: index + 1,
  name,
  code: `${index + 1}`,
  coins: 0,
  flowers: 0,
  petExp: 0,
  equipped: {
    avatar: '',
    house: '',
    vehicle: '',
    facility: '',
    pet: ''
  },
  unlocked: [],
  streak: 0,
  receivedFlowers: []
}));

export const SHOP_CATEGORIES: Record<ShopCategoryKey, ShopItem[]> = {
  houses: [
    { id: 'h1', name: '温馨木屋', price: 100, icon: '🏠', description: '自然舒适的小木屋' },
    { id: 'h2', name: '梦幻树屋', price: 300, icon: '🏡', description: '藏在森林里的树顶庄园' },
    { id: 'h3', name: '海景别墅', price: 800, icon: '🏘️', description: '阳光沙滩边的无敌海景豪宅' },
    { id: 'h4', name: '梦幻城堡', price: 1500, icon: '🏰', description: '美轮美奂的童话城堡' },
    { id: 'h5', name: '豪华宫殿', price: 2500, icon: '🏯', description: '金碧辉煌的奢华宫殿' },
  ],
  vehicles: [
    { id: 'v1', name: '踏板摩托', price: 150, icon: '🛵', description: '复古轻便的城市代步车' },
    { id: 'v2', name: '酷炫跑车', price: 500, icon: '🏎️', description: '极速飞驰的赛道超跑' },
    { id: 'v3', name: '酷炫直升机', price: 1200, icon: '🚁', description: '穿梭于小岛上空的飞行器' },
    { id: 'v4', name: '星际火箭', price: 2000, icon: '🚀', description: '探索未知星域的重型火箭' },
    { id: 'v5', name: '彩虹飞碟', price: 3000, icon: '🛸', description: '带有七彩光效的神秘飞碟' },
  ],
  facilities: [
    { id: 'f1', name: '足球草场', price: 200, icon: '⚽', description: '绿荫如毯的活力足球场' },
    { id: 'f2', name: '梦幻花园', price: 350, icon: '🌷', description: '百花齐放的馨香花园' },
    { id: 'f3', name: '七彩摩天轮', price: 900, icon: '🎡', description: '缓缓旋转的浪漫观景轮' },
    { id: 'f4', name: 'K-Pop演播楼', price: 1600, icon: '🏢', description: '舞台灯光与音乐交相辉映' },
    { id: 'f5', name: '水上乐园', price: 2500, icon: '⛲', description: '清凉消暑的喷泉水上乐园' },
  ],
  pets: [
    {
      id: 'p1',
      name: '软萌企鹅蛋',
      price: 100,
      icon: '🥚',
      description: '温柔孕育中的极地企鹅蛋，通过喂食达到 200 EXP 即可破壳解锁真容并放去小岛！',
      hatchedName: '软萌小企鹅',
      hatchedIcon: '🐧',
      requiredExp: 200,
    },
    {
      id: 'p2',
      name: '机智柴犬蛋',
      price: 400,
      icon: '🥚',
      description: '蕴含阳光活力的忠诚柴犬蛋，通过喂食达到 500 EXP 即可破壳解锁真容并放去小岛！',
      hatchedName: '机智柴犬',
      hatchedIcon: '🐕',
      requiredExp: 500,
    },
    {
      id: 'p3',
      name: '闪耀神龙蛋',
      price: 1000,
      icon: '🥚',
      description: '盘旋灵气的祥瑞神龙蛋，通过喂食达到 800 EXP 即可破壳解锁真容并放去小岛！',
      hatchedName: '闪耀神龙',
      hatchedIcon: '🐉',
      requiredExp: 800,
    },
    {
      id: 'p4',
      name: '太空独角兽蛋',
      price: 1800,
      icon: '🥚',
      description: '星辉围绕的传说独角兽蛋，通过喂食达到 1200 EXP 即可破壳解锁真容并放去小岛！',
      hatchedName: '太空独角兽',
      hatchedIcon: '🦄',
      requiredExp: 1200,
    },
    {
      id: 'p5',
      name: '功夫熊猫蛋',
      price: 2800,
      icon: '🥚',
      description: '古朴神秘的武艺熊猫蛋，通过喂食达到 1500 EXP 即可破壳解锁真容并放去小岛！',
      hatchedName: '功夫熊猫',
      hatchedIcon: '🐼',
      requiredExp: 1500,
    },
  ],
  avatars: [
    { id: 'a1', name: '绝影超人', price: 100, icon: '🦸‍♂️', description: '正义凛然、帅气逼人的超级英雄' },
    { id: 'a2', name: '幻彩女侠', price: 100, icon: '🦸‍♀️', description: '英姿飒爽、魅力四射的超级女侠' },
    { id: 'a3', name: '暗夜忍皇', price: 100, icon: '🥷', description: '神秘莫测、冷酷潇洒的极速忍者' },
    { id: 'a4', name: '绝美星皇', price: 100, icon: '👸', description: '高贵优雅、璀璨耀眼的星光公主' },
    { id: 'a5', name: '耀世王子', price: 100, icon: '🤴', description: '温润如玉、尊贵非凡的元气王子' },
    { id: 'a6', name: '朋克摇滚姬', price: 100, icon: '👩‍🎤', description: '潮流前线、炸裂全场的乐坛女神' },
    { id: 'a7', name: '闪光偶像', price: 100, icon: '🧑‍🎤', description: '万众瞩目、电音高颜值偶像男神' },
    { id: 'a8', name: '森林仙子', price: 100, icon: '🧝‍♀️', description: '清秀脱俗、灵动绝美的自然仙子' },
    { id: 'a9', name: '幻境法王', price: 100, icon: '🧝‍♂️', description: '清冷帅气、掌控自然的魔法精灵' },
    { id: 'a10', name: '梦幻精灵', price: 100, icon: '🧚‍♀️', description: '羽翼璀璨、散发幸运星光的花仙' },
    { id: 'a11', name: '纯血夜王', price: 100, icon: '🧛‍♂️', description: '神秘高贵、冷艳霸气的夜之王者' },
    { id: 'a12', name: '赛博潮客', price: 100, icon: '🕶️', description: '极具未来感的墨镜潮流教父' },
    { id: 'a13', name: '九尾狐仙', price: 100, icon: '🦊', description: '魅惑众生、智勇双全的灵动九尾狐' },
    { id: 'a14', name: '狂暴狮王', price: 100, icon: '🦁', description: '威风凛凛、统治全场的霸气狮王' },
    { id: 'a15', name: '荣耀至尊', price: 100, icon: '👑', description: '佩戴黄金帝冠、彰显全班第一人霸气' },
  ]
};

export function getPetEggInfo(petIdOrIcon: string, petExp: number = 0) {
  const petItem =
    SHOP_CATEGORIES.pets.find(
      (p) =>
        p.id === petIdOrIcon ||
        p.icon === petIdOrIcon ||
        p.hatchedIcon === petIdOrIcon ||
        p.name === petIdOrIcon ||
        p.hatchedName === petIdOrIcon
    ) || SHOP_CATEGORIES.pets[0];

  const requiredExp = petItem.requiredExp || 200;
  const isHatched = petExp >= requiredExp;

  return {
    petItem,
    requiredExp,
    isHatched,
    displayIcon: isHatched ? (petItem.hatchedIcon || '🐧') : '🥚',
    displayName: isHatched ? (petItem.hatchedName || '守护神兽') : petItem.name,
  };
}
