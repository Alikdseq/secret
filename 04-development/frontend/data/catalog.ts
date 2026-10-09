export type Tag = "author" | "roses" | "peonies" | "mono" | "composition" | "gifts";

export type Bouquet = {
  slug: string;
  name: string;
  epithet: string;
  composition: string;
  story: string;
  price: number;
  image: string;
  hover: string;
  tags: Tag[];
};

export type Flower = {
  id: string;
  name: string;
  price: number;
  image: string;
  available: boolean;
};

export type Addon = {
  id: string;
  name: string;
  price: number;
  image: string;
  note: string;
};

export type MoodId =
  | "tenderness"
  | "love"
  | "joy"
  | "gratitude"
  | "admiration"
  | "surprise"
  | "anyway";

export type ColorId = "white" | "pink" | "red" | "peach" | "yellow" | "purple" | "green" | "mix";

export type SizeId = "S" | "M" | "L";

export type PackId = "ivory" | "blush" | "sage" | "premium" | "transparent";

export const categories: { id: "all" | Tag; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "author", label: "Авторские" },
  { id: "roses", label: "Розы" },
  { id: "peonies", label: "Пионы" },
  { id: "mono", label: "Монобукеты" },
  { id: "composition", label: "Композиции" },
  { id: "gifts", label: "Подарки" },
];

export const bouquets: Bouquet[] = [
  {
    slug: "luminous",
    name: "Luminous",
    epithet: "светлый, воздушный",
    composition: "Пион · Роза · Эустома · Эвкалипт",
    story: "Тихий свет и много воздуха. Для человека, которому не нужен громкий жест.",
    price: 5900,
    image: "/images/bouquet-luminous.jpg",
    hover: "/images/bouquet-harmony.jpg",
    tags: ["author", "peonies", "composition"],
  },
  {
    slug: "pink-secret",
    name: "Pink Secret",
    epithet: "мягкий, близкий",
    composition: "Пион · Кустовая роза · Ранункулюс",
    story: "Розовый без крика. Букет, который говорит тише, чем открытка.",
    price: 6400,
    image: "/images/bouquet-royal.jpg",
    hover: "/images/bouquet-luminous.jpg",
    tags: ["author", "peonies", "roses"],
  },
  {
    slug: "moonlight",
    name: "Moonlight",
    epithet: "белый, собранный",
    composition: "Белый пион · Роза · Эвкалипт",
    story: "Почти монохром. Оставляем форму и свет, убираем лишнее.",
    price: 7200,
    image: "/images/bouquet-moonlight.jpg",
    hover: "/images/bouquet-harmony.jpg",
    tags: ["mono", "peonies", "author"],
  },
  {
    slug: "white-harmony",
    name: "White Harmony",
    epithet: "спокойный, ясный",
    composition: "Роза · Ранункулюс · Эвкалипт",
    story: "Ровная, дышащая композиция. Хороша, когда повод не нужно объяснять.",
    price: 4900,
    image: "/images/bouquet-harmony.jpg",
    hover: "/images/bouquet-moonlight.jpg",
    tags: ["composition", "roses"],
  },
  {
    slug: "love-story",
    name: "Love Story",
    epithet: "тёплый, плотный",
    composition: "Роза · Ранункулюс · Пион",
    story: "Плотный центр и мягкий край. Для разговора, который и так уже начался.",
    price: 6900,
    image: "/images/bouquet-love.jpg",
    hover: "/images/bouquet-royal.jpg",
    tags: ["roses", "author", "gifts"],
  },
  {
    slug: "royal",
    name: "Royal",
    epithet: "собранный, заметный",
    composition: "Пион · Роза · Сезонная зелень",
    story: "Крупнее обычного и всё ещё светлый. Не витрина «дорого», а объём и пауза.",
    price: 7900,
    image: "/images/bouquet-love.jpg",
    hover: "/images/bouquet-luminous.jpg",
    tags: ["author", "composition", "gifts"],
  },
];

export const flowers: Flower[] = [
  { id: "rose", name: "Роза", price: 280, image: "/images/cut-rose.jpg", available: true },
  { id: "peony", name: "Пион", price: 420, image: "/images/cut-peony.jpg", available: true },
  { id: "eustoma", name: "Эустома", price: 240, image: "/images/cut-eustoma.jpg", available: true },
  { id: "tulip", name: "Тюльпан", price: 190, image: "/images/macro-tulip.jpg", available: true },
  { id: "hydrangea", name: "Гортензия", price: 460, image: "/images/macro-hydrangea.jpg", available: true },
  { id: "chrysanthemum", name: "Хризантема", price: 180, image: "/images/macro-chrysanthemum.jpg", available: true },
  { id: "alstroemeria", name: "Альстромерия", price: 160, image: "/images/macro-alstroemeria.jpg", available: true },
  { id: "eucalyptus", name: "Эвкалипт", price: 90, image: "/images/cut-eucalyptus.jpg", available: true },
];

