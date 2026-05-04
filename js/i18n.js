window.I18N = {
  current: "fr",

  dict: {
    fr: {
      home_title: "Vampire Defense",
      home_subtitle: "Défends ta base contre les créatures de la nuit.",
      home_play: "Jouer",

      menu_settings: "Paramètres",
      menu_shop: "Boutique",
      menu_crosspromo: "Crosspromo",
      menu_profile: "Profil",
      menu_noads: "Sans pubs",

      panel_settings: "Paramètres",
      panel_shop: "Boutique",
      panel_crosspromo: "Crosspromo",
      panel_profile: "Profil",
      panel_noads: "Sans pubs",

      hud_wave: "Vague",
      hud_base: "Base",
      hud_world: "Monde",
      hud_fragments: "Fragments",
      hud_coins: "Pièces",

      action_build_tower: "Tour",
      action_upgrade_base: "Base",
      action_next_wave: "Vague",
      action_continue: "Continuer",

      world_campaign: "Campagne maudite",
      world_swamp: "Marais des ombres",
      world_village: "Village abandonné",
      world_city: "Grande ville",
      world_manor: "Manoir vampire",
      world_cave: "Grotte ancienne",

      enemy_adept: "Adepte vampire",
      enemy_corrupted: "Humain corrompu",
      enemy_vampire: "Vampire",
      enemy_bat: "Chauve-souris",
      enemy_swamp_vampire: "Vampire du marais",
      enemy_vampire_noble: "Noble vampire",
      enemy_ancient_vampire: "Ancien vampire",
      enemy_vampire_mother: "Mère des vampires",
      enemy_swamp_mother: "Mère du marais",
      enemy_village_lord: "Seigneur du village",
      enemy_city_duke: "Duc de la ville",
      enemy_manor_queen: "Reine du manoir",
      enemy_ancient_mother: "Mère ancienne",

      tower_crossbow: "Tour arbalète",
      tower_fire: "Tour de feu",
      tower_holy: "Tour sacrée",
      tower_garlic: "Catapulte à ail",
      tower_holy_water: "Tour d’eau bénite",

      shop_skin_01: "Skin nocturne",
      shop_fire_unlock: "Débloquer tour de feu",
      shop_holy_unlock: "Débloquer tour sacrée",
      shop_garlic_unlock: "Débloquer catapulte à ail",
      shop_holy_water_unlock: "Débloquer tour d’eau bénite",
      shop_no_ads: "Retirer les pubs",

      msg_not_enough: "Pas assez",
      msg_too_close: "Trop près",
      msg_already_tower: "Déjà une tour",
      msg_max_level: "Niveau max",
      msg_super_tower: "Super tour",
      msg_skin_fragment: "+1 fragment",
      msg_base_level: "Base niv.",
      msg_tower_level: "Tour niv.",

      placeholder_settings: "Réglages à venir : langue, son, vibration, qualité visuelle.",
      placeholder_crosspromo: "Crosspromo à venir : liens vers tes autres jeux.",
      placeholder_noads: "Option sans pubs à connecter plus tard aux achats.",
      placeholder_profile: "Profil joueur, progression, fragments et statistiques.",
      placeholder_shop: "Boutique en préparation."
    }
  },

  t(key, fallback = "") {
    return (this.dict[this.current] && this.dict[this.current][key]) || fallback || key;
  },

  apply() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = this.t(key, el.textContent || "");
    });
  }
};
