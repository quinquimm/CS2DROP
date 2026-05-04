// Mock data for TOBYDROP CS2 gambling clone

export const RARITY_COLORS = {
  gold: '#e4ae39',
  covert: '#eb4b4b',
  classified: '#d32ce6',
  restricted: '#8847ff',
  milspec: '#4b69ff',
  industrial: '#5e98d9',
  consumer: '#b0c3d9',
};

export const RARITY_LABELS = {
  gold: '★ Gold / Knives',
  covert: 'Covert',
  classified: 'Classified',
  restricted: 'Restricted',
  milspec: 'Mil-Spec',
  industrial: 'Industrial',
  consumer: 'Consumer',
};

export const WEAR_CONDITIONS = ['FN', 'MW', 'FT', 'WW', 'BS'];
export const WEAR_FULL = {
  FN: 'Factory New',
  MW: 'Minimal Wear',
  FT: 'Field-Tested',
  WW: 'Well-Worn',
  BS: 'Battle-Scarred',
};

// Sample skin images (using steam community images)
const SKIN_IMG = {
  ak_redline: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszCelBUupciib2RVBozj5jLW1Y21LuQptSnmeXLPLfRmm5D_Ncg2LCX8N-i3wW180E9ZD2mcNWbegJsMg7U_gDtwrq7ifDsuJXMnCZj6Sgmt3rez0XljQYMMLIS0RI',
  ak_steel: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiVI0POlPPNSM-SBAWmV_uJ_t-l9AXqyk0hy5GWEyduhdC2TPAEjDptzQbRf5EHrmoWyZu22sQLciokQyyzgznQesAEGx_A',
  awp_dragon: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxaQknGRvap00nIUEtgKAhsi-mgbIGJmcPtfLnXn1RE0-OYRo2Sl3I_vI3lIhpnaK3HCtlAotAaEs_Qa7r7PK8-TJRqMT5mNNzdfAB4Mg7QqwLthOa-1cTgaOwjm1ZGgM9dSmNJCw',
  m4_howl: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHJOXH5gteP4RulR1fR0jMRYvkioHM81c6o54ho4dUXsmBMtlKGkv9lR4JH6v-6DQV3Wg4G2VS5Mo',
};

