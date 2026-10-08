// src/data/dishes.js
// All dish definitions for the game

export const DISHES = {
  spicy_seafood_noodle: {
    id: 'spicy_seafood_noodle',
    name: 'Mì Cay Hải Sản',
    nameEn: 'Spicy Seafood Noodle',
    ingredients: ['noodle', 'shrimp', 'squid', 'vegetable', 'mushroom', 'broth', 'spice'],
    requiredIngredients: ['noodle', 'shrimp', 'squid', 'broth', 'spice'],
    optionalIngredients: ['vegetable', 'mushroom'],
    cookingTime: 8000,
    price: 120,
    spiceLevel: 3,
    primaryColor: 0xFF4500,
    bowlColor: 0xFFE4B5,
    description: 'Mì cay đặc trưng với hải sản tươi ngon'
  },
  spicy_fish_noodle: {
    id: 'spicy_fish_noodle',
    name: 'Mì Cay Cá',
    nameEn: 'Spicy Fish Noodle',
    ingredients: ['noodle', 'fish', 'vegetable', 'mushroom', 'broth', 'spice'],
    requiredIngredients: ['noodle', 'fish', 'broth', 'spice'],
    optionalIngredients: ['vegetable', 'mushroom'],
    cookingTime: 7000,
    price: 100,
    spiceLevel: 2,
    primaryColor: 0xFF6600,
    bowlColor: 0xFFE4B5,
    description: 'Mì cay với cá tươi thơm ngon'
  },
  spicy_chicken_noodle: {
    id: 'spicy_chicken_noodle',
    name: 'Mì Cay Đùi Gà',
    nameEn: 'Spicy Chicken Noodle',
    ingredients: ['noodle', 'chicken', 'vegetable', 'mushroom', 'broth', 'spice'],
    requiredIngredients: ['noodle', 'chicken', 'broth', 'spice'],
    optionalIngredients: ['vegetable', 'mushroom'],
    cookingTime: 9000,
    price: 110,
    spiceLevel: 2,
    primaryColor: 0xFF8C00,
    bowlColor: 0xFFE4B5,
    description: 'Mì cay với đùi gà đậm đà'
  },
  spicy_beef_noodle: {
    id: 'spicy_beef_noodle',
    name: 'Mì Cay Bò Mỹ',
    nameEn: 'Spicy Beef Noodle',
    ingredients: ['noodle', 'beef', 'vegetable', 'mushroom', 'broth', 'spice'],
    requiredIngredients: ['noodle', 'beef', 'broth', 'spice'],
    optionalIngredients: ['vegetable', 'mushroom'],
    cookingTime: 10000,
    price: 150,
    spiceLevel: 3,
    primaryColor: 0xCC2200,
    bowlColor: 0xFFE4B5,
    description: 'Mì cay với thịt bò Mỹ nhập khẩu'
  },
  spicy_sausage_noodle: {
    id: 'spicy_sausage_noodle',
    name: 'Mì Cay Xúc Xích',
    nameEn: 'Spicy Sausage Noodle',
    ingredients: ['noodle', 'sausage', 'egg', 'vegetable', 'broth', 'spice'],
    requiredIngredients: ['noodle', 'sausage', 'broth', 'spice'],
    optionalIngredients: ['egg', 'vegetable'],
    cookingTime: 7500,
    price: 90,
    spiceLevel: 2,
    primaryColor: 0xFF5500,
    bowlColor: 0xFFE4B5,
    description: 'Mì cay với xúc xích và trứng'
  },
  spicy_special_noodle: {
    id: 'spicy_special_noodle',
    name: 'Mì Cay Thập Cẩm',
    nameEn: 'Spicy Special Noodle',
    ingredients: ['noodle', 'shrimp', 'beef', 'sausage', 'egg', 'vegetable', 'mushroom', 'broth', 'spice'],
    requiredIngredients: ['noodle', 'shrimp', 'beef', 'broth', 'spice'],
    optionalIngredients: ['sausage', 'egg', 'vegetable', 'mushroom'],
    cookingTime: 12000,
    price: 180,
    spiceLevel: 4,
    primaryColor: 0xAA0000,
    bowlColor: 0xFFE4B5,
    description: 'Mì cay đặc biệt với đầy đủ topping'
  }
};

export const DISH_LIST = Object.values(DISHES);

export default DISHES;

