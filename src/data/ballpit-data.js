// Ball Pit game data - balls, evolutions, and fusions
// Based on actual Ball Pit game encyclopedia

// Image path helper
const getImagePath = (filename) => `/images/ballpit/${filename}`;

export const ballTypes = {
	// Base Balls
	BLEED: { id: 'BLEED', name: 'Bleed', type: 'base', rarity: 'common', description: 'Causes bleeding damage', icon: '🩸', imageUrl: getImagePath('BallXPitBleed.webp') },
	BROOD_MOTHER: { id: 'BROOD_MOTHER', name: 'Brood Mother', type: 'base', rarity: 'common', description: 'Spawns offspring', icon: '🕷️', imageUrl: getImagePath('BallXPitBroodM.webp') },
	BURN: { id: 'BURN', name: 'Burn', type: 'base', rarity: 'common', description: 'Deals fire damage over time', icon: '🔥', imageUrl: getImagePath('BallXPitBurn.webp') },
	CELL: { id: 'CELL', name: 'Cell', type: 'base', rarity: 'common', description: 'Basic cellular structure', icon: '🦠', imageUrl: getImagePath('BallXPitCell.webp') },
	CHARM: { id: 'CHARM', name: 'Charm', type: 'base', rarity: 'common', description: 'Enchants and captivates', icon: '💕', imageUrl: getImagePath('BallXPiitCharmBall.webp') },
	DARK: { id: 'DARK', name: 'Dark', type: 'base', rarity: 'common', description: 'Harnesses dark energy', icon: '🌑', imageUrl: getImagePath('BallXPitDark.webp') },
	EARTHQUAKE: { id: 'EARTHQUAKE', name: 'Earthquake', type: 'base', rarity: 'common', description: 'Causes ground tremors', icon: '💥', imageUrl: getImagePath('BallXPitEarthquake.webp') },
	EGG_SAC: { id: 'EGG_SAC', name: 'Egg Sac', type: 'base', rarity: 'common', description: 'Contains eggs', icon: '🥚', imageUrl: getImagePath('BallXPitEggSac.webp') },
	FREEZE: { id: 'FREEZE', name: 'Freeze', type: 'base', rarity: 'common', description: 'Freezes enemies', icon: '❄️', imageUrl: getImagePath('BallXPitFreeze.webp') },
	GHOST: { id: 'GHOST', name: 'Ghost', type: 'base', rarity: 'common', description: 'Ethereal and intangible', icon: '👻', imageUrl: getImagePath('BallXPitGhost.webp') },
	IRON: { id: 'IRON', name: 'Iron', type: 'base', rarity: 'common', description: 'Heavy metal ball', icon: '⚙️', imageUrl: getImagePath('BallXPitIron.webp') },
	LASER_H: { id: 'LASER_H', name: 'Laser (Horizontal)', type: 'base', rarity: 'common', description: 'Horizontal laser beam', icon: '➡️', imageUrl: getImagePath('BallXPitLaserH.webp') },
	LASER_V: { id: 'LASER_V', name: 'Laser (Vertical)', type: 'base', rarity: 'common', description: 'Vertical laser beam', icon: '⬇️', imageUrl: getImagePath('BallXPitLaserV.webp') },
	LIGHT: { id: 'LIGHT', name: 'Light', type: 'base', rarity: 'common', description: 'Radiates bright light', icon: '💡', imageUrl: getImagePath('BallXPitLight.webp') },
	LIGHTNING: { id: 'LIGHTNING', name: 'Lightning', type: 'base', rarity: 'common', description: 'Electric shocks', icon: '⚡', imageUrl: getImagePath('BallXPitLightning.webp') },
	POISON: { id: 'POISON', name: 'Poison', type: 'base', rarity: 'common', description: 'Toxic poison', icon: '☠️', imageUrl: getImagePath('BallXPitPoison.webp') },
	VAMPIRE: { id: 'VAMPIRE', name: 'Vampire', type: 'base', rarity: 'common', description: 'Drains life', icon: '🧛', imageUrl: getImagePath('BallXPitVampire.webp') },
	WIND: { id: 'WIND', name: 'Wind', type: 'base', rarity: 'common', description: 'Wind gusts', icon: '💨', imageUrl: getImagePath('BallXPitWind.webp') },
	
	// Evolutions/Fusions
	ASSASSIN: { id: 'ASSASSIN', name: 'Assassin', type: 'fusion', rarity: 'rare', description: 'Passes through the front of enemies, but not the back. Backstabs deal 30% bonus damage.', fusedFrom: ['IRON', 'GHOST'], icon: '🗡️', imageUrl: getImagePath('BallXPitAssassin.webp') },
	ASSASSIN_ALT: { id: 'ASSASSIN_ALT', name: 'Assassin', type: 'fusion', rarity: 'rare', description: 'Passes through the front of enemies, but not the back. Backstabs deal 30% bonus damage.', fusedFrom: ['IRON', 'DARK'], icon: '🗡️', imageUrl: getImagePath('BallXPitAssassin.webp') },
	BERSERK: { id: 'BERSERK', name: 'Berserk', type: 'fusion', rarity: 'rare', description: 'Each hit has a 30% chance of causing enemies to go berserk for 6 seconds. Berserk enemies deal 15-24 damage to adjacent enemies every second', fusedFrom: ['CHARM', 'BURN'], icon: '😡', imageUrl: getImagePath('BallXPitBerserk.webp') },
	BERSERK_ALT: { id: 'BERSERK_ALT', name: 'Berserk', type: 'fusion', rarity: 'rare', description: 'Each hit has a 30% chance of causing enemies to go berserk for 6 seconds. Berserk enemies deal 15-24 damage to adjacent enemies every second', fusedFrom: ['CHARM', 'BLEED'], icon: '😡', imageUrl: getImagePath('BallXPitBerserk.webp') },
	BLACK_HOLE: { id: 'BLACK_HOLE', name: 'Black Hole', type: 'fusion', rarity: 'legendary', description: 'Instantly kills the first non-boss enemy that it hits, but destroys itself afterwards. Has a 7 second cooldown before it can be shot again.', fusedFrom: ['SUN', 'DARK'], icon: '⚫', imageUrl: getImagePath('BallXPitBlackHole.webp') },
BLIZZARD: { id: 'BLIZZARD', name: 'Blizzard', type: 'fusion', rarity: 'rare', description: 'Freezes all enemies within a 2 tile radius for 0.8 seconds, dealing 1-50 damage', fusedFrom: ['FREEZE', 'EARTHQUAKE'], icon: '🌨️', imageUrl: getImagePath('BallXPitBlizzard.webp') },
	BLIZZARD_ALT: { id: 'BLIZZARD_ALT', name: 'Blizzard', type: 'fusion', rarity: 'rare', description: 'Freezes all enemies within a 2 tile radius for 0.8 seconds, dealing 1-50 damage', fusedFrom: ['FREEZE', 'WIND'], icon: '🌨️', imageUrl: getImagePath('BallXPitBlizzard.webp') },
	BOMB: { id: 'BOMB', name: 'Bomb', type: 'fusion', rarity: 'rare', description: 'Explodes when hitting an enemy, dealing 150-300 damage to nearby enemies. Has a 3 seconds cooldown before it can be shot again.', fusedFrom: ['IRON', 'BURN'], icon: '💣', imageUrl: getImagePath('BallXPitBomb.webp') },
	FLASH: { id: 'FLASH', name: 'Flash', type: 'fusion', rarity: 'rare', description: 'Damage all enemies on screen for 1-3 damage after hitting an enemy and blind them for 2 seconds.', fusedFrom: ['LIGHT', 'LIGHTNING'], icon: '✨', imageUrl: getImagePath('BallXPitFlash.webp') },
	FLICKER: { id: 'FLICKER', name: 'Flicker', type: 'fusion', rarity: 'rare', description: 'Deals 1-7 damage to every enemy on screen every 1.4 seconds.', fusedFrom: ['DARK', 'LIGHT'], icon: '🌗', imageUrl: getImagePath('BallXPitFlicker.webp') },
	FREEZE_RAY: { id: 'FREEZE_RAY', name: 'Freeze Ray', type: 'fusion', rarity: 'rare', description: 'Emits a freeze ray when hitting an enemy, dealing 20-50 to all enemies in its path, with a 10% chance of freezing them for 10.0 seconds', fusedFrom: ['FREEZE', 'LASER_H'], icon: '🧊', imageUrl: getImagePath('BallXPitFreezeRay.webp') },
	FREEZE_RAY_V: { id: 'FREEZE_RAY_V', name: 'Freeze Ray', type: 'fusion', rarity: 'rare', description: 'Emits a freeze ray when hitting an enemy, dealing 20-50 to all enemies in its path, with a 10% chance of freezing them for 10.0 seconds', fusedFrom: ['FREEZE', 'LASER_V'], icon: '🧊', imageUrl: getImagePath('BallXPitFreezeRay.webp') },
	FROZEN_FLAME: { id: 'FROZEN_FLAME', name: 'Frozen Flame', type: 'fusion', rarity: 'rare', description: 'Add 1 stack of frostburn on hit for 20 seconds (max 4 stacks). Frostburnt units are dealt 8-12 damage per stack per second and receive 25% more damage from other sources.', fusedFrom: ['FREEZE', 'BURN'], icon: '🔥❄️', imageUrl: getImagePath('BallXPitFrozenFlame.webp') },
	GLACIER: { id: 'GLACIER', name: 'Glacier', type: 'fusion', rarity: 'rare', description: 'Releases glacial spikes over time that deal 15-30 damage to enemies that touch them and freeze them for 2.0 seconds. This ball and its glacial spikes also deal 6-12 damage to nearby units.', fusedFrom: ['FREEZE', 'EARTHQUAKE'], icon: '🏔️', imageUrl: getImagePath('BallXPitGlacier.webp') },
	HEMORRHAGE: { id: 'HEMORRHAGE', name: 'Hemorrhage', type: 'fusion', rarity: 'rare', description: 'Inflicts 3 stacks of bleed. When hitting an enemy with 12 stacks of bleed or more, consume all stacks of bleed to deal 20% of their current health', fusedFrom: ['BLEED', 'IRON'], icon: '💉', imageUrl: getImagePath('BallXPitHem.webp') },
	HOLY_LASER: { id: 'HOLY_LASER', name: 'Holy Laser', type: 'fusion', rarity: 'epic', description: 'Deals 24-36 damage to all enemies in the same row and column.', fusedFrom: ['LASER_V', 'LASER_H'], icon: '✝️', imageUrl: getImagePath('BallXPitHoly.webp') },
	INCUBUS: { id: 'INCUBUS', name: 'Incubus', type: 'fusion', rarity: 'rare', description: 'Each hit has a 4% chance of charming the enemy for 9 seconds. Charmed enemies curse nearby enemies. Cursed enemies are dealt 100-200 after being hit 5 times.', fusedFrom: ['CHARM', 'DARK'], icon: '😈', imageUrl: getImagePath('BallXPitIncubus.webp') },
	INFERNO: { id: 'INFERNO', name: 'Inferno', type: 'fusion', rarity: 'rare', description: 'Applies 1 stack of burn every second to all enemies within a 2 tile radius. Burn lasts for 6 seconds, dealing 3-7 damage per stack per second', fusedFrom: ['BURN', 'WIND'], icon: '🔥💨', imageUrl: getImagePath('BallXPitInferno.webp') },
	LASER_BEAM: { id: 'LASER_BEAM', name: 'Laser Beam', type: 'fusion', rarity: 'rare', description: 'Emit a laser beam on hit that deals 30-42 damage and blinds enemies for 8 seconds', fusedFrom: ['LIGHT', 'LASER_H'], icon: '🔦', imageUrl: getImagePath('BallXPitLaserEvo.webp') },
	LASER_BEAM_V: { id: 'LASER_BEAM_V', name: 'Laser Beam', type: 'fusion', rarity: 'rare', description: 'Emit a laser beam on hit that deals 30-42 damage and blinds enemies for 8 seconds', fusedFrom: ['LIGHT', 'LASER_V'], icon: '🔦', imageUrl: getImagePath('BallXPitLaserEvo.webp') },
	LEECH: { id: 'LEECH', name: 'Leech', type: 'fusion', rarity: 'rare', description: 'Attaches up to 1 leech onto enemies it hits, which adds 2 stacks of bleed per second (max 24 stacks).', fusedFrom: ['BROOD_MOTHER', 'BLEED'], icon: '🪱', imageUrl: getImagePath('BallXPitLeech.webp') },
	LIGHTNING_ROD: { id: 'LIGHTNING_ROD', name: 'Lightning Rod', type: 'fusion', rarity: 'rare', description: 'Plants a lightning rod into enemies it hits. These enemies are struck by lightning every 3.0 seconds, dealing 1-30 damage to up to 8 nearby enemies.', fusedFrom: ['IRON', 'LIGHTNING'], icon: '📡', imageUrl: getImagePath('BallXPitLightRod.webp') },
	LOVE_STRUCK: { id: 'LOVE_STRUCK', name: 'Love Struck', type: 'fusion', rarity: 'rare', description: 'Inflicts lovestruck on hit enemies for 20 seconds. Lovestruck units have a 50% chance of healing you for 5 health when they attack.', fusedFrom: ['CHARM', 'LIGHT'], icon: '💘', imageUrl: getImagePath('BallXPitLS.webp') },
	LOVE_STRUCK_ALT: { id: 'LOVE_STRUCK_ALT', name: 'Love Struck', type: 'fusion', rarity: 'rare', description: 'Inflicts lovestruck on hit enemies for 20 seconds. Lovestruck units have a 50% chance of healing you for 5 health when they attack.', fusedFrom: ['CHARM', 'LIGHTNING'], icon: '💘', imageUrl: getImagePath('BallXPitLS.webp') },
	MAGGOT: { id: 'MAGGOT', name: 'Maggot', type: 'fusion', rarity: 'rare', description: 'Infest enemies on hit with maggots. When they die, they explode into 1-2 baby balls.', fusedFrom: ['CELL', 'BROOD_MOTHER'], icon: '🐛', imageUrl: getImagePath('BallXPitMaggot.webp') },
	MAGMA: { id: 'MAGMA', name: 'Magma', type: 'fusion', rarity: 'rare', description: 'Emits lava blobs over time. Enemies who walk into lava blobs are dealt 15-30 damage and gain 1 stack of burn (max 3 stacks). Burn lasts for 3 seconds, dealing 3-8 damage per stack per second. This ball and its lava blobs also deal 6-12 damage to nearby units.', fusedFrom: ['EARTHQUAKE', 'BURN'], icon: '🌋', imageUrl: getImagePath('BallXPitMagma.webp') },
	MOSQUITO_KING: { id: 'MOSQUITO_KING', name: 'Mosquito King', type: 'fusion', rarity: 'rare', description: 'Spawns a mosquito each time it hits an enemy. Mosquitos attack a random enemy, dealing 80-120 damage each. If a mosquito kills an enemy, they steal 1 health.', fusedFrom: ['VAMPIRE', 'BROOD_MOTHER'], icon: '🦟', imageUrl: getImagePath('BallXPitMosquitoKing.webp') },
	MOSQUITO_SWARM: { id: 'MOSQUITO_SWARM', name: 'Mosquito Swarm', type: 'fusion', rarity: 'rare', description: 'Explodes into 3-6 mosquitoes. Mosquitos attack random enemies, dealing 80-120 damage each. If a mosquito kills an enemy, they steal 1 health', fusedFrom: ['VAMPIRE', 'EGG_SAC'], icon: '🦟🦟', imageUrl: getImagePath('BallXPitMosquitoSwarm.webp') },
	NOXIOUS: { id: 'NOXIOUS', name: 'Noxious', type: 'fusion', rarity: 'rare', description: 'Passes through enemies and applies 3 stacks of poison to nearby enemies within a 2 tile radius. Poison lasts for 4 seconds and each stack deals 1-3 damage per second.', fusedFrom: ['WIND', 'POISON'], icon: '☁️', imageUrl: getImagePath('BallXPitNoxious.webp') },
	NOXIOUS_ALT: { id: 'NOXIOUS_ALT', name: 'Noxious', type: 'fusion', rarity: 'rare', description: 'Passes through enemies and applies 3 stacks of poison to nearby enemies within a 2 tile radius. Poison lasts for 4 seconds and each stack deals 1-3 damage per second.', fusedFrom: ['WIND', 'DARK'], icon: '☁️', imageUrl: getImagePath('BallXPitNoxious.webp') },
	NUCLEAR_BOMB: { id: 'NUCLEAR_BOMB', name: 'Nuclear Bomb', type: 'fusion', rarity: 'epic', description: 'Explodes when hitting an enemy, dealing 300-500 damage to nearby enemies and applying 1 stack of radiation to everyone present indefinitely (max 5 stacks). Each stack of radiation increases damage received by 10%. Has a 3 second cooldown', fusedFrom: ['BOMB', 'POISON'], icon: '☢️', imageUrl: getImagePath('BallXPitNuke.webp') },
	OVERGROWTH: { id: 'OVERGROWTH', name: 'Overgrowth', type: 'fusion', rarity: 'rare', description: 'Applies 1 stack of overgrowth. Upon reaching 3, consume all stacks and deal 0-200 damage to all enemies in a 3x3 tile square', fusedFrom: ['EARTHQUAKE', 'CELL'], icon: '🌿', imageUrl: getImagePath('BallXPitOverG.webp') },
	PHANTOM: { id: 'PHANTOM', name: 'Phantom', type: 'fusion', rarity: 'rare', description: 'Curse enemies on hit. Cursed enemies are dealt 100-200 damage after being hit 5 times.', fusedFrom: ['DARK', 'GHOST'], icon: '💀', imageUrl: getImagePath('BallXPitPhantom.webp') },
	RADIATION_BEAM: { id: 'RADIATION_BEAM', name: 'Radiation Beam', type: 'fusion', rarity: 'rare', description: 'Emit a radiation beam on hit that deals 24-48 damage and applies 1 stack of radiation (max 5 stacks). Radiation lasts for 15 seconds and causes enemies to receive 10% more damage from all sources per stack.', fusedFrom: ['POISON', 'LASER_H'], icon: '☢️➡️', imageUrl: getImagePath('BallXPitRadBeam.webp') },
	RADIATION_BEAM_ALT: { id: 'RADIATION_BEAM_ALT', name: 'Radiation Beam', type: 'fusion', rarity: 'rare', description: 'Emit a radiation beam on hit that deals 24-48 damage and applies 1 stack of radiation (max 5 stacks). Radiation lasts for 15 seconds and causes enemies to receive 10% more damage from all sources per stack.', fusedFrom: ['CELL', 'LASER_H'], icon: '☢️➡️', imageUrl: getImagePath('BallXPitRadBeam.webp') },
	RADIATION_BEAM_V: { id: 'RADIATION_BEAM_V', name: 'Radiation Beam', type: 'fusion', rarity: 'rare', description: 'Emit a radiation beam on hit that deals 24-48 damage and applies 1 stack of radiation (max 5 stacks). Radiation lasts for 15 seconds and causes enemies to receive 10% more damage from all sources per stack.', fusedFrom: ['POISON', 'LASER_V'], icon: '☢️⬇️', imageUrl: getImagePath('BallXPitRadBeam.webp') },
	RADIATION_BEAM_V_ALT: { id: 'RADIATION_BEAM_V_ALT', name: 'Radiation Beam', type: 'fusion', rarity: 'rare', description: 'Emit a radiation beam on hit that deals 24-48 damage and applies 1 stack of radiation (max 5 stacks). Radiation lasts for 15 seconds and causes enemies to receive 10% more damage from all sources per stack.', fusedFrom: ['CELL', 'LASER_V'], icon: '☢️⬇️', imageUrl: getImagePath('BallXPitRadBeam.webp') },
	SACRIFICE: { id: 'SACRIFICE', name: 'Sacrifice', type: 'fusion', rarity: 'rare', description: 'Inflicts 4 stacks of bleed (max 15 stacks) and applies curse to hit enemies. Cursed enemies are dealt 50-100 after being hit 5 times.', fusedFrom: ['DARK', 'BLEED'], icon: '⚰️', imageUrl: getImagePath('BallXPitSacri.webp') },
	SANDSTORM: { id: 'SANDSTORM', name: 'Sandstorm', type: 'fusion', rarity: 'rare', description: 'Goes through enemies and is surrounded by a raging storm dealing 10-20 damage per second and blinding nearby enemies for 3 seconds.', fusedFrom: ['EARTHQUAKE', 'WIND'], icon: '🌪️', imageUrl: getImagePath('BallXPitSandstorm.webp') },
	SATAN: { id: 'SATAN', name: 'Satan', type: 'fusion', rarity: 'legendary', description: 'While active, add 1 stack of burn to all active enemies per second (max 5 stacks), dealing 10-20 damage per stack per second and make them go berserk, dealing 15-24 damage to adjacent enemies every second.', fusedFrom: ['INCUBUS', 'SUCCUBUS'], icon: '👿', imageUrl: getImagePath('BallXPitSatan.webp') },
	SHOTGUN: { id: 'SHOTGUN', name: 'Shotgun', type: 'fusion', rarity: 'rare', description: 'Shoots 3-7 iron baby balls after hitting a wall. Iron baby balls move at 200% speed but are destroyed upon hitting anything', fusedFrom: ['IRON', 'EGG_SAC'], icon: '🔫', imageUrl: getImagePath('BallXPitShotgun.webp') },
	SOUL_SUCKER: { id: 'SOUL_SUCKER', name: 'Soul Sucker', type: 'fusion', rarity: 'rare', description: 'Passes through enemies and saps them, with a 30% chance of stealing 1 health and reducing their attack damage by 20%. Lifesteal chance only applies once per enemy.', fusedFrom: ['GHOST', 'VAMPIRE'], icon: '👻🧛', imageUrl: getImagePath('BallXPitSoulSucker.webp') },
	SPIDER_QUEEN: { id: 'SPIDER_QUEEN', name: 'Spider Queen', type: 'fusion', rarity: 'rare', description: 'Has a 25% chance of birthing an Egg Sac each time it hits an enemy.', fusedFrom: ['BROOD_MOTHER', 'EGG_SAC'], icon: '🕸️', imageUrl: getImagePath('BallXPitSQueen.webp') },
	STORM: { id: 'STORM', name: 'Storm', type: 'fusion', rarity: 'rare', description: 'Emits lightning to strike nearby enemies every second, dealing 1-40 damage', fusedFrom: ['LIGHTNING', 'WIND'], icon: '⛈️', imageUrl: getImagePath('BallXPitStorm.webp') },
	SUCCUBUS: { id: 'SUCCUBUS', name: 'Succubus', type: 'fusion', rarity: 'rare', description: 'Each hit has a 4% chance of charming the enemy for 9 second. Heals 1 when hitting a charmed enemy', fusedFrom: ['VAMPIRE', 'CHARM'], icon: '😈💋', imageUrl: getImagePath('BallXPitSuccubus.webp') },
	SUN: { id: 'SUN', name: 'Sun', type: 'fusion', rarity: 'epic', description: 'Blind all enemies in view and add 1 stack of burn every second (max 5 stacks). Burn lasts for 6 seconds and deals 6-12 damage per stack per second.', fusedFrom: ['BURN', 'LIGHT'], icon: '☀️', imageUrl: getImagePath('BallXPitSun.webp') },
	SWAMP: { id: 'SWAMP', name: 'Swamp', type: 'fusion', rarity: 'rare', description: 'Leaves behind tar blobs over time. Enemies who walk into tar blobs are dealt 15-30, are slowed by 50% for 7 seconds and gain 1 stack of poison (max 8 stacks). Each stack of poison deals 1-3 damage per second. This ball and its tar blobs also deal 6-12 damage to nearby units', fusedFrom: ['POISON', 'EARTHQUAKE'], icon: '🐊', imageUrl: getImagePath('BallXPitSwamp.webp') },
	VAMPIRE_LORD: { id: 'VAMPIRE_LORD', name: 'Vampire Lord', type: 'fusion', rarity: 'rare', description: 'Each hit inflicts 3 stacks of bleed. Heals 1 health and consumes all stacks when hitting an enemy with at least 10 stacks of bleed', fusedFrom: ['VAMPIRE', 'BLEED'], icon: '🧛‍♂️', imageUrl: getImagePath('BallXPitVampLord.webp') },
	VAMPIRE_LORD_ALT: { id: 'VAMPIRE_LORD_ALT', name: 'Vampire Lord', type: 'fusion', rarity: 'rare', description: 'Each hit inflicts 3 stacks of bleed. Heals 1 health and consumes all stacks when hitting an enemy with at least 10 stacks of bleed', fusedFrom: ['VAMPIRE', 'DARK'], icon: '🧛‍♂️', imageUrl: getImagePath('BallXPitVampLord.webp') },
	VIRUS: { id: 'VIRUS', name: 'Virus', type: 'fusion', rarity: 'rare', description: 'Applies 1 stack of disease to units it hits (max 8 stacks). Disease lasts for 6 seconds. Each stack of disease deals 3-6 damage per second and diseased units have a 15% chance of passing a stack to undiseased nearby enemies each second.', fusedFrom: ['GHOST', 'POISON'], icon: '🦠☠️', imageUrl: getImagePath('BallXPitVirus.webp') },
	VIRUS_ALT: { id: 'VIRUS_ALT', name: 'Virus', type: 'fusion', rarity: 'rare', description: 'Applies 1 stack of disease to units it hits (max 8 stacks). Disease lasts for 6 seconds. Each stack of disease deals 3-6 damage per second and diseased units have a 15% chance of passing a stack to undiseased nearby enemies each second.', fusedFrom: ['CELL', 'POISON'], icon: '🦠☠️', imageUrl: getImagePath('BallXPitVirus.webp') },
	VOLUPTUOUS_EGG_SAC: { id: 'VOLUPTUOUS_EGG_SAC', name: 'Voluptuous Egg Sac', type: 'fusion', rarity: 'rare', description: 'Explodes into 2-3 egg sacs on hitting an enemy. Has a 3 second cooldown before it can be shot again', fusedFrom: ['EGG_SAC', 'CELL'], icon: '🥚🥚', imageUrl: getImagePath('BallXPitVolEgg.webp') },
	WRAITH: { id: 'WRAITH', name: 'Wraith', type: 'fusion', rarity: 'rare', description: 'Freezes any enemy it passes through for 0.8 seconds.', fusedFrom: ['GHOST', 'FREEZE'], icon: '👻❄️', imageUrl: getImagePath('BallXPitWraith.webp') },
	NOSFERATU: { id: 'NOSFERATU', name: 'Nosferatu', type: 'fusion', rarity: 'legendary', description: 'Spawns a vampire bat each bounce. Vampire bats fly towards a random enemy, dealing 132-176 damage on hit, turning into a Vampire Lord', fusedFrom: ['VAMPIRE_LORD', 'MOSQUITO_KING', 'SPIDER_QUEEN'], icon: '🦇', imageUrl: getImagePath('BallXPitNosferatu.webp') },
};