// Cases / Boxes mocked from original site
export const CASES = [
  { id: 'yakuza_bite', name: 'YAKUZA BITE', price: 1.0, image: 'https://key-drop.com/uploads/skins/1_YAKUZA_BITE.png', series: 'YAKUZA' },
  { id: 'omakase', name: 'OMAKASE', price: 2.5, image: 'https://key-drop.com/uploads/skins/2_OMAKASE.png', series: 'YAKUZA' },
  { id: 'tempura', name: 'TEMPURA FURY', price: 5.0, image: 'https://key-drop.com/uploads/skins/3_TEMPURA_FURY.png', series: 'YAKUZA' },
  { id: 'cook', name: 'LET HIM COOK', price: 20.0, image: 'https://key-drop.com/uploads/skins/4_LET_HIM_COOK.png', series: 'YAKUZA' },
  { id: 'sauce', name: 'SAUCE IT UP', price: 50.0, image: 'https://key-drop.com/uploads/skins/5_SAUCE_IT_UP.png', series: 'YAKUZA' },
  { id: 'dragon_roll', name: 'DRAGON ROLL', price: 250.0, image: 'https://key-drop.com/uploads/skins/6_DRAGON_ROLL.png', series: 'YAKUZA' },
  { id: 'agroflux', name: 'AGROFLUX', price: 1.0, image: 'https://key-drop.com/uploads/skins/XDDDDDDDD_1.png', series: 'MAGIC' },
  { id: 'magic_trick', name: 'MAGIC TRICK', price: 2.5, image: 'https://key-drop.com/uploads/skins/2_MAGIC_TRICK.png', series: 'MAGIC' },
  { id: 'twinkle', name: 'TWINKLE', price: 5.0, image: 'https://key-drop.com/uploads/skins/TWINKLE.png', series: 'MAGIC' },
  { id: 'last_game', name: 'LAST GAME', price: 20.0, image: 'https://key-drop.com/uploads/skins/4_LAST_GAME.png', series: 'MAGIC' },
  { id: 'your_crush', name: 'YOUR CRUSH', price: 50.0, image: 'https://key-drop.com/uploads/skins/5_YOUR_CRUSH.png', series: 'MAGIC' },
  { id: 'halloqueen', name: 'HALLOQUEEN', price: 75.0, image: 'https://key-drop.com/uploads/skins/HALLOQUEEN_2.png', series: 'HALLOWEEN' },
  { id: 'crocodilo', name: 'CROCODILO', price: 1.0, image: 'https://key-drop.com/uploads/skins/CROCODILO.png', series: 'BRAINROT' },
  { id: 'sahur', name: 'SAHUR', price: 4.0, image: 'https://key-drop.com/uploads/skins/SAHUR.png', series: 'BRAINROT' },
  { id: 'ballerina', name: 'BALLERINA', price: 7.5, image: 'https://key-drop.com/uploads/skins/BALLERINA.png', series: 'BRAINROT' },
  { id: 'iconico', name: 'ICONICO', price: 0.8, image: 'https://key-drop.com/uploads/skins/ICONICO1.png', series: 'PORTUGAL' },
  { id: 'siiiuu', name: 'SIIIIUUUU', price: 6.5, image: 'https://key-drop.com/uploads/skins/SIIIIUUUU1.png', series: 'PORTUGAL' },
  { id: 'patrao', name: 'PATRAO', price: 13.5, image: 'https://key-drop.com/uploads/skins/PATRAO1.png', series: 'PORTUGAL' },
  { id: 'sortudo', name: 'SORTUDO', price: 50.0, image: 'https://key-drop.com/uploads/skins/SORTUDO1.png', series: 'PORTUGAL' },
  { id: 'fang', name: 'FANG', price: 29.21, image: 'https://key-drop.com/uploads/skins/FANG1.png', series: 'PREDATOR' },
  { id: 'razor', name: 'RAZOR', price: 8.69, image: 'https://key-drop.com/uploads/skins/RAZOR.png', series: 'PREDATOR' },
  { id: 'strike', name: 'STRIKE', price: 4.72, image: 'https://key-drop.com/uploads/skins/STRIKE.png', series: 'PREDATOR' },
  { id: 'dragon', name: 'DRAGON', price: 3.88, image: 'https://key-drop.com/uploads/skins/DRAGON.png', series: 'PREDATOR' },
  { id: 'drink_me', name: 'DRINK ME', price: 1.0, image: 'https://key-drop.com/uploads/skins/1_DRINK_ME.png', series: 'WONDERLAND' },
  { id: 'tick_tock', name: 'TICK TOCK', price: 2.5, image: 'https://key-drop.com/uploads/skins/2_TICK_TOCK.png', series: 'WONDERLAND' },
  { id: 'dream', name: 'DREAM OR REAL', price: 5.0, image: 'https://key-drop.com/uploads/skins/3_DREAM_OR_REAL.png', series: 'WONDERLAND' },
  { id: 'mad_tea', name: 'MAD TEA', price: 20.0, image: 'https://key-drop.com/uploads/skins/4_MAD_TEA.png', series: 'WONDERLAND' },
  { id: 'checkmate', name: 'CHECKMATE', price: 50.0, image: 'https://key-drop.com/uploads/skins/5_CHECKMATE.png', series: 'WONDERLAND' },
  { id: 'utopia', name: 'UTOPIA', price: 250.0, image: 'https://key-drop.com/uploads/skins/6_UTOPIA.png', series: 'WONDERLAND' },
  { id: 'butterfly', name: 'BUTTERFLY', price: 742.5, image: 'https://key-drop.com/uploads/skins/1_111.png', series: 'PREMIUM' },
  { id: 'bloodshot', name: 'BLOODSHOT', price: 315.72, image: 'https://key-drop.com/uploads/skins/1_5.png', series: 'PREMIUM' },
  { id: 'lore', name: 'LORE', price: 394.64, image: 'https://key-drop.com/uploads/skins/1_2.png', series: 'PREMIUM' },
  { id: 'sport', name: 'SPORT', price: 1700.0, image: 'https://key-drop.com/uploads/skins/high_premium_6.png', series: 'PREMIUM' },
  { id: 'pandora', name: 'PANDORA', price: 5000.0, image: 'https://key-drop.com/uploads/skins/high_premium_5.png', series: 'PREMIUM' },
];

// Generate skins for a case based on price tiers
const SKIN_NAMES = {
  gold: ['Karambit | Doppler', 'Butterfly | Fade', 'M9 Bayonet | Tiger Tooth', 'Bayonet | Marble Fade', 'Talon Knife | Slaughter'],
  covert: ['AK-47 | Fire Serpent', 'AWP | Dragon Lore', 'M4A4 | Howl', 'AWP | Gungnir', 'AK-47 | Wild Lotus'],
  classified: ['AK-47 | Redline', 'AWP | Asiimov', 'M4A1-S | Hot Rod', 'USP-S | Kill Confirmed', 'Glock-18 | Fade'],
  restricted: ['AK-47 | Frontside Misty', 'M4A4 | Desolate Space', 'USP-S | Orion', 'AWP | Atheris', 'AUG | Chameleon'],
  milspec: ['AK-47 | Elite Build', 'M4A1-S | Basilisk', 'Glock-18 | Water Elemental', 'P250 | Asiimov', 'MP7 | Bloodsport'],
};

