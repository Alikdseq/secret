export type GameFlower = {
  id: string;
  name: string;
  image: string;
  answers: string[];
  line: string;
};

export const gameFlowers: GameFlower[] = [
  { id: "rose", name: "Роза", image: "/images/macro-rose.jpg", answers: ["роза", "розы"], line: "Плотный центр и мягкий край." },
  { id: "peony", name: "Пион", image: "/images/macro-peony.jpg", answers: ["пион", "пионы"], line: "Нежность, объём и немного роскоши." },
  { id: "tulip", name: "Тюльпан", image: "/images/macro-tulip.jpg", answers: ["тюльпан", "тюльпаны"], line: "Чистая линия. Почти рисунок." },
  { id: "hydrangea", name: "Гортензия", image: "/images/macro-hydrangea.jpg", answers: ["гортензия"], line: "Облако из мелких цветков." },
  { id: "ranunculus", name: "Ранункулюс", image: "/images/macro-ranunculus.jpg", answers: ["ранункулюс", "лютик"], line: "Спираль лепестков, как ткань." },
  { id: "anemone", name: "Анемон", image: "/images/macro-anemone.jpg", answers: ["анемон", "анемона"], line: "Светлый край и тёмный центр." },
  { id: "eustoma", name: "Эустома", image: "/images/macro-eustoma.jpg", answers: ["эустома", "лизиантус"], line: "Похожа на розу, но легче." },
  { id: "chrysanthemum", name: "Хризантема", image: "/images/macro-chrysanthemum.jpg", answers: ["хризантема"], line: "Много лепестков, один характер." },
  { id: "alstroemeria", name: "Альстромерия", image: "/images/macro-alstroemeria.jpg", answers: ["альстромерия"], line: "Тонкие штрихи на лепестке." },
];

export function dayOfYear(date: Date) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((today - start) / 86400000);
}

export function flowerForDate(date: Date) {
  const index = dayOfYear(date) % gameFlowers.length;
  return gameFlowers[index];
}

export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replaceAll("ё", "е").replace(/\s+/g, " ");
}

export function isCorrect(flower: GameFlower, value: string) {
  const answer = normalizeAnswer(value);
  return flower.answers.some((item) => normalizeAnswer(item) === answer);
}
