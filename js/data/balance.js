window.GAME_BALANCE = {
  economy: {
    startCoins: 120,
    buildTowerCost: 50,
    baseUpgradeCosts: [0, 100, 180, 300],
    towerUpgradeBaseCost: 70
  },

  progression: {
    wavesPerWorld: 20,
    bossEvery: 10,
    totalWorlds: 6,
    totalWaves: 120
  },

  worlds: [
    {
      id: "campaign",
      titleKey: "world_campaign",
      waveStart: 1,
      waveEnd: 20,
      mapAsset: "mapForest",
      towerStartLevel: 1,
      towerMaxLevel: 12,
      enemies: ["adept", "corrupted", "vampire", "bat"],
      boss: "vampireMother"
    },
    {
      id: "swamp",
      titleKey: "world_swamp",
      waveStart: 21,
      waveEnd: 40,
      mapAsset: "mapSwamp",
      towerStartLevel: 2,
      towerMaxLevel: 14,
      enemies: ["corrupted", "bat", "vampire", "swampVampire"],
      boss: "swampMother"
    },
    {
      id: "village",
      titleKey: "world_village",
      waveStart: 41,
      waveEnd: 60,
      mapAsset: "mapVillage",
      towerStartLevel: 4,
      towerMaxLevel: 16,
      enemies: ["corrupted", "vampire", "vampireNoble", "bat"],
      boss: "villageLord"
    },
    {
      id: "city",
      titleKey: "world_city",
      waveStart: 61,
      waveEnd: 80,
      mapAsset: "mapCity",
      towerStartLevel: 6,
      towerMaxLevel: 18,
      enemies: ["vampire", "vampireNoble", "ancientVampire", "bat"],
      boss: "cityDuke"
    },
    {
      id: "manor",
      titleKey: "world_manor",
      waveStart: 81,
      waveEnd: 100,
      mapAsset: "mapManor",
      towerStartLevel: 8,
      towerMaxLevel: 20,
      enemies: ["vampireNoble", "ancientVampire", "bat", "corrupted"],
      boss: "manorQueen"
    },
    {
      id: "cave",
      titleKey: "world_cave",
      waveStart: 101,
      waveEnd: 120,
      mapAsset: "mapCave",
      towerStartLevel: 10,
      towerMaxLevel: 22,
      enemies: ["ancientVampire", "bat", "vampireNoble", "corrupted"],
      boss: "ancientMother"
    }
  ],

  enemies: {
    adept: {
      labelKey: "enemy_adept",
      hp: 42,
      hpGrowth: 5,
      damage: 0.18,
      damageGrowth: 0.015,
      speed: 1.1,
      reward: 8,
      attackRange: 22,
      radius: 18,
      assetWalk: "vampireAdeptWalk",
      assetAttack: "vampireBasicAttack",
      assetDeath: "vampireBasicDeath",
      kind: "normal"
    },

    corrupted: {
      labelKey: "enemy_corrupted",
      hp: 70,
      hpGrowth: 7,
      damage: 0.24,
      damageGrowth: 0.018,
      speed: 0.88,
      reward: 12,
      attackRange: 24,
      radius: 22,
      assetWalk: "corruptedHumanWalk",
      assetAttack: "vampireBasicAttack",
      assetDeath: "vampireBasicDeath",
      kind: "normal"
    },

    vampire: {
      labelKey: "enemy_vampire",
      hp: 56,
      hpGrowth: 6,
      damage: 0.22,
      damageGrowth: 0.017,
      speed: 1.0,
      reward: 10,
      attackRange: 22,
      radius: 20,
      assetWalk: "vampireBasicWalk",
      assetAttack: "vampireBasicAttack",
      assetDeath: "vampireBasicDeath",
      kind: "normal"
    },

    bat: {
      labelKey: "enemy_bat",
      hp: 28,
      hpGrowth: 4,
      damage: 0.13,
      damageGrowth: 0.012,
      speed: 1.65,
      reward: 7,
      attackRange: 18,
      radius: 15,
      assetWalk: "batSwarmWalk",
      assetAttack: "vampireBasicAttack",
      assetDeath: "vampireBasicDeath",
      kind: "normal"
    },

    swampVampire: {
      labelKey: "enemy_swamp_vampire",
      hp: 88,
      hpGrowth: 8,
      damage: 0.27,
      damageGrowth: 0.02,
      speed: 0.92,
      reward: 14,
      attackRange: 24,
      radius: 23,
      assetWalk: "vampireTankWalk",
      assetAttack: "vampireBasicAttack",
      assetDeath: "vampireBasicDeath",
      kind: "normal"
    },

    vampireNoble: {
      labelKey: "enemy_vampire_noble",
      hp: 110,
      hpGrowth: 10,
      damage: 0.32,
      damageGrowth: 0.025,
      speed: 0.95,
      reward: 18,
      attackRange: 26,
      radius: 24,
      assetWalk: "vampireNobleWalk",
      assetAttack: "vampireBasicAttack",
      assetDeath: "vampireBasicDeath",
      kind: "elite"
    },

    ancientVampire: {
      labelKey: "enemy_ancient_vampire",
      hp: 150,
      hpGrowth: 13,
      damage: 0.38,
      damageGrowth: 0.03,
      speed: 0.82,
      reward: 24,
      attackRange: 28,
      radius: 27,
      assetWalk: "ancientVampireWalk",
      assetAttack: "vampireBasicAttack",
      assetDeath: "vampireBasicDeath",
      kind: "elite"
    },

    vampireMother: {
      labelKey: "enemy_vampire_mother",
      hp: 420,
      hpGrowth: 24,
      damage: 0.75,
      damageGrowth: 0.05,
      speed: 0.72,
      reward: 80,
      attackRange: 34,
      radius: 34,
      assetWalk: "vampireMotherWalk",
      assetAttack: "vampireMotherAttack",
      assetDeath: "vampireMotherDeath",
      kind: "boss"
    },

    swampMother: {
      labelKey: "enemy_swamp_mother",
      hp: 560,
      hpGrowth: 30,
      damage: 0.9,
      damageGrowth: 0.055,
      speed: 0.68,
      reward: 110,
      attackRange: 36,
      radius: 36,
      assetWalk: "swampMotherWalk",
      assetAttack: "vampireMotherAttack",
      assetDeath: "vampireMotherDeath",
      kind: "boss"
    },

    villageLord: {
      labelKey: "enemy_village_lord",
      hp: 720,
      hpGrowth: 36,
      damage: 1.05,
      damageGrowth: 0.06,
      speed: 0.72,
      reward: 140,
      attackRange: 38,
      radius: 38,
      assetWalk: "villageLordWalk",
      assetAttack: "vampireMotherAttack",
      assetDeath: "vampireMotherDeath",
      kind: "boss"
    },

    cityDuke: {
      labelKey: "enemy_city_duke",
      hp: 900,
      hpGrowth: 42,
      damage: 1.25,
      damageGrowth: 0.065,
      speed: 0.76,
      reward: 170,
      attackRange: 40,
      radius: 40,
      assetWalk: "cityDukeWalk",
      assetAttack: "vampireMotherAttack",
      assetDeath: "vampireMotherDeath",
      kind: "boss"
    },

    manorQueen: {
      labelKey: "enemy_manor_queen",
      hp: 1100,
      hpGrowth: 48,
      damage: 1.45,
      damageGrowth: 0.07,
      speed: 0.78,
      reward: 220,
      attackRange: 42,
      radius: 42,
      assetWalk: "manorQueenWalk",
      assetAttack: "vampireMotherAttack",
      assetDeath: "vampireMotherDeath",
      kind: "boss"
    },

    ancientMother: {
      labelKey: "enemy_ancient_mother",
      hp: 1400,
      hpGrowth: 60,
      damage: 1.75,
      damageGrowth: 0.08,
      speed: 0.7,
      reward: 300,
      attackRange: 44,
      radius: 46,
      assetWalk: "ancientMotherWalk",
      assetAttack: "vampireMotherAttack",
      assetDeath: "vampireMotherDeath",
      kind: "boss"
    }
  },

  baseLevels: {
    1: { hp: 260, dps: 7, range: 170, asset: "base1" },
    2: { hp: 380, dps: 11, range: 185, asset: "base2" },
    3: { hp: 560, dps: 16, range: 205, asset: "base3" }
  },

  towerTypes: {
    crossbow: {
      labelKey: "tower_crossbow",
      projectileType: "arrow",
      unlockWave: 1,
      levels: {}
    },
    fire: {
      labelKey: "tower_fire",
      projectileType: "fire",
      unlockWave: 8,
      levels: {}
    },
    holy: {
      labelKey: "tower_holy",
      projectileType: "holy",
      unlockWave: 14,
      levels: {}
    },
    garlic: {
      labelKey: "tower_garlic",
      projectileType: "garlic",
      unlockWave: 30,
      levels: {}
    },
    holyWater: {
      labelKey: "tower_holy_water",
      projectileType: "holyWater",
      unlockWave: 45,
      levels: {}
    }
  },

  pickups: {
    superTower: {
      durationMs: 120000,
      damageMultiplier: 1.35,
      fireRateMultiplier: 0.78
    },
    skinFragment: {
      amount: 1,
      requiredToUnlock: 5
    }
  },

  shop: [
    { id: "skin_01", type: "skin", labelKey: "shop_skin_01", priceCoins: 500, requiredFragments: 5, unlockMethod: "coins_or_fragments", enabled: true },
    { id: "fire_tower_unlock", type: "tower", labelKey: "shop_fire_unlock", priceCoins: 700, requiredWave: 8, unlockMethod: "wave_or_coins", enabled: true },
    { id: "holy_tower_unlock", type: "tower", labelKey: "shop_holy_unlock", priceCoins: 850, requiredWave: 14, unlockMethod: "wave_or_coins", enabled: true },
    { id: "garlic_catapult_unlock", type: "tower", labelKey: "shop_garlic_unlock", priceCoins: 1200, requiredWave: 30, rewardedAdsNeeded: 5, unlockMethod: "wave_or_ads_or_coins", enabled: true },
    { id: "holy_water_tower_unlock", type: "tower", labelKey: "shop_holy_water_unlock", priceCoins: 1500, requiredWave: 45, rewardedAdsNeeded: 5, unlockMethod: "wave_or_ads_or_coins", enabled: true },
    { id: "no_ads", type: "iap", labelKey: "shop_no_ads", priceCoins: 0, unlockMethod: "iap", enabled: true }
  ]
};

(function buildTowerLevels() {
  const towerTypes = window.GAME_BALANCE.towerTypes;

  Object.keys(towerTypes).forEach(type => {
    for (let level = 1; level <= 22; level++) {
      const tier = level >= 17 ? 4 : level >= 9 ? 3 : level >= 4 ? 2 : 1;

      let baseDamage = 20;
      let baseHp = 100;
      let baseRange = 245;
      let baseFireRate = 42;

      if (type === "fire") { baseDamage = 32; baseHp = 90; baseRange = 235; baseFireRate = 54; }
      if (type === "holy") { baseDamage = 16; baseHp = 100; baseRange = 225; baseFireRate = 62; }
      if (type === "garlic") { baseDamage = 42; baseHp = 115; baseRange = 220; baseFireRate = 72; }
      if (type === "holyWater") { baseDamage = 28; baseHp = 105; baseRange = 230; baseFireRate = 58; }

      towerTypes[type].levels[level] = {
        hp: Math.round(baseHp + level * 18),
        damage: Math.round(baseDamage + level * 7),
        range: Math.round(baseRange + level * 3),
        fireRate: Math.max(22, Math.round(baseFireRate - level * 0.9)),
        tier,
        asset: type + "Tier" + tier
      };
    }
  });
})();