const SKIN_IMGS_POOL = [
  SKIN_IMG.ak_redline, SKIN_IMG.ak_steel, SKIN_IMG.awp_dragon, SKIN_IMG.m4_howl,
  'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHJOXD5wVaPoJ61BVFRUnVRoaiiYGZY1wyoohvoZlZGxyEKtlAptMaEs_Qa7r7PK8-TJRq-y5y',
  'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXG5QpbOIRjlBxeREnBRfqt1ATNXl9sKggpu-6kejhjxszFelBUupciib2RVA85j7udLF4_3r2QptSnmeXLPLfRmm5DvJBzjqnAot7339mxrU8YPG_6LIORew83Y1qB-1u3xLrp0MPo7cvKmHBnviEh4XzemUGwgUsYab4c5Ek',
];

export function buildCaseItems(caseData) {
  const items = [];
  const rarities = [
    { rarity: 'gold', count: 2, multiplier: [8, 30] },
    { rarity: 'covert', count: 3, multiplier: [3, 8] },
    { rarity: 'classified', count: 4, multiplier: [1.2, 3] },
    { rarity: 'restricted', count: 5, multiplier: [0.4, 1.2] },
    { rarity: 'milspec', count: 6, multiplier: [0.1, 0.4] },
  ];
  rarities.forEach(({ rarity, count, multiplier }) => {
    for (let i = 0; i < count; i++) {
      const names = SKIN_NAMES[rarity];
      const name = names[i % names.length];
      const wear = WEAR_CONDITIONS[Math.floor(Math.random() * WEAR_CONDITIONS.length)];
      const mult = multiplier[0] + Math.random() * (multiplier[1] - multiplier[0]);
      const price = +(caseData.price * mult).toFixed(2);
      items.push({
        id: `${caseData.id}_${rarity}_${i}`,
        name,
        wear,
        rarity,
        price,
        image: SKIN_IMGS_POOL[Math.floor(Math.random() * SKIN_IMGS_POOL.length)],
      });
    }
  });
  return items;
}

export const CASE_ITEMS_CACHE = {};
export function getCaseItems(caseId) {
  if (!CASE_ITEMS_CACHE[caseId]) {
    const c = CASES.find((x) => x.id === caseId);
    CASE_ITEMS_CACHE[caseId] = buildCaseItems(c);
  }
  return CASE_ITEMS_CACHE[caseId];
}

export const DEFAULT_USER = {
  id: 'guest',
  name: 'PashaBiceps_Fan',
  avatar: 'https://images.unsplash.com/photo-1772371272167-0117a6573d58?w=100&h=100&fit=crop',
  balance: 1250.0,
  level: 24,
  rank: 'Community Member',
};