export const addons: Addon[] = [
  { id: "card", name: "Открытка", price: 250, image: "/images/still-card.jpg", note: "Короткое слово рядом с букетом" },
  { id: "sweets", name: "Конфеты", price: 690, image: "/images/still-sweets.jpg", note: "Маленькая коробка к цветам" },
  { id: "candle", name: "Свеча", price: 890, image: "/images/still-candle.jpg", note: "Тёплый свет после букета" },
  { id: "vase", name: "Ваза", price: 1490, image: "/images/still-vase.jpg", note: "Чтобы цветы сразу встали в воду" },
];

export const moods: { id: MoodId; label: string; price: number; image: string; flowers: Record<string, number> }[] = [
  { id: "tenderness", label: "Нежность", price: 5900, image: "/images/bouquet-luminous.jpg", flowers: { peony: 3, rose: 2, eustoma: 2, eucalyptus: 2 } },
  { id: "love", label: "Любовь", price: 6900, image: "/images/bouquet-love.jpg", flowers: { rose: 7, peony: 2, eucalyptus: 2 } },
  { id: "joy", label: "Радость", price: 5400, image: "/images/bouquet-royal.jpg", flowers: { tulip: 5, rose: 3, eustoma: 2 } },
  { id: "gratitude", label: "Благодарность", price: 4900, image: "/images/bouquet-harmony.jpg", flowers: { rose: 4, eustoma: 3, eucalyptus: 3 } },
  { id: "admiration", label: "Восхищение", price: 7900, image: "/images/bouquet-love.jpg", flowers: { peony: 5, rose: 4, hydrangea: 1 } },
  { id: "surprise", label: "Хочу удивить", price: 7200, image: "/images/bouquet-moonlight.jpg", flowers: { peony: 4, hydrangea: 1, eucalyptus: 3 } },
  { id: "anyway", label: "Просто так", price: 4500, image: "/images/bouquet-harmony.jpg", flowers: { rose: 3, eustoma: 3, eucalyptus: 2 } },
];

export const colors: { id: ColorId; label: string; swatch: string; image: string }[] = [
  { id: "white", label: "Белый", swatch: "#F4F1EC", image: "/images/bouquet-moonlight.jpg" },
  { id: "pink", label: "Розовый", swatch: "#E7C4C6", image: "/images/bouquet-luminous.jpg" },
  { id: "red", label: "Красный", swatch: "#8C3A3A", image: "/images/bouquet-love.jpg" },
  { id: "peach", label: "Персик", swatch: "#F0CDB8", image: "/images/bouquet-royal.jpg" },
  { id: "yellow", label: "Жёлтый", swatch: "#E6D3A1", image: "/images/bouquet-harmony.jpg" },
  { id: "purple", label: "Фиолетовый", swatch: "#C7B7C9", image: "/images/bouquet-love.jpg" },
  { id: "green", label: "Зелёный", swatch: "#C5D0C0", image: "/images/bouquet-harmony.jpg" },
  { id: "mix", label: "Микс", swatch: "linear-gradient(135deg,#F4F1EC,#E7C4C6,#C5D0C0)", image: "/images/bouquet-luminous.jpg" },
];

export const packs: { id: PackId; label: string; price: number; color: string }[] = [
  { id: "ivory", label: "Ivory", price: 0, color: "#F3E6D6" },
  { id: "blush", label: "Blush", price: 200, color: "#E7C4C4" },
  { id: "sage", label: "Sage", price: 200, color: "#C9D3C2" },
  { id: "premium", label: "Premium", price: 600, color: "#1B2621" },
  { id: "transparent", label: "Прозрачная", price: 300, color: "rgba(255,255,255,0.72)" },
];

export const sizes: { id: SizeId; label: string; factor: number; hint: string }[] = [
  { id: "S", label: "S", factor: 0.82, hint: "камерный" },
  { id: "M", label: "M", factor: 1, hint: "как в студии" },
  { id: "L", label: "L", factor: 1.28, hint: "больше воздуха и объёма" },
];

export function getBouquet(slug: string) {
  return bouquets.find((item) => item.slug === slug);
}

export function getFlower(id: string) {
  return flowers.find((item) => item.id === id);
}

export function getMood(id: MoodId) {
  return moods.find((item) => item.id === id) ?? moods[0];
}

export function getColor(id: ColorId) {
  return colors.find((item) => item.id === id) ?? colors[1];
}

export function getPack(id: PackId) {
  return packs.find((item) => item.id === id) ?? packs[0];
}

export function sizeFactor(id: SizeId) {
  return sizes.find((item) => item.id === id)?.factor ?? 1;
}
