"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cardStyles,
  compositionLines,
  fridgeFlowers,
  gamePacks,
  getFridgeFlower,
  moodHints,
  openingSpot,
  pickImage,
  type FridgeFlower,
  type FridgeGroup,
  type Stem,
} from "@/data/fridge";
import { rub, secretCode } from "@/lib/money";
import { useShop } from "@/lib/store";

type Phase = "intro" | "play" | "pack" | "card" | "final";
type View = "stems" | "above";
type Drag =
  | { type: "new"; flowerId: string; image: string; x: number; y: number; moved: boolean }
  | { type: "move"; id: string; x: number; y: number; moved: boolean };

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const vaseSpot = [
  ["left-[1%] top-[1%] h-[33%] w-[32%]", "left-[34%] top-[0%] h-[34%] w-[32%]", "left-[66%] top-[2%] h-[32%] w-[32%]"],
  ["left-[2%] top-[36%] h-[31%] w-[31%]", "left-[34%] top-[35%] h-[32%] w-[32%]", "left-[66%] top-[37%] h-[30%] w-[32%]"],
  ["left-[6%] top-[68%] h-[30%] w-[30%]", "left-[36%] top-[69%] h-[28%] w-[28%]", "left-[64%] top-[68%] h-[30%] w-[30%]"],
];
const filters: { id: "all" | FridgeGroup; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "focal", label: "Фокусные" },
  { id: "extra", label: "Дополнительные" },
  { id: "green", label: "Зелень" },
];

