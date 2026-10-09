import Link from "next/link";

export default function NotFound() {
  return (
    <div className="stage py-28">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-6xl md:text-7xl">Похоже, этот SECRET потерялся.</h1>
      <Link href="/" className="btn-primary mt-8">
        Вернуться домой
      </Link>
    </div>
  );
}
