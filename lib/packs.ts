export type PackMeta = {
  slug: string;
  name: string;
  description: string;
  background: string;      // постер (фолбэк, если нет видео)
  packImage: string;
  titleImage?: string;
  marketUrl: string;
  tags?: string[];
  video?: {
    srcWebm?: string;
    srcMp4?: string;
    poster?: string;
  };
};

export const PACKS: PackMeta[] = [
  { slug: 'orden', name: 'ORDO MEMETICUS', short: 'ORDEN',
    description: 'Stained‑glass saints, medieval rites, and memetic guardians. Legendary to Mythic rarities with interactive lore. ',
    background: '/packs/ordo-memeticus-bg.png', packImage: '/packs/ordo-memeticus-pack.png',
    titleImage: '/titles/ordo-memeticus-title.png', marketUrl: 'https://vibechain.com/market/ordo-memeticus', tags: ['Stained Glass'] },
 {
    slug: 'shitpixels-exe',
    name: 'SHITPIXELS.EXE',
    description: 'Haunted suburban VHS vibes. Trick-or-treat meets stained-glass nightmares.',
    background: '/packs/shitpixels-bg.jpg',       // важно: здесь изображение, не mp4
    packImage: '/packs/shitpixels.png',
    titleImage: '/titles/shitpixels-title.png',
    marketUrl: '#',
    tags: ['Horror', 'VHS'],
    video: {
      srcWebm: '/packs/shitpixels-bg.webm',
      srcMp4:  '/packs/shitpixels-bg.mp4',
      poster:  '/packs/shitpixels-bg.jpg'
    }
  },
  { slug: 'mfrst', name: 'MFERS STAINS', description: 'Album‑cover tributes remixed into meme culture. Loud, glossy, collectable.', titleImage: '/titles/mfers-title.png',
    background: '/packs/mfers-bg.jpg', packImage: '/packs/mferstains.png', marketUrl: '#', tags: ['Music','Tribute'] },
  { slug: 'stray', name: 'STRAY TILL NINE', description: 'Analog horror frames. Lost tapes, dead pixels, and cursed polaroids.', titleImage: '/titles/stray-title.png',
    background: '/packs/stray-bg.jpg', packImage: '/packs/straytillnine.png', marketUrl: '#', tags: ['Analog','Horror'] },
  { slug: 'rcgva', name: 'RIZZ CODED GYATT', description: '3D/cartoon cut‑paper chaos with yellow/black energy. Punk caricature vibe.', titleImage: '/titles/rizz-title.png',
    background: '/packs/rizz-bg.png', packImage: '/packs/rizz-pack.png', marketUrl: '#', tags: ['3D','Cartoon'] },
  { slug: 'sbgc', name: 'SKULL BOARD GAME CLUB', description: 'Epic Spells energy: grotesque faces, battle chaos, and wide‑angle drama.', titleImage: '/titles/sbgc-title.png',
    background: '/packs/sbgc-bg.jpg', packImage: '/packs/sbgc.png', marketUrl: '#', tags: ['Battle','Epic Spells'], video: {
      srcMp4:  '/packs/sbgc-bg.mp4',
      poster:  '/packs/sbgc-bg.jpg'
    }},
];
