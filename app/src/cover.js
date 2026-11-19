/* Vice Cover Studio — cover drawing engine.
   One canvas holds the whole poster: panel photos, colour grades,
   halftone dots, film grain, vignette and the display lettering.
   Everything is drawn locally; no network, no uploads. */

export const SIZES = {
  square: { w: 1080, h: 1080, label: "1080 × 1080" },
  portrait: { w: 1080, h: 1350, label: "1080 × 1350" },
  wide: { w: 1920, h: 1080, label: "1920 × 1080" },
};

export const LAYOUTS = {
  hero: {
    label: "Hero + two",
    panels: [
      { x: 0, y: 0, w: 0.62, h: 1 },
      { x: 0.62, y: 0, w: 0.38, h: 0.5 },
      { x: 0.62, y: 0.5, w: 0.38, h: 0.5 },
    ],
  },
  trio: {
    label: "Three split",
    panels: [
      { x: 0, y: 0, w: 0.34, h: 1 },
      { x: 0.34, y: 0, w: 0.33, h: 1 },
      { x: 0.67, y: 0, w: 0.33, h: 1 },
    ],
  },
  single: {
    label: "Full bleed",
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
};

export const GRADES = {
  sunset: {
    label: "Vice Sunset",
    top: "rgba(255,94,120,0.34)",
    bottom: "rgba(255,140,40,0.30)",
    wash: "rgba(20,180,190,0.14)",
    duotone: false,
  },
  neon: {
    label: "Neon Nights",
    top: "rgba(255,0,180,0.38)",
    bottom: "rgba(0,220,255,0.30)",
    wash: "rgba(120,0,255,0.16)",
    duotone: false,
  },
  noir: {
    label: "Palm Noir",
    top: "rgba(10,10,26,0.30)",
    bottom: "rgba(255,220,120,0.10)",
    wash: "rgba(0,0,0,0.10)",
    duotone: true,
  },
  pastel: {
    label: "Pastel Vice",
    top: "rgba(255,170,200,0.26)",
    bottom: "rgba(255,210,130,0.24)",
    wash: "rgba(140,220,220,0.16)",
    duotone: false,
  },
};

export function freshState() {
  return {
    layout: "hero",
    size: "wide",
    grade: "sunset",
    title: "VICE HEAT",
    subtitle: "Two outlaws. One last score.",
    place: "LEONIDA",
    photos: [],
    panels: [
      { photo: 0, zoom: 1, ox: 0, oy: 0, flip: false },
      { photo: 0, zoom: 1, ox: 0, oy: 0, flip: false },
      { photo: 0, zoom: 1, ox: 0, oy: 0, flip: false },
    ],
  };
}

export function panelRects(layout, w, h) {
  const def = LAYOUTS[layout] || LAYOUTS.hero;
  return def.panels.map((p) => ({
    x: Math.round(p.x * w),
    y: Math.round(p.y * h),
    w: Math.round(p.w * w),
    h: Math.round(p.h * h),
  }));
}

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function drawPhotoIn(ctx, img, rect, slot) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const base = Math.max(rect.w / iw, rect.h / ih);
  const scale = base * (slot.zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = rect.x + rect.w / 2 + (slot.ox || 0) * rect.w;
  const cy = rect.y + rect.h / 2 + (slot.oy || 0) * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(cx, cy);
  if (slot.flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

function paintGrade(ctx, w, h, grade) {
  const g = GRADES[grade] || GRADES.sunset;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, g.top);
  grad.addColorStop(0.55, "rgba(0,0,0,0)");
  grad.addColorStop(1, g.bottom);
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = g.wash;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  if (g.duotone) {
    ctx.save();
    ctx.globalCompositeOperation = "saturation";
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    const dg = ctx.createLinearGradient(0, 0, 0, h);
    dg.addColorStop(0, "rgba(255,240,200,0.22)");
    dg.addColorStop(1, "rgba(20,20,60,0.30)");
    ctx.fillStyle = dg;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

function paintHalftone(ctx, w, h) {
  const rnd = seeded(7);
  const step = Math.max(10, Math.round(w / 160));
  ctx.save();
  for (let y = 0; y < h; y += step) {
    const depth = y / h;
    for (let x = 0; x < w; x += step) {
      const r = (depth * depth * step * 0.42 + rnd() * 0.6) * 0.9;
      if (r < 0.4) continue;
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.beginPath();
      ctx.arc(x + step / 2, y + step / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function paintGrain(ctx, w, h) {
  const rnd = seeded(13);
  const n = Math.round((w * h) / 900);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const v = rnd();
    ctx.fillStyle = v > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
    ctx.fillRect(rnd() * w, rnd() * h, 1.6, 1.6);
  }
  ctx.restore();
}

function paintVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.78
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function fitTitle(ctx, text, maxW, startPx, family) {
  let px = startPx;
  ctx.font = "700 " + px + "px " + family;
  while (px > 24 && ctx.measureText(text).width > maxW) {
    px = Math.floor(px * 0.94);
    ctx.font = "700 " + px + "px " + family;
  }
  return px;
}

function paintLettering(ctx, w, h, state) {
  const title = (state.title || "").trim().toUpperCase();
  const sub = (state.subtitle || "").trim();
  const place = (state.place || "").trim().toUpperCase();
  const bandH = Math.round(h * 0.3);
  const bandY = h - bandH;
  const g = ctx.createLinearGradient(0, bandY - 40, 0, h);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.35, "rgba(0,0,0,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0.82)");
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, bandY - 40, w, bandH + 40);
  ctx.restore();

  const pad = Math.round(w * 0.045);
  const maxW = w - pad * 2;
  const titleFamily = '"Oswald", "Archivo Black", "Arial Narrow", sans-serif';
  const px = fitTitle(ctx, title || "VICE", maxW, Math.round(h * 0.16), titleFamily);
  const baseY = h - Math.round(h * 0.055);
  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = "700 " + px + "px " + titleFamily;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = Math.round(px * 0.12);
  ctx.shadowOffsetY = Math.round(px * 0.05);
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(10,5,20,0.9)";
  ctx.lineWidth = Math.max(3, Math.round(px * 0.07));
  ctx.strokeText(title, pad, baseY);
  const tg = ctx.createLinearGradient(0, baseY - px, 0, baseY);
  tg.addColorStop(0, "#fff7e8");
  tg.addColorStop(0.55, "#ffd9a0");
  tg.addColorStop(1, "#ff5e7a");
  ctx.fillStyle = tg;
  ctx.fillText(title, pad, baseY);
  ctx.restore();

  if (sub) {
    const subPx = Math.max(16, Math.round(h * 0.028));
    ctx.save();
    ctx.font = "400 " + subPx + "px 'Archivo Black', 'Arial Black', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 6;
    ctx.fillText(sub, pad, baseY - px - Math.round(h * 0.02));
    ctx.restore();
  }
  if (place) {
    const plPx = Math.max(14, Math.round(h * 0.024));
    ctx.save();
    ctx.font = "600 " + plPx + "px Oswald, 'Arial Narrow', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    const tw = ctx.measureText(place).width;
    ctx.fillText(place, pad, Math.round(h * 0.055));
    ctx.fillStyle = "#ff5e7a";
    ctx.fillRect(pad, Math.round(h * 0.075), tw, Math.max(3, Math.round(h * 0.004)));
    ctx.restore();
  }
}

export function drawCover(canvas, state, w, h) {
  const size = SIZES[state.size] || SIZES.wide;
  const W = w || size.w;
  const H = h || size.h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#12081c";
  ctx.fillRect(0, 0, W, H);
  const rects = panelRects(state.layout, W, H);
  const gap = Math.max(2, Math.round(W * 0.004));
  rects.forEach((r, i) => {
    const slot = state.panels[i] || { photo: 0, zoom: 1, ox: 0, oy: 0, flip: false };
    const photo = state.photos[slot.photo];
    const inner = { x: r.x + gap / 2, y: r.y + gap / 2, w: r.w - gap, h: r.h - gap };
    if (photo && photo.img) {
      drawPhotoIn(ctx, photo.img, inner, slot);
    } else {
      const pg = ctx.createLinearGradient(inner.x, inner.y, inner.x + inner.w, inner.y + inner.h);
      pg.addColorStop(0, "#3a1c4d");
      pg.addColorStop(1, "#12081c");
      ctx.fillStyle = pg;
      ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "600 " + Math.round(H * 0.02) + "px Oswald, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ADD A PHOTO", inner.x + inner.w / 2, inner.y + inner.h / 2);
      ctx.textAlign = "left";
    }
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = gap;
    ctx.strokeRect(r.x + gap / 2, r.y + gap / 2, r.w - gap, r.h - gap);
  });
  paintGrade(ctx, W, H, state.grade);
  paintHalftone(ctx, W, H);
  paintGrain(ctx, W, H);
  paintLettering(ctx, W, H, state);
  paintVignette(ctx, W, H);
  return { w: W, h: H };
}
