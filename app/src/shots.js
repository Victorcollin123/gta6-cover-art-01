/* Fixed scenes for screenshots. ?shot=editor shows the editor with a
   sample photo loaded; ?shot=cover shows the cover alone, full-bleed.
   `photo` picks the sample (samples/<photo>.jpg), `caption` the title,
   `grade`, `layout` and `size` pick the look. window.__shotReady is
   set once the scene has painted. */
export async function runShot(shot, query, apply) {
  const photo = query.get("photo") || "pier";
  const caption = query.get("caption") || "Sunset Heist";
  const opts = {
    layout: query.get("layout") || undefined,
    grade: query.get("grade") || undefined,
    size: query.get("size") || undefined,
    subtitle: query.get("subtitle") || undefined,
  };
  if (shot === "cover") document.body.classList.add("shot-cover");
  await apply("samples/" + photo + ".jpg", caption, opts);
  await document.fonts.ready;
  await apply("samples/" + photo + ".jpg", caption, opts);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
