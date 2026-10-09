export const DELIVERY_FEE = 500;
export const FREE_FROM = 8000;

export function rub(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export function secretCode(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return 1000 + (Math.abs(hash) % 9000);
}

export function roundPrice(value: number) {
  return Math.round(value / 10) * 10;
}
