/**
 * Asset manifest and asset loader for The Great Work
 * As required by GUIDELINES.md §3 and the approved assets specification.
 * Maps asset names to exact approved file paths.
 */

export const ASSETS = {
  // Approved visual assets (1376x768 JPEGs)
  titleBackground: '/assets/title/background.jpg',
  worldMap: '/assets/map/world.jpg',

  // Reference art supplied in workspace
  snesStageRoof: '/assets/aistudio/image_3c26d782.png',
  snesDkcProgression: '/assets/aistudio/image_7b4f1ceb.png',
  snesWorldMapSf2: '/assets/aistudio/image_00bddee2.png',

  // Character and vehicle sprites
  workerSprite: '/assets/characters/worker.png',
  vehicle: '/assets/map/vehicle.png',

  // Stage backdrops
  stages: {
    1: '/assets/stages/stop1_backdrop.jpg',
    2: '/assets/stages/stop2_backdrop.jpg',
    3: '/assets/stages/stop3_backdrop.jpg',
    4: '/assets/stages/stop4_backdrop.jpg',
    5: '/assets/stages/stop5_backdrop.jpg',
    6: '/assets/stages/stop6_backdrop.jpg',
    7: '/assets/stages/stop7_backdrop.jpg'
  }
} as const;

export type AssetKey = keyof typeof ASSETS;

/**
 * Helper to get asset URL
 */
export function getAssetUrl(key: AssetKey): string {
  const asset = ASSETS[key];
  if (typeof asset === 'string') return asset;
  return '';
}
