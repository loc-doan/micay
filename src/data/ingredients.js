// src/data/ingredients.js
// All ingredient definitions for the game

export const INGREDIENTS = {
  noodle: {
    id: 'noodle',
    name: 'Mì',
    nameEn: 'Noodle',
    color: 0xF5DEB3,
    secondaryColor: 0xDEB887,
    icon: 'noodle',
    category: 'base'
  },
  shrimp: {
    id: 'shrimp',
    name: 'Tôm',
    nameEn: 'Shrimp',
    color: 0xFF6B6B,
    secondaryColor: 0xFF4444,
    icon: 'shrimp',
    category: 'protein'
  },
  squid: {
    id: 'squid',
    name: 'Mực',
    nameEn: 'Squid',
    color: 0xE8E8E8,
    secondaryColor: 0xC0C0C0,
    icon: 'squid',
    category: 'protein'
  },
  fish: {
    id: 'fish',
    name: 'Cá',
    nameEn: 'Fish',
    color: 0xFFD700,
    secondaryColor: 0xFFA500,
    icon: 'fish',
    category: 'protein'
  },
  chicken: {
    id: 'chicken',
    name: 'Đùi Gà',
    nameEn: 'Chicken',
    color: 0xDEB887,
    secondaryColor: 0xCD853F,
    icon: 'chicken',
    category: 'protein'
  },
  beef: {
    id: 'beef',
    name: 'Bò Mỹ',
    nameEn: 'Beef',
    color: 0x8B0000,
    secondaryColor: 0x6B0000,
    icon: 'beef',
    category: 'protein'
  },
  vegetable: {
    id: 'vegetable',
    name: 'Rau',
    nameEn: 'Vegetable',
    color: 0x32CD32,
    secondaryColor: 0x228B22,
    icon: 'vegetable',
    category: 'topping'
  },
  mushroom: {
    id: 'mushroom',
    name: 'Nấm',
    nameEn: 'Mushroom',
    color: 0x8B4513,
    secondaryColor: 0x6B3410,
    icon: 'mushroom',
    category: 'topping'
  },
  sausage: {
    id: 'sausage',
    name: 'Xúc Xích',
    nameEn: 'Sausage',
    color: 0xCC4400,
    secondaryColor: 0x993300,
    icon: 'sausage',
    category: 'protein'
  },
  egg: {
    id: 'egg',
    name: 'Trứng',
    nameEn: 'Egg',
    color: 0xFFF8DC,
    secondaryColor: 0xFFD700,
    icon: 'egg',
    category: 'topping'
  },
  spice: {
    id: 'spice',
    name: 'Gia Vị',
    nameEn: 'Spice',
    color: 0xFF2200,
    secondaryColor: 0xCC0000,
    icon: 'spice',
    category: 'seasoning'
  },
  broth: {
    id: 'broth',
    name: 'Nước Dùng',
    nameEn: 'Broth',
    color: 0xDAA520,
    secondaryColor: 0xB8860B,
    icon: 'broth',
    category: 'liquid'
  }
};

export const INGREDIENT_LIST = Object.values(INGREDIENTS);

export default INGREDIENTS;

