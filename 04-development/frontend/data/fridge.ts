export type FlowerRole = "focal" | "filler" | "mass" | "greenery";
export type FridgeGroup = "focal" | "extra" | "green";

export type FridgeFlower = {
  id: string;
  name: string;
  price: number;
  images: string[];
  role: FlowerRole;
  group: FridgeGroup;
  stemCm: number;
  visualScale: number;
  available: boolean;
  seasonal?: boolean;
  line: string;
  shelf: 0 | 1 | 2;
  spot: number;
};

export type Stem = {
  id: string;
  flowerId: string;
  image: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  z: number;
  flip: boolean;
  /** Заложено для следующего уровня: длина и угол стебля. В столе MVP не редактируются. */
  stemLength?: number;
  stemAngle?: number;
};

export type GamePack = {
  id: string;
  label: string;
  line: string;
  price: number;
  color: string;
  ink: string;
};

export const gamePacks: GamePack[] = [
  { id: "ivory", label: "Ivory", line: "Молочная классика", price: 300, color: "#F3E6D6", ink: "#171717" },
  { id: "pure", label: "Pure", line: "Белая, почти без цвета", price: 300, color: "#F7F4EF", ink: "#171717" },
  { id: "sage", label: "Sage", line: "Приглушённый зелёный", price: 350, color: "#C9D3C2", ink: "#171717" },
  { id: "graphite", label: "Graphite", line: "Тёмная, премиальная", price: 400, color: "#3A3F3C", ink: "#F6F1EA" },
  { id: "dusty", label: "Dusty Rose", line: "Пыльная роза", price: 350, color: "#E7C4C4", ink: "#171717" },
  { id: "black", label: "SECRET Black", line: "Чёрная фирменная", price: 450, color: "#1B2621", ink: "#F6F1EA" },
];

export const cardStyles = [
  { id: "none", label: "Без открытки", price: 0 },
  { id: "classic", label: "Классическая", price: 250 },
  { id: "minimal", label: "Минималистичная", price: 250 },
  { id: "secret", label: "SECRET Card", price: 300 },
] as const;

export const fridgeFlowers: FridgeFlower[] = [
  {
    id: "rose",
    name: "Роза",
    price: 450,
    images: ["/images/flowers/rose/rose-01.png", "/images/flowers/rose/rose-02.png", "/images/flowers/rose/rose-03.png"],
    role: "focal",
    group: "focal",
    stemCm: 55,
    visualScale: 1,
    available: true,
    line: "Плотный центр и живой край.",
    shelf: 0,
    spot: 0,
  },
  {
    id: "peony",
    name: "Пион",
    price: 700,
    images: ["/images/flowers/peony/peony-01.png"],
    role: "focal",
    group: "focal",
    stemCm: 55,
    visualScale: 1.06,
    available: true,
    seasonal: true,
    line: "Нежный, объёмный, сезонный.",
    shelf: 0,
    spot: 1,
  },
  {
    id: "tulip",
    name: "Тюльпан",
    price: 300,
    images: ["/images/flowers/tulip/tulip-01.png"],
    role: "filler",
    group: "focal",
    stemCm: 45,
    visualScale: 0.86,
    available: true,
    line: "Тонкий стебель, прозрачный лепесток.",
    shelf: 0,
    spot: 2,
  },
  {
    id: "eustoma",
    name: "Эустома",
    price: 350,
    images: ["/images/flowers/eustoma/eustoma-01.png"],
    role: "filler",
    group: "extra",
    stemCm: 60,
    visualScale: 1.02,
    available: true,
    line: "Несколько голов на одном стебле.",
    shelf: 1,
    spot: 0,
  },
  {
    id: "chrysanthemum",
    name: "Хризантема",
    price: 300,
    images: ["/images/flowers/chrysanthemum/chrysanthemum-01.png"],
    role: "filler",
    group: "extra",
    stemCm: 50,
    visualScale: 0.94,
    available: true,
    line: "Много отдельных лепестков.",
    shelf: 1,
    spot: 1,
  },
  {
    id: "hydrangea",
    name: "Гортензия",
    price: 900,
    images: ["/images/flowers/hydrangea/hydrangea-01.png"],
    role: "mass",
    group: "extra",
    stemCm: 55,
    visualScale: 1.12,
    available: true,
    seasonal: true,
    line: "Одна шапка на одном стебле.",
    shelf: 1,
    spot: 2,
  },
  {
    id: "eucalyptus",
    name: "Эвкалипт",
    price: 250,
    images: ["/images/flowers/eucalyptus/eucalyptus-01.png"],
    role: "greenery",
    group: "green",
    stemCm: 70,
    visualScale: 1.16,
    available: true,
    line: "Зелень, которая держит форму.",
    shelf: 2,
    spot: 0,
  },
  {
    id: "ranunculus",
    name: "Ранункулюс",
    price: 650,
    images: [],
    role: "focal",
    group: "focal",
    stemCm: 40,
    visualScale: 0.9,
    available: false,
    line: "Сейчас этой поставки нет.",
    shelf: 2,
    spot: 2,
  },
];

export const moodHints = [
  { id: "tenderness", label: "Нежность", flowers: ["peony", "eustoma"] },
  { id: "love", label: "Любовь", flowers: ["rose", "peony"] },
  { id: "joy", label: "Радость", flowers: ["tulip", "rose"] },
  { id: "gratitude", label: "Благодарность", flowers: ["eustoma", "eucalyptus"] },
];

export function getFridgeFlower(id: string) {
  return fridgeFlowers.find((flower) => flower.id === id);
}

export function pickImage(flower: FridgeFlower, used: number) {
  if (!flower.images.length) return "";
  return flower.images[used % flower.images.length];
}

export function openingSpot(index: number, role: FlowerRole) {
  const column = index % 3;
  const row = Math.floor(index / 3);
  const jitter = ((index * 13) % 11) - 5;
  return {
    x: (column - 1) * 86 + jitter,
    y: row * 36 - 10 + (role === "greenery" ? 28 : 0),
    rotation: (role === "greenery" ? -18 : -4) + jitter,
    z: (role === "greenery" ? 2 : 12) + index,
    scale: role === "mass" ? 1.08 : role === "greenery" ? 0.94 : 1,
  };
}

export function flowerTotal(stems: Stem[]) {
  return stems.reduce((sum, stem) => sum + (getFridgeFlower(stem.flowerId)?.price ?? 0), 0);
}

export function compositionLines(stems: Stem[]) {
  const counts = new Map<string, number>();
  stems.forEach((stem) => counts.set(stem.flowerId, (counts.get(stem.flowerId) ?? 0) + 1));
  return [...counts.entries()].map(([id, qty]) => ({
    id,
    qty,
    name: getFridgeFlower(id)?.name ?? id,
  }));
}