// Helper function to get all base balls
export function getBaseBalls() {
	return Object.values(ballTypes).filter(ball => ball.type === 'base');
}

// Helper function to get all possible evolutions for a ball
export function getPossibleEvolutions(ballId) {
	return Object.values(ballTypes).filter(ball => 
		ball.type === 'evolution' && ball.evolvedFrom === ballId
	);
}

// Helper function to get all possible fusions with owned balls
export function getPossibleFusions(ownedBallIds) {
	const owned = new Set(ownedBallIds);
	const possible = [];
	const seenResults = new Set(); // Track unique results by name
	
	Object.values(ballTypes).forEach(ball => {
		if (ball.type === 'fusion' && ball.fusedFrom) {
			// Check if we have all required balls for this fusion
			const hasAllIngredients = ball.fusedFrom.every(requiredId => owned.has(requiredId));
			
			if (hasAllIngredients && !seenResults.has(ball.name)) {
				seenResults.add(ball.name);
				possible.push({
					result: ball,
					ingredients: ball.fusedFrom.map(id => ballTypes[id])
				});
			}
		}
	});
	
	return possible;
}

// Helper function to get potential fusions if we had other balls
export function getPotentialFusions(ownedBallIds) {
	const owned = new Set(ownedBallIds);
	const potential = [];
	const seenResults = new Set(); // Track unique results by name
	
	Object.values(ballTypes).forEach(ball => {
		if (ball.type === 'fusion' && ball.fusedFrom) {
			// Check if we have at least one required ball but not all
			const ownedCount = ball.fusedFrom.filter(id => owned.has(id)).length;
			const hasAtLeastOne = ownedCount > 0;
			const hasAll = ownedCount === ball.fusedFrom.length;
			
			if (hasAtLeastOne && !hasAll && !seenResults.has(ball.name)) {
				seenResults.add(ball.name);
				const missing = ball.fusedFrom.filter(id => !owned.has(id));
				potential.push({
					result: ball,
					ingredients: ball.fusedFrom.map(id => ballTypes[id]),
					missing: missing.map(id => ballTypes[id]),
					owned: ball.fusedFrom.filter(id => owned.has(id)).map(id => ballTypes[id])
				});
			}
		}
	});
	
	return potential;
}