export const LEADERBOARD = [
  { rank: 1, name: 'xXDragonXx', avatar: 'https://images.unsplash.com/photo-1772371272208-412168748f2a?w=100&h=100&fit=crop', wagered: 24850.33, reward: 'CHAMPION BOX' },
  { rank: 2, name: 'SkinMaster', avatar: 'https://images.unsplash.com/photo-1772371272228-f4a8247cfe6d?w=100&h=100&fit=crop', wagered: 18320.75, reward: 'CHALLENGER BOX' },
  { rank: 3, name: 'LuckyLuke', avatar: 'https://images.unsplash.com/photo-1772371272167-0117a6573d58?w=100&h=100&fit=crop', wagered: 12540.10, reward: 'CONTENDER BOX' },
  { rank: 4, name: 'PashaBiceps_Fan', avatar: 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg', wagered: 9850.42, reward: '-' },
  { rank: 5, name: 'HeadshotKing', avatar: 'https://images.unsplash.com/photo-1772371272141-0fbd644b65c4?w=100&h=100&fit=crop', wagered: 7420.00, reward: '-' },
  { rank: 6, name: 'AWPer_One', avatar: 'https://images.unsplash.com/photo-1588590560438-5e27fe3f6b71?w=100&h=100&fit=crop', wagered: 5120.88, reward: '-' },
  { rank: 7, name: 'NoobSlayer', avatar: 'https://images.unsplash.com/photo-1690671832354-9fe1f3ae559d?w=100&h=100&fit=crop', wagered: 3980.14, reward: '-' },
  { rank: 8, name: 'SilverScrub', avatar: 'https://images.unsplash.com/photo-1772371272208-412168748f2a?w=100&h=100&fit=crop', wagered: 2150.00, reward: '-' },
];

export const BATTLES_OPEN = [
  { id: 'b1', creator: { name: 'xXDragonXx', avatar: 'https://images.unsplash.com/photo-1772371272208-412168748f2a?w=100&h=100&fit=crop' }, cases: ['dragon_roll', 'fang', 'halloqueen'], mode: '1v1', value: 284.71 },
  { id: 'b2', creator: { name: 'LuckyLuke', avatar: 'https://images.unsplash.com/photo-1772371272167-0117a6573d58?w=100&h=100&fit=crop' }, cases: ['sortudo', 'sortudo', 'patrao'], mode: '2v2', value: 113.5 },
  { id: 'b3', creator: { name: 'SkinMaster', avatar: 'https://images.unsplash.com/photo-1772371272228-f4a8247cfe6d?w=100&h=100&fit=crop' }, cases: ['utopia', 'utopia'], mode: '1v1', value: 500 },
  { id: 'b4', creator: { name: 'HeadshotKing', avatar: 'https://images.unsplash.com/photo-1772371272141-0fbd644b65c4?w=100&h=100&fit=crop' }, cases: ['iconico', 'siiiuu', 'patrao'], mode: '1v1v1', value: 20.8 },
];

export const CHANGELOG = [
  {
    date: '25 APR, 2026',
    isNew: true,
    items: [
      'Adicionadas 6 caixas novas. (BUTTERFLY, BLOODSHOT, LORE, MIKEDEV, SPORT, PANDORA).',
      'Agora o som de spin das CAIXAS é um único som reproduzido a cada item que passa e não um audio pré-feito.',
      'O bug do RANKING DIÁRIO não resetar agora deve estar corrigido, caso continue a ocorrer, por favor, reporte.',
      'Corrigido bug de ter várias skins iguais com preços diferentes no UPGRADER.',
      'Alterado o spin das CAIXAS para mostrar uma posição mais precisa do item vencedor.',
    ],
  },
  {
    date: '8 APR, 2026',
    items: [
      'Adicionado Ranking Diário com as caixas (CHAMPION BOX, CHALLENGER BOX e CONTENDER BOX) como recompensa para os top 3 usuários.',
      'Adicionadas 6 caixas novas. (DRINK ME, TICK TOCK, DREAM OR REAL, MAD TEA, CHECKMATE, UTOPIA).',
      'Adicionadas 149 skins novas.',
      'Corrigido bug de qualquer item de REROLL ser mostrado imediatamente no modo de jogo Battles.',
      'Removida a possibilidade dos Bots criarem Battles.',
    ],
  },
  {
    date: '27 MAR, 2026',
    items: ['Adicionadas 4 caixas novas. (FANG, RAZOR, STRIKE, DRAGON).'],
  },
  {
    date: '22 MAR, 2026',
    items: [
      'Adicionado novo modo UNDERDOG nas batalhas de caixas.',
      'Adicionada opção para dar "Lock" a certas skins para não serem afetadas pelo "Sell All".',
      'Adicionadas 4 caixas novas. (ICONICO, SIIIIUUUU, SORTUDO, PATRAO)',
      'Adicionada opção de ver as "Changelogs" nas Settings.',
    ],
  },
];

export const INITIAL_INVENTORY = [
  { id: 'inv_1', name: 'AK-47 | Redline', wear: 'FT', rarity: 'classified', price: 38.50, image: SKIN_IMG.ak_redline, locked: false },
  { id: 'inv_2', name: 'AWP | Asiimov', wear: 'FN', rarity: 'covert', price: 125.00, image: SKIN_IMGS_POOL[4], locked: true },
  { id: 'inv_3', name: 'M4A4 | Howl', wear: 'MW', rarity: 'covert', price: 2500.00, image: SKIN_IMG.m4_howl, locked: false },
  { id: 'inv_4', name: 'Glock-18 | Fade', wear: 'FN', rarity: 'classified', price: 420.00, image: SKIN_IMGS_POOL[5], locked: false },
  { id: 'inv_5', name: 'USP-S | Kill Confirmed', wear: 'FT', rarity: 'classified', price: 88.00, image: SKIN_IMGS_POOL[0], locked: false },
  { id: 'inv_6', name: 'AK-47 | Elite Build', wear: 'MW', rarity: 'milspec', price: 12.50, image: SKIN_IMGS_POOL[1], locked: false },
];
