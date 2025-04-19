/** Merge in new weapon properties */
export default () => {
  const properties = {
    aerodynamic: {
      label: "MYTHACRI.WeaponPropertyAerodynamic",
    },
    coldIron: {
      icon: "systems/dnd5e/icons/svg/activity/enchant.svg",
      label: "MYTHACRI.WeaponPropertyColdIron",
      isPhysical: true,
    },
    concealable: {
      label: "MYTHACRI.WeaponPropertyConcealable" },
    explosive: {
      label: "MYTHACRI.WeaponPropertyExplosive",
      isJourneyman: true,
    },
    heat: {
      label: "MYTHACRI.WeaponPropertyHeat",
      isJourneyman: true,
    },
    massive: {
      label: "MYTHACRI.WeaponPropertyMassive",
      isJourneyman: true,
    },
    mounted: {
      label: "MYTHACRI.WeaponPropertyMounted",
      isJourneyman: true,
    },
    parrying: {
      label: "MYTHACRI.WeaponPropertyParry",
    },
    rocket: {
      label: "MYTHACRI.WeaponPropertyRocket",
      isJourneyman: true,
    },
    scatter: {
      label: "MYTHACRI.WeaponPropertyScatter",
    },
    sighted: {
      label: "MYTHACRI.WeaponPropertySighted",
    },
    superheavy: {
      label: "MYTHACRI.WeaponPropertySuperheavy",
    },
    tension: {
      label: "MYTHACRI.WeaponPropertyTension",
      isJourneyman: true,
    },
    twinshot: {
      label: "MYTHACRI.WeaponPropertyTwinshot",
      isJourneyman: true,
    },
  };
  for (const [k, v] of Object.entries(properties)) {
    CONFIG.DND5E.itemProperties[k] = v;
    CONFIG.DND5E.validProperties.weapon.add(k);
  }
};