// Helper function to get fusion trees - multi-step fusion possibilities
export function getFusionTrees(ownedBallIds) {
	const owned = new Set(ownedBallIds);
	const trees = [];
	const seenResults = new Set();
	
	// Find all balls that use owned balls in their fusion path (directly or indirectly)
	Object.values(ballTypes).forEach(targetBall => {
		if (targetBall.type !== 'fusion' || !targetBall.fusedFrom) return;
		
		// Check if any owned ball is in the fusion tree
		const { canMake, path, missing } = analyzeFusionPath(targetBall, owned);
		
		// Only show if we have at least one ingredient and can't make it yet
		if (path.ownedBalls.length > 0 && !canMake && !seenResults.has(targetBall.name)) {
			seenResults.add(targetBall.name);
			trees.push({
				result: targetBall,
				path: path,
				totalSteps: missing.length,
				missing: missing
			});
		}
	});
	
	// Sort by number of steps (fewer steps first)
	return trees.sort((a, b) => a.totalSteps - b.totalSteps);
}

// Analyze fusion path to see what's needed
function analyzeFusionPath(ball, ownedSet) {
	const path = {
		ownedBalls: [],
		missingBalls: [],
		requiredFusions: []
	};
	const allMissing = [];
	
	if (!ball.fusedFrom) return { canMake: false, path, missing: allMissing };
	
	let canMake = true;
	
	ball.fusedFrom.forEach(ingredientId => {
		const ingredient = ballTypes[ingredientId];
		
		if (ownedSet.has(ingredientId)) {
			// We have this ingredient
			path.ownedBalls.push(ingredient);
		} else {
			// We don't have this ingredient
			canMake = false;
			
			// Check if this ingredient is a fusion we could make
			if (ingredient.type === 'fusion' && ingredient.fusedFrom) {
				const subPath = analyzeFusionPath(ingredient, ownedSet);
				path.requiredFusions.push({
					ball: ingredient,
					subPath: subPath
				});
				allMissing.push(...subPath.missing);
				
				// If we can't make the sub-fusion either, add its missing ingredients
				if (!subPath.canMake) {
					path.missingBalls.push(ingredient);
				}
			} else {
				// It's a base ball we need
				path.missingBalls.push(ingredient);
				allMissing.push(ingredient);
			}
		}
	});
	
	return { canMake, path, missing: allMissing };
}

// Helper function to get all upgrade paths (evolutions + fusions)
export function getAllUpgradePaths(ownedBallIds) {
	const evolutions = [];
	const fusions = getPossibleFusions(ownedBallIds);
	const potentials = getPotentialFusions(ownedBallIds);
	const fusionTrees = getFusionTrees(ownedBallIds);
	
	// Get evolutions for each owned ball
	ownedBallIds.forEach(ballId => {
		const evolves = getPossibleEvolutions(ballId);
		if (evolves.length > 0) {
			evolutions.push({
				from: ballTypes[ballId],
				options: evolves
			});
		}
	});
	
	return { evolutions, fusions, potentials, fusionTrees };
}
