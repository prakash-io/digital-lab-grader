// Avatar data - shared across components
export const avatars = [
  // Common
  { id: 1, name: "Cool Fox", rarity: "common", price: 500, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Fox" },
  { id: 2, name: "Happy Cat", rarity: "common", price: 600, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Cat" },
  { id: 3, name: "Lazy Panda", rarity: "common", price: 650, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Panda" },
  { id: 4, name: "Cheerful Dog", rarity: "common", price: 550, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Dog" },
  { id: 5, name: "Brave Tiger", rarity: "common", price: 700, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Tiger" },

  // Rare
  { id: 6, name: "Cyber Cat", rarity: "rare", price: 1200, img: "https://api.dicebear.com/8.x/bottts/svg?seed=CyberCat" },
  { id: 7, name: "Shadow Ninja", rarity: "rare", price: 1400, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Ninja" },
  { id: 8, name: "Blue Ghost", rarity: "rare", price: 1300, img: "https://api.dicebear.com/8.x/fun-emoji/svg?seed=Ghost" },
  { id: 9, name: "Alien Buddy", rarity: "rare", price: 1500, img: "https://api.dicebear.com/8.x/bottts/svg?seed=Alien" },
  { id: 10, name: "Robo Owl", rarity: "rare", price: 1600, img: "https://api.dicebear.com/8.x/bottts/svg?seed=Owl" },

  // Epic
  { id: 11, name: "Neon Wolf", rarity: "epic", price: 2500, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Wolf" },
  { id: 12, name: "Galaxy Hero", rarity: "epic", price: 3000, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=GalaxyHero" },
  { id: 13, name: "Mecha Titan", rarity: "epic", price: 3200, img: "https://api.dicebear.com/8.x/bottts/svg?seed=Titan" },
  { id: 14, name: "Space Commander", rarity: "epic", price: 2800, img: "https://api.dicebear.com/8.x/bottts/svg?seed=Commander" },
  { id: 15, name: "Star Guardian", rarity: "epic", price: 3100, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=StarGuardian" },

  // Legendary
  { id: 16, name: "Golden Eagle", rarity: "legendary", price: 5000, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Eagle" },
  { id: 17, name: "Royal Dragon", rarity: "legendary", price: 5200, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Dragon" },
  { id: 18, name: "Crystal Phoenix", rarity: "legendary", price: 5500, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Phoenix" },
  { id: 19, name: "Dark King", rarity: "legendary", price: 6000, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=King" },
  { id: 20, name: "Lunar Queen", rarity: "legendary", price: 5800, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Queen" }
];

export const getUserData = (userId) => {
  const data = localStorage.getItem(`userData_${userId}`);
  return data ? JSON.parse(data) : { coins: 10000, purchasedAvatars: [] };
};

export const saveUserData = (userId, data) => {
  localStorage.setItem(`userData_${userId}`, JSON.stringify(data));
};

