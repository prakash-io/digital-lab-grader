const avatarGrid = document.getElementById("avatarGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const notification = document.getElementById("notification");
const coinsValue = document.getElementById("coinsValue");

let coins = 10000;

// Updated avatars with guaranteed working image links
const avatars = [
  // Common
  { name: "Cool Fox", rarity: "common", price: 500, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Fox" },
  { name: "Happy Cat", rarity: "common", price: 600, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Cat" },
  { name: "Lazy Panda", rarity: "common", price: 650, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Panda" },
  { name: "Cheerful Dog", rarity: "common", price: 550, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Dog" },
  { name: "Brave Tiger", rarity: "common", price: 700, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Tiger" },

  // Rare
  { name: "Cyber Cat", rarity: "rare", price: 1200, img: "https://api.dicebear.com/8.x/bottts/svg?seed=CyberCat" },
  { name: "Shadow Ninja", rarity: "rare", price: 1400, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Ninja" },
  { name: "Blue Ghost", rarity: "rare", price: 1300, img: "https://api.dicebear.com/8.x/fun-emoji/svg?seed=Ghost" },
  { name: "Alien Buddy", rarity: "rare", price: 1500, img: "https://api.dicebear.com/8.x/bottts/svg?seed=Alien" },
  { name: "Robo Owl", rarity: "rare", price: 1600, img: "https://api.dicebear.com/8.x/bottts/svg?seed=Owl" },

  // Epic
  { name: "Neon Wolf", rarity: "epic", price: 2500, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Wolf" },
  { name: "Galaxy Hero", rarity: "epic", price: 3000, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=GalaxyHero" },
  { name: "Mecha Titan", rarity: "epic", price: 3200, img: "https://api.dicebear.com/8.x/bottts/svg?seed=Titan" },
  { name: "Space Commander", rarity: "epic", price: 2800, img: "https://api.dicebear.com/8.x/bottts/svg?seed=Commander" },
  { name: "Star Guardian", rarity: "epic", price: 3100, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=StarGuardian" },

  // Legendary
  { name: "Golden Eagle", rarity: "legendary", price: 5000, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Eagle" },
  { name: "Royal Dragon", rarity: "legendary", price: 5200, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Dragon" },
  { name: "Crystal Phoenix", rarity: "legendary", price: 5500, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Phoenix" },
  { name: "Dark King", rarity: "legendary", price: 6000, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=King" },
  { name: "Lunar Queen", rarity: "legendary", price: 5800, img: "https://api.dicebear.com/8.x/adventurer/svg?seed=Queen" }
];

// Render avatars
function displayAvatars(filter = "all") {
  avatarGrid.innerHTML = "";
  avatars
    .filter(a => filter === "all" || a.rarity === filter)
    .forEach(a => {
      const card = document.createElement("div");
      card.classList.add("avatar-card");
      card.innerHTML = `
        <img src="${a.img}" alt="${a.name}">
        <h3>${a.name}</h3>
        <p>${a.rarity.toUpperCase()} • ${a.price} 🪙</p>
        <button class="buy-btn">Buy</button>
      `;
      card.querySelector(".buy-btn").addEventListener("click", () => buyAvatar(a));
      avatarGrid.appendChild(card);
    });
}

// Buying logic
function buyAvatar(a) {
  if (coins >= a.price) {
    coins -= a.price;
    coinsValue.textContent = coins.toLocaleString();
    showNotification(`✅ You bought ${a.name} for ${a.price} coins!`);
  } else {
    showNotification(`❌ Not enough coins to buy ${a.name}!`);
  }
}

// Notification
function showNotification(message) {
  notification.textContent = message;
  notification.classList.add("show");
  setTimeout(() => notification.classList.remove("show"), 2500);
}

// Filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    displayAvatars(btn.dataset.filter);
  });
});

// Initial render
displayAvatars();
