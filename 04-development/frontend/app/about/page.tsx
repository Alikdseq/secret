export default function AboutPage() {
  return (
    <div className="stage grid items-center gap-10 py-12 lg:grid-cols-2">
      <div>
        <p className="eyebrow">О демо</p>
        <h1 className="mt-3 font-serif text-5xl leading-[0.95] md:text-7xl">Цветы — это не про цветы. Это про человека, которому ты их даришь.</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-black/70">
          <p>SECRET в этом макете — цифровое ателье: холодильник, из которого букет собирают руками, подбор и игра. Не витрина «розы / доставка / контакты».</p>
          <p>Историю магазина, адрес, телефон, график, сертификаты и обещание «самые свежие» мы сюда не ставили. Этих фактов в проекте нет.</p>
          <p>Если хозяйка подтвердит формулировку, отдельно можно говорить о цветах, которые долго радуют. Пока это не текст сайта.</p>
        </div>
      </div>
      <img src="/images/bouquet-harmony.jpg" alt="Букет в демо SECRET" className="aspect-[4/5] w-full rounded-[36px] object-cover" />
    </div>
  );
}