export function FlowerGame() {
  const router = useRouter();
  const add = useShop((s) => s.add);
  const reward = useShop((s) => s.guessReward);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const stemsRef = useRef<Stem[]>([]);
  const past = useRef<Stem[][]>([]);
  const future = useRef<Stem[][]>([]);
  const skipSave = useRef(true);
  const shownRef = useRef(0);
  const scaleTimer = useRef(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; scale: number; angle: number; rotation: number } | null>(null);

  const [phase, setPhase] = useState<Phase>("intro");
  const [stems, setStems] = useState<Stem[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [over, setOver] = useState(false);
  const [hint, setHint] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [assist, setAssist] = useState<{ x: number; y: number } | null>(null);
  const [view, setView] = useState<View>("stems");
  const [looking, setLooking] = useState(false);
  const [packId, setPackId] = useState(gamePacks[0].id);
  const [cardId, setCardId] = useState<(typeof cardStyles)[number]["id"]>("none");
  const [note, setNote] = useState("");
  const [hideSender, setHideSender] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [shownTotal, setShownTotal] = useState(0);
  const [helper, setHelper] = useState(false);
  const [focus, setFocus] = useState<string[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [fine, setFine] = useState(true);
  const [wrapIn, setWrapIn] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  stemsRef.current = stems;
  const pack = gamePacks.find((item) => item.id === packId) ?? gamePacks[0];
  const card = cardStyles.find((item) => item.id === cardId) ?? cardStyles[0];
  const flowerSum = stems.reduce((sum, stem) => sum + (getFridgeFlower(stem.flowerId)?.price ?? 0), 0);
  const cardPrice = card.id === "none" ? 0 : reward ? 0 : card.price;
  const showPack = phase === "pack" || phase === "card" || phase === "final";
  const showCard = phase === "card" || phase === "final";
  const total = flowerSum + (showPack ? pack.price : 0) + (showCard ? cardPrice : 0);
  const lines = useMemo(() => compositionLines(stems), [stems]);
  const code = secretCode(lines.map((line) => `${line.id}:${line.qty}`).join("|") + pack.id + note);
  const hovered = fridgeFlowers.find((flower) => flower.id === hoverId);
  const selectedStem = stems.find((stem) => stem.id === selected);
  const selectedFlower = selectedStem ? getFridgeFlower(selectedStem.flowerId) : undefined;
  const selectedCount = selectedStem ? stems.filter((stem) => stem.flowerId === selectedStem.flowerId).length : 0;
  const frontFirst = [...stems].sort((a, b) => b.z - a.z);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const apply = () => setFine(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("secret-flower-desk");
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as {
        stems?: Stem[];
        phase?: Phase;
        pack?: string;
        card?: (typeof cardStyles)[number]["id"];
        note?: string;
        view?: View;
        hideSender?: boolean;
      };
      if (Array.isArray(data.stems)) {
        setStems(
          data.stems.filter(
            (stem) => getFridgeFlower(stem.flowerId)?.available && typeof stem.x === "number" && typeof stem.scale === "number" && typeof stem.rotation === "number",
          ),
        );
      }
      if (data.phase && data.phase !== "intro") setPhase(data.phase);
      if (data.pack) setPackId(data.pack);
      if (data.card) setCardId(data.card);
      if (typeof data.note === "string") setNote(data.note);
      if (data.view === "above" || data.view === "stems") setView(data.view);
      if (data.hideSender) setHideSender(true);
    } catch {
      sessionStorage.removeItem("secret-flower-desk");
    }
  }, []);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    sessionStorage.setItem(
      "secret-flower-desk",
      JSON.stringify({ stems, phase, pack: packId, card: cardId, note, view, hideSender }),
    );
  }, [stems, phase, packId, cardId, note, view, hideSender]);

  useEffect(() => {
    const from = shownRef.current;
    const start = performance.now();
    let frame = 0;
    let cancelled = false;
    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / 420);
      const value = Math.round(from + (total - from) * (1 - Math.pow(1 - t, 3)));
      shownRef.current = value;
      setShownTotal(value);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [total]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(timer);
  }, [flash]);

  useEffect(() => {
    if (phase === "play" || phase === "intro") {
      setWrapIn(false);
      return;
    }
    const timer = window.setTimeout(() => setWrapIn(true), 80);
    return () => window.clearTimeout(timer);
  }, [phase, packId]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || phase !== "play") return;
    const onWheel = (event: WheelEvent) => {
      if (!selected) return;
      event.preventDefault();
      if (!scaleTimer.current) remember();
      window.clearTimeout(scaleTimer.current);
      scaleTimer.current = window.setTimeout(() => {
        scaleTimer.current = 0;
      }, 280);
      const next = event.deltaY > 0 ? -0.08 : 0.08;
      setStems((current) => current.map((stem) => (stem.id === selected ? { ...stem, scale: clampScale(stem.scale + next) } : stem)));
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [selected, phase]);

  useEffect(() => {
    if (phase !== "play") return;
    const down = (event: PointerEvent) => {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.current.size !== 2 || !selected) return;
      const stem = stemsRef.current.find((item) => item.id === selected);
      if (!stem) return;
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        scale: stem.scale,
        angle: Math.atan2(b.y - a.y, b.x - a.x),
        rotation: stem.rotation,
      };
      remember();
    };
    const move = (event: PointerEvent) => {
      if (!pointers.current.has(event.pointerId)) return;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (!pinch.current || pointers.current.size < 2 || !selected) return;
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const scale = clampScale(pinch.current.scale * (dist / pinch.current.dist));
      const rotation = pinch.current.rotation + ((angle - pinch.current.angle) * 180) / Math.PI;
      setStems((current) => current.map((item) => (item.id === selected ? { ...item, scale, rotation } : item)));
    };
    const up = (event: PointerEvent) => {
      pointers.current.delete(event.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [selected, phase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selected && phase === "play") {
        event.preventDefault();
        removeStem(selected);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function remember() {
    past.current = [...past.current.slice(-39), stemsRef.current.map((stem) => ({ ...stem }))];
    future.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }

  function undo() {
    const previous = past.current.pop();
    if (!previous) return;
    future.current.push(stemsRef.current.map((stem) => ({ ...stem })));
    setStems(previous);
    setCanUndo(past.current.length > 0);
    setCanRedo(true);
  }

  function redo() {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(stemsRef.current.map((stem) => ({ ...stem })));
    setStems(next);
    setCanUndo(true);
    setCanRedo(future.current.length > 0);
  }

  function inStage(x: number, y: number) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function localPoint(x: number, y: number) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clamp(x - rect.left - rect.width / 2, -rect.width * 0.42, rect.width * 0.42),
      y: clamp(y - rect.top - rect.height / 2, -rect.height * 0.4, rect.height * 0.4),
    };
  }

  function easeApart(stem: Stem, all: Stem[]) {
    let { x, y } = stem;
    all.forEach((other) => {
      if (other.id === stem.id) return;
      const dx = x - other.x;
      const dy = y - other.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      if (dist < 18) {
        x += (dx / dist) * (24 - dist);
        y += (dy / dist) * (24 - dist);
      }
    });
    return { ...stem, x, y };
  }

  function place(flowerId: string, at: { x: number; y: number } | null, image?: string) {
    const flower = getFridgeFlower(flowerId);
    if (!flower?.available) return;
    remember();
    setStems((current) => {
      const used = current.filter((stem) => stem.flowerId === flowerId).length;
      const spot = openingSpot(current.length, flower.role);
      const born: Stem = {
        id: `${flowerId}-${Date.now()}-${current.length}`,
        flowerId,
        image: image || pickImage(flower, used),
        x: at?.x ?? spot.x,
        y: at?.y ?? spot.y,
        scale: spot.scale,
        rotation: spot.rotation + (used % 2 === 0 ? 7 : -9),
        z: Math.max(spot.z, ...current.map((stem) => stem.z), 0) + 1,
        flip: flower.images.length < 2 && used % 2 === 1,
      };
      const settled = at ? easeApart(born, current) : born;
      return [...current, settled];
    });
    setHint(false);
    setFlash(`+${rub(flower.price)}`);
    setSelected(null);
  }

  function updateStem(id: string, patch: Partial<Stem>, keepHistory = false) {
    if (keepHistory) remember();
    setStems((current) => current.map((stem) => (stem.id === id ? { ...stem, ...patch } : stem)));
  }

  function removeStem(id: string, record = true) {
    const stem = stemsRef.current.find((item) => item.id === id);
    const flower = stem ? getFridgeFlower(stem.flowerId) : undefined;
    if (record) remember();
    setStems((current) => current.filter((item) => item.id !== id));
    setSelected(null);
    if (flower) setFlash(`−${rub(flower.price)}`);
  }

  function duplicate(id: string) {
    const stem = stemsRef.current.find((item) => item.id === id);
    const flower = stem ? getFridgeFlower(stem.flowerId) : undefined;
    if (!stem || !flower) return;
    remember();
    const used = stemsRef.current.filter((item) => item.flowerId === stem.flowerId).length;
    const copy: Stem = {
      ...stem,
      id: `${stem.flowerId}-${Date.now()}-copy`,
      image: pickImage(flower, used),
      x: stem.x + 26,
      y: stem.y + 16,
      rotation: stem.rotation + 12,
      z: Math.max(...stemsRef.current.map((item) => item.z)) + 1,
      flip: flower.images.length < 2 ? !stem.flip : stem.flip,
    };
    setStems((current) => [...current, copy]);
    setSelected(copy.id);
    setFlash(`+${rub(flower.price)}`);
  }

  function orderLayers(frontToBack: string[]) {
    setStems((current) =>
      current.map((stem) => ({ ...stem, z: frontToBack.length - Math.max(0, frontToBack.indexOf(stem.id)) })),
    );
  }

  function shiftLayer(id: string, direction: -1 | 1) {
    const order = [...stemsRef.current].sort((a, b) => b.z - a.z).map((stem) => stem.id);
    const index = order.indexOf(id);
    const next = index + (direction === 1 ? -1 : 1);
    if (index < 0 || next < 0 || next >= order.length) return;
    remember();
    const copy = order.slice();
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    orderLayers(copy);
  }

  function trackNew(start: Drag & { type: "new" }, originX: number, originY: number) {
    const move = (event: PointerEvent) => {
      const moved = Math.hypot(event.clientX - originX, event.clientY - originY) > 6;
      const next: Drag = { ...start, x: event.clientX, y: event.clientY, moved: start.moved || moved };
      dragRef.current = next;
      setDrag(next);
      setOver(inStage(event.clientX, event.clientY));
    };
    const up = (event: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      setOver(false);
      if (!current || current.type !== "new") return;
      if (!current.moved || inStage(event.clientX, event.clientY)) {
        place(current.flowerId, current.moved ? localPoint(event.clientX, event.clientY) : null, current.image);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function takeFlower(event: React.PointerEvent, flower: FridgeFlower) {
    if (!flower.available || !fine) return;
    event.preventDefault();
    const used = stems.filter((stem) => stem.flowerId === flower.id).length;
    const start: Drag = { type: "new", flowerId: flower.id, image: pickImage(flower, used), x: event.clientX, y: event.clientY, moved: false };
    dragRef.current = start;
    setDrag(start);
    trackNew(start, event.clientX, event.clientY);
  }

  function takeStem(event: React.PointerEvent, stem: Stem) {
    event.preventDefault();
    event.stopPropagation();
    setSelected(stem.id);
    const origin = { x: event.clientX, y: event.clientY };
    let moved = false;
    let recorded = false;
    const move = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - origin.x, ev.clientY - origin.y) > 4) {
        moved = true;
        if (!recorded) {
          recorded = true;
          remember();
        }
      }
      const point = localPoint(ev.clientX, ev.clientY);
      const near = stemsRef.current.find((item) => item.id !== stem.id && Math.hypot(item.x - point.x, item.y - point.y) < 78);
      setAssist(near ? { x: near.x, y: near.y } : null);
      setStems((current) => current.map((item) => (item.id === stem.id ? { ...item, x: point.x, y: point.y } : item)));
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setAssist(null);
      if (!moved) return;
      if (!inStage(ev.clientX, ev.clientY)) {
        removeStem(stem.id, false);
        return;
      }
      const point = localPoint(ev.clientX, ev.clientY);
      setStems((current) => current.map((item) => (item.id === stem.id ? easeApart({ ...item, ...point }, current) : item)));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function rotateStem(event: React.PointerEvent, stem: Stem) {
    event.preventDefault();
    event.stopPropagation();
    remember();
    const move = (ev: PointerEvent) => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2 + stem.x;
      const cy = rect.top + rect.height / 2 + stem.y;
      const rotation = (Math.atan2(ev.clientX - cx, cy - ev.clientY) * 180) / Math.PI;
      setStems((current) => current.map((item) => (item.id === stem.id ? { ...item, rotation } : item)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function resetDesk() {
    remember();
    setStems([]);
    setSelected(null);
    setPhase("play");
    setCardId("none");
    setNote("");
    setHideSender(false);
    setPackId(gamePacks[0].id);
    setConfirmReset(false);
    setLooking(false);
  }

  function order() {
    const first = stems[0];
    const detail = lines.map((line) => `${line.qty} × ${line.name}`).join(", ");
    add({
      key: `custom:${code}`,
      name: `SECRET #${code}`,
      price: flowerSum + pack.price,
      image: first?.image ?? "/images/flowers/rose/rose-01.png",
      detail: `${detail} · ${pack.label}`,
      kind: "custom",
    });
    if (card.id !== "none") {
      add({
        key: `addon:card:${code}`,
        name: card.label,
        price: cardPrice,
        image: "/images/still-card.jpg",
        detail: note || "Без текста",
        kind: "addon",
      });
    }
    router.push("/cart");
  }

  function renderVase(flower: FridgeFlower, compact = false) {
    const lit = focus.includes(flower.id);
    const standing = flower.images.slice(0, 3);
    return (
      <button
        key={`${compact ? "m" : "d"}-${flower.id}`}
        type="button"
        disabled={!flower.available}
        onPointerDown={(event) => takeFlower(event, flower)}
        onClick={() => {
          if (!fine) place(flower.id, null);
        }}
        onMouseEnter={() => setHoverId(flower.id)}
        onMouseLeave={() => setHoverId((current) => (current === flower.id ? null : current))}
        className={`group ${compact ? "relative h-44 w-28 shrink-0" : `absolute ${vaseSpot[flower.shelf][flower.spot]}`} ${
          flower.available ? "" : "cursor-not-allowed opacity-45"
        }`}
        style={{ touchAction: fine ? "none" : "pan-x" }}
      >
        <span className="absolute inset-x-0 bottom-[6%] top-0">
          {standing.map((src, index) => (
            <img
              key={src}
              src={src}
              alt=""
              className="absolute bottom-0 max-w-none object-contain transition duration-300 group-hover:-translate-y-1"
              style={{
                height: compact ? "92%" : "100%",
                left: `${42 + index * 10}%`,
                transform: `translateX(-50%) rotate(${[-7, 5, 12][index]}deg) scale(${lit ? 1.04 : 1})`,
                transformOrigin: "center bottom",
                zIndex: 3 - index,
              }}
            />
          ))}
        </span>
        <span className="absolute bottom-6 left-1/2 z-10 h-[28%] w-[64%] -translate-x-1/2">
          <span className="absolute inset-0 rounded-b-[46%] rounded-t-md border border-white/80 bg-gradient-to-b from-white/25 to-[#c5dde3]/55 shadow-inner" />
          <span className="absolute inset-x-[10%] bottom-[10%] top-[30%] rounded-b-[46%] bg-[#d7ebef]/80" />
        </span>
        <span className="absolute bottom-0 left-0 right-0 text-center text-[11px] leading-tight text-black/70">
          {flower.name}
          <span className="block text-[10px] text-black/45">{flower.available ? `${rub(flower.price)} / шт.` : "Сейчас нет"}</span>
        </span>
      </button>
    );
  }

  function renderPiece(stem: Stem, interactive: boolean) {
    const flower = getFridgeFlower(stem.flowerId);
    if (!flower) return null;
    const head = view === "above";
    const size = (head ? 96 : 250) * flower.visualScale;
    const active = selected === stem.id && interactive;
    const wrap = phase === "pack" || phase === "card" || phase === "final";
    const x = wrap ? stem.x * 0.38 : stem.x;
    const y = wrap ? stem.y * 0.2 + 6 : stem.y;
    const rotation = wrap ? stem.rotation * 0.25 : stem.rotation;
    return (
      <div
        key={stem.id}
        className="absolute"
        style={{
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          width: head ? size : size * 0.48,
          height: size,
          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${stem.scale})`,
          transformOrigin: "center center",
          zIndex: stem.z,
        }}
      >
        <button
          type="button"
          aria-label={flower.name}
          disabled={!interactive}
          onPointerDown={(event) => interactive && takeStem(event, stem)}
          className={`h-full w-full ${active ? "rounded-full ring-2 ring-[#1B2621]/50" : ""}`}
          style={{ touchAction: "none" }}
        >
          {head ? (
            <span className="block h-full w-full overflow-hidden rounded-full shadow-soft">
              <img
                src={stem.image}
                alt=""
                draggable={false}
                className="h-[240%] w-full object-cover object-top"
                style={{ transform: stem.flip ? "scaleX(-1)" : undefined }}
              />
            </span>
          ) : (
            <img
              src={stem.image}
              alt=""
              draggable={false}
              className="h-full w-full object-contain"
              style={{ transform: stem.flip ? "scaleX(-1)" : undefined, filter: "drop-shadow(0 14px 10px rgba(80,60,40,0.16))" }}
            />
          )}
        </button>
        {active && (
          <button
            type="button"
            aria-label="Повернуть"
            onPointerDown={(event) => rotateStem(event, stem)}
            className="absolute left-1/2 top-0 z-10 h-4 w-4 -translate-x-1/2 -translate-y-5 rounded-full border border-white bg-cta"
          />
        )}
      </div>
    );
  }

  const visibleFlowers = fridgeFlowers.filter((flower) => filter === "all" || flower.group === filter);

  if (phase === "intro") {
    return (
      <section className="stage grid min-h-[calc(100vh-8rem)] items-center gap-10 py-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Игра флориста</p>
          <h1 className="mt-3 font-serif text-6xl leading-[0.92] md:text-7xl">Собери букет своими руками</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-black/65">
            Зайди в холодильник, возьми отдельный цветок и положи его на стол. Двигай, поворачивай и прячь за другими.
          </p>
          <button type="button" onClick={() => setPhase("play")} className="btn-primary mt-8">
            Начать
          </button>
        </div>
        <div className="relative hidden h-[520px] overflow-hidden rounded-[36px] bg-gradient-to-b from-[#f4fbfb] to-[#d5e4e8] lg:block">
          <img src="/images/flowers/rose/rose-01.png" alt="" className="absolute bottom-0 left-1/2 h-[92%] -translate-x-1/2 object-contain" />
        </div>
      </section>
    );
  }

  const showEditor = phase === "play" && !looking;

  return (
    <div className="pb-36">
      <div className={`stage grid items-start gap-6 py-6 ${looking ? "" : "lg:grid-cols-12"} lg:py-8`}>
        {showEditor && (
          <section className="order-2 lg:order-1 lg:col-span-5">
            <div className="mb-3">
              <p className="eyebrow">Холодильник SECRET</p>
              <h1 className="mt-1 font-serif text-4xl leading-none">Возьми цветок</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.map((item) => (
                  <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-full px-3 py-1 text-xs ${filter === item.id ? "bg-cta text-ivory" : "bg-white text-black/55"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setHelper((value) => !value)} className="mt-3 text-xs uppercase tracking-[0.14em] text-black/45">
                Не знаешь, с чего начать?
              </button>
            </div>
            {helper && (
              <div className="mb-3 flex flex-wrap gap-2">
                {moodHints.map((mood) => (
                  <button key={mood.id} type="button" onClick={() => setFocus(mood.flowers)} className="rounded-full bg-white px-4 py-2 text-sm">
                    {mood.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">{visibleFlowers.map((flower) => renderVase(flower, true))}</div>
            <div className="relative hidden h-[680px] overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-b from-[#f7fbfb] via-[#e4eef1] to-[#d3e2e6] shadow-soft lg:block">
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/50 to-transparent" />
              <span className="pointer-events-none absolute inset-x-4 top-[35%] h-2 rounded-full bg-white/70" />
              <span className="pointer-events-none absolute inset-x-4 top-[67%] h-2 rounded-full bg-white/60" />
              {visibleFlowers.map((flower) => renderVase(flower))}
            </div>
            <p className="mt-3 hidden min-h-10 text-sm text-black/55 lg:block">
              {hovered ? (
                <>
                  <span className="text-black">{hovered.name}</span>
                  {" · "}
                  {hovered.available ? `${rub(hovered.price)} / шт. Перетащи меня в букет.` : "Сейчас нет."}
                </>
              ) : (
                "Возьми стебель из вазы и положи на стол."
              )}
            </p>
          </section>
        )}

        <section className={looking ? "" : "order-1 lg:order-2 lg:col-span-7"}>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{phase === "play" ? (looking ? "Твой букет" : "Рабочий стол") : phase === "pack" ? "Упаковка" : phase === "card" ? "Открытка" : "Готово"}</p>
              {phase === "pack" && <h2 className="mt-1 font-serif text-4xl">Упакуй свой SECRET</h2>}
              {phase === "card" && <h2 className="mt-1 font-serif text-4xl">Добавь SECRET moment</h2>}
              {phase === "final" && <h2 className="mt-1 font-serif text-5xl">Твой SECRET готов.</h2>}
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <button type="button" onClick={() => setView("stems")} className={`rounded-full px-3 py-1 ${view === "stems" ? "bg-cta text-ivory" : "bg-white"}`}>
                Стебли
              </button>
              <button type="button" onClick={() => setView("above")} className={`rounded-full px-3 py-1 ${view === "above" ? "bg-cta text-ivory" : "bg-white"}`}>
                Сверху
              </button>
              {phase !== "play" && (
                <button type="button" onClick={() => setPhase("play")} className="text-black/45">
                  Изменить букет
                </button>
              )}
            </div>
          </div>

          <div
            ref={stageRef}
            className={`relative overflow-hidden rounded-[36px] bg-gradient-to-b from-[#fbf7f2] to-[#efe4d8] ${phase === "play" ? "h-[460px] md:h-[520px]" : "h-[420px]"} ${over ? "ring-2 ring-[#9AA58F]" : ""}`}
            onPointerDown={() => {
              if (phase === "play") setSelected(null);
            }}
          >
            <div className="pointer-events-none absolute inset-x-[18%] bottom-[8%] h-24 rounded-[50%] bg-[#e4d3c4]/70 blur-[2px]" />
            {phase !== "play" && (
              <span
                className="pointer-events-none absolute left-1/2 top-[54%] h-[42%] w-[42%] -translate-x-1/2 shadow-[0_18px_30px_rgba(40,30,20,0.12)] transition-all duration-700"
                style={{
                  background: pack.color,
                  clipPath: "polygon(16% 0%, 84% 0%, 100% 100%, 0% 100%)",
                  borderRadius: "0 0 40% 40%",
                  transform: `translateX(-50%) translateY(${wrapIn ? "0px" : "80px"})`,
                  opacity: wrapIn ? 1 : 0,
                  zIndex: 30,
                }}
              />
            )}
            {assist && (
              <span
                className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#9AA58F]"
                style={{ left: `calc(50% + ${assist.x}px)`, top: `calc(50% + ${assist.y}px)` }}
              />
            )}
            {stems.map((stem) => renderPiece(stem, phase === "play" && !looking))}
            {stems.length === 0 && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="font-serif text-4xl">Здесь ничего нет</p>
                  <p className="mt-2 text-sm text-black/45">Пустой стол. Первый цветок кладёшь ты.</p>
                </div>
              </div>
            )}
            {hint && stems.length === 0 && phase === "play" && (
              <p className="pointer-events-none absolute bottom-16 left-0 right-0 text-center text-sm text-black/50">
                {fine ? "Перетащи цветок на стол" : "Нажми на цветок — он ляжет на стол"}
              </p>
            )}
            {flash && <p className="pointer-events-none absolute right-5 top-5 z-30 rounded-full bg-cta px-4 py-2 text-sm text-ivory">{flash}</p>}
            {showEditor && selectedStem && selectedFlower && (
              <div
                onPointerDown={(event) => event.stopPropagation()}
                className="absolute bottom-3 left-1/2 z-40 flex max-w-[96%] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-full bg-white/95 px-2 py-1.5 text-xs shadow-soft"
              >
                <span className="px-2">
                  {selectedFlower.name} · {rub(selectedFlower.price)}
                </span>
                <button type="button" onClick={() => updateStem(selectedStem.id, { scale: clampScale(selectedStem.scale - 0.15) }, true)} className="rounded-full bg-[#f6f1ea] px-2 py-1">
                  −
                </button>
                <span>{Math.round(selectedStem.scale * 100)}%</span>
                <button type="button" onClick={() => updateStem(selectedStem.id, { scale: clampScale(selectedStem.scale + 0.15) }, true)} className="rounded-full bg-[#f6f1ea] px-2 py-1">
                  +
                </button>
                <button type="button" onClick={() => updateStem(selectedStem.id, { rotation: selectedStem.rotation - 15 }, true)} className="rounded-full bg-[#f6f1ea] px-2 py-1">
                  ↺
                </button>
                <button type="button" onClick={() => updateStem(selectedStem.id, { rotation: selectedStem.rotation + 15 }, true)} className="rounded-full bg-[#f6f1ea] px-2 py-1">
                  ↻
                </button>
                <button type="button" onClick={() => shiftLayer(selectedStem.id, 1)} className="rounded-full bg-[#f6f1ea] px-2 py-1">
                  Выше
                </button>
                <button type="button" onClick={() => shiftLayer(selectedStem.id, -1)} className="rounded-full bg-[#f6f1ea] px-2 py-1">
                  Ниже
                </button>
                <button type="button" onClick={() => duplicate(selectedStem.id)} className="rounded-full bg-[#f6f1ea] px-2 py-1">
                  Дубль
                </button>
                <button type="button" onClick={() => removeStem(selectedStem.id)} className="rounded-full bg-[#f6f1ea] px-2 py-1">
                  Убрать
                </button>
                <span className="px-1 text-black/45">{selectedCount} шт.</span>
              </div>
            )}
          </div>

          {showEditor && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-black/55">
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={!canUndo} onClick={undo} className="rounded-full bg-white px-3 py-1 disabled:opacity-30">
                  Отменить
                </button>
                <button type="button" disabled={!canRedo} onClick={redo} className="rounded-full bg-white px-3 py-1 disabled:opacity-30">
                  Вернуть
                </button>
                <button type="button" onClick={() => setLooking(true)} className="rounded-full bg-white px-3 py-1">
                  Посмотреть
                </button>
                <button type="button" onClick={() => setConfirmReset(true)} className="rounded-full bg-white px-3 py-1">
                  Начать заново
                </button>
              </div>
              <span>{countLabel(stems.length)}</span>
            </div>
          )}
          {looking && (
            <button type="button" onClick={() => setLooking(false)} className="btn-ghost mt-4">
              Вернуться к столу
            </button>
          )}

          {showEditor && frontFirst.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-black/35">Слои · верх списка ближе к тебе</p>
              <div className="mt-2 flex flex-col gap-1">
                {frontFirst.map((stem) => {
                  const flower = getFridgeFlower(stem.flowerId);
                  return (
                    <button
                      key={stem.id}
                      type="button"
                      onPointerDown={(event) => startLayerDrag(event, stem.id, frontFirst.map((item) => item.id), remember, orderLayers)}
                      onClick={() => setSelected(stem.id)}
                      className={`rounded-full px-3 py-1 text-left text-sm ${selected === stem.id ? "bg-cta text-ivory" : "bg-white"}`}
                    >
                      {flower?.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {phase === "pack" && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gamePacks.map((item) => (
                <button key={item.id} type="button" onClick={() => setPackId(item.id)} className={`rounded-[28px] p-4 text-left ${packId === item.id ? "ring-2 ring-[#1B2621]" : "bg-white"}`} style={{ background: item.color, color: item.ink }}>
                  <span className="block font-serif text-2xl">{item.label}</span>
                  <span className="mt-1 block text-xs opacity-70">{item.line}</span>
                  <span className="mt-3 block text-sm">{rub(item.price)} · демо</span>
                  {packId === item.id && <span className="mt-2 block text-[10px] uppercase tracking-[0.14em]">Выбрано</span>}
                </button>
              ))}
            </div>
          )}

          {phase === "card" && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {cardStyles.map((item) => (
                  <button key={item.id} type="button" onClick={() => setCardId(item.id)} className={`rounded-full px-4 py-2 text-sm ${cardId === item.id ? "bg-cta text-ivory" : "bg-white"}`}>
                    {item.label}
                    {item.price > 0 && !reward ? ` · ${rub(item.price)}` : item.id !== "none" && reward ? " · в подарок" : ""}
                  </button>
                ))}
              </div>
              {cardId !== "none" && (
                <>
                  <textarea value={note} maxLength={150} onChange={(event) => setNote(event.target.value)} placeholder="Напиши несколько слов..." className="mt-4 h-28 w-full rounded-3xl bg-white p-4 outline-none" />
                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={hideSender} onChange={(event) => setHideSender(event.target.checked)} />
                    Скрыть имя отправителя
                  </label>
                </>
              )}
            </div>
          )}

          {phase === "final" && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="text-sm leading-7">
                {lines.map((line) => (
                  <p key={line.id}>
                    {line.qty} × {line.name} · {rub((getFridgeFlower(line.id)?.price ?? 0) * line.qty)}
                  </p>
                ))}
                <p className="mt-3">Упаковка {pack.label}</p>
                <p>
                  {card.id === "none" ? "Без открытки" : card.label}
                  {card.id !== "none" && reward ? " · в подарок" : ""}
                  {note ? `: ${note}` : ""}
                </p>
                {hideSender && card.id !== "none" && <p>Имя отправителя скрыто</p>}
              </div>
              <div>
                <p className="font-serif text-5xl">{rub(flowerSum + pack.price + cardPrice)}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={order} className="btn-primary">
                    Заказать этот букет
                  </button>
                  <button type="button" onClick={() => setPhase("play")} className="btn-ghost">
                    Изменить
                  </button>
                  <button type="button" onClick={() => setSaved(code)} className="btn-line">
                    Сохранить SECRET
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {phase !== "final" && !looking && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-black/5 bg-[#f6f1ea]/95 px-4 py-3 backdrop-blur md:bottom-0">
          <div className="stage flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-black/40">Твой букет</p>
              <p className="font-serif text-3xl">{rub(shownTotal)}</p>
              <p className="text-xs text-black/45">{countLabel(stems.length)}</p>
            </div>
            <button
              type="button"
              disabled={stems.length === 0}
              onClick={() => setPhase(phase === "play" ? "pack" : phase === "pack" ? "card" : "final")}
              className="btn-primary disabled:opacity-40"
            >
              {phase === "play" ? "Упаковать" : phase === "pack" ? "Дальше" : "Готово"}
            </button>
          </div>
        </div>
      )}

      {drag?.type === "new" && (
        <img
          src={drag.image}
          alt=""
          className="pointer-events-none fixed z-50 h-72 w-auto max-w-none"
          style={{ left: drag.x, top: drag.y, transform: "translate(-50%, -92%) rotate(-8deg) scale(1.08)", filter: "drop-shadow(0 18px 16px rgba(40,30,20,0.28))" }}
        />
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-4">
          <div className="w-full max-w-sm rounded-[28px] bg-[#fbf8f3] p-6 text-center">
            <p className="font-serif text-3xl">Точно начать новый букет?</p>
            <div className="mt-5 flex justify-center gap-3">
              <button type="button" onClick={() => setConfirmReset(false)} className="btn-ghost">
                Отменить
              </button>
              <button type="button" onClick={resetDesk} className="btn-primary">
                Начать заново
              </button>
            </div>
          </div>
        </div>
      )}

      {saved !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-4" onClick={() => setSaved(null)}>
          <div className="w-full max-w-md rounded-[32px] bg-[#fbf8f3] p-8 text-center" onClick={(event) => event.stopPropagation()}>
            <p className="eyebrow">Карточка</p>
            <h2 className="mt-3 font-serif text-5xl">SECRET #{saved}</h2>
            <p className="mt-4 font-serif text-2xl">Я собрал этот букет специально для тебя.</p>
            <p className="mt-2 text-sm text-black/50">{rub(flowerSum + pack.price + cardPrice)} · демо</p>
            <button
              type="button"
              className="btn-primary mt-6"
              onClick={() => {
                const text = `SECRET #${saved}\nЯ собрал этот букет специально для тебя.`;
                if (navigator.share) void navigator.share({ text }).catch(() => undefined);
                else void navigator.clipboard.writeText(text);
              }}
            >
              Поделиться
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function startLayerDrag(event: React.PointerEvent, id: string, order: string[], remember: () => void, apply: (ids: string[]) => void) {
  event.preventDefault();
  const startY = event.clientY;
  const from = order.indexOf(id);
  let saved = false;
  const move = (ev: PointerEvent) => {
    const shift = Math.round((ev.clientY - startY) / 34);
    const to = clamp(from + shift, 0, order.length - 1);
    if (to === from) return;
    if (!saved) {
      saved = true;
      remember();
    }
    const next = order.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    apply(next);
  };
  const up = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampScale(value: number) {
  return clamp(Math.round(value * 100) / 100, MIN_SCALE, MAX_SCALE);
}

function countLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${count} цветов`;
  if (mod10 === 1) return `${count} цветок`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} цветка`;
  return `${count} цветов`;
}
