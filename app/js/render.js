/* Vice Cover Studio — poster renderer.
   One function paints the whole poster at any pixel size: panels first,
   then captions, then the grade, then print texture (halftone, grain,
   vignette). Export and preview share this exact path, so what you see
   is what the PNG holds. */

(function (global) {
  "use strict";

  var VCS = global.VCS;
  var noiseTile = null;

  function makeNoiseTile() {
    if (noiseTile) return noiseTile;
    var t = document.createElement("canvas");
    t.width = 160;
    t.height = 160;
    var c = t.getContext("2d");
    var img = c.createImageData(160, 160);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = 96 + Math.floor(Math.random() * 64);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    noiseTile = t;
    return t;
  }

  /* Cover-fit draw of one photo into one panel rect, with the panel's
     zoom, pan and flip applied. */
  function drawPhoto(ctx, img, rect, panel) {
    var px = rect[0], py = rect[1], pw = rect[2], ph = rect[3];
    var iw = img.width, ih = img.height;
    var base = Math.max(pw / iw, ph / ih);
    var s = base * panel.zoom;
    var dw = iw * s, dh = ih * s;
    var dx = px + (pw - dw) / 2 + panel.ox * pw;
    var dy = py + (ph - dh) / 2 + panel.oy * ph;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    if (panel.flip) {
      ctx.translate(px + pw / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(px + pw / 2), 0);
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  function fitFont(ctx, text, weight, family, startPx, maxW) {
    var px = startPx;
    ctx.font = weight + " " + px + "px " + family;
    while (px > 12 && ctx.measureText(text).width > maxW) {
      px -= 2;
      ctx.font = weight + " " + px + "px " + family;
    }
    return px;
  }

  function drawCaptions(ctx, W, H, state, grade) {
    var maxW = W * 0.92;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    /* Place line, top centre, wide-tracked. */
    var place = (state.place || "").toUpperCase();
    if (place) {
      try { ctx.letterSpacing = Math.round(W * 0.038 * 0.2) + "px"; } catch (e) {}
      var pPx = fitFont(ctx, place.split("").join(" "), "600", "Oswald, sans-serif",
        Math.round(W * 0.038), maxW * 0.94);
      ctx.font = "600 " + pPx + "px Oswald, sans-serif";
      try { ctx.letterSpacing = Math.round(pPx * 0.2) + "px"; } catch (e) {}
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = Math.round(W * 0.006);
      ctx.shadowOffsetY = Math.round(W * 0.002);
      ctx.fillText(place.split("").join(" "), W / 2, H * 0.062);
      try { ctx.letterSpacing = "0px"; } catch (e) {}
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    /* Title, low on the poster, with gradient fill + outline + shadow. */
    var title = (state.title || "").toUpperCase();
    if (title) {
      var tPx = fitFont(ctx, title, "700", "Oswald, sans-serif",
        Math.round(W * 0.115), maxW);
      var ty = H * 0.885;
      ctx.font = "700 " + tPx + "px Oswald, sans-serif";
      try { ctx.letterSpacing = Math.round(tPx * 0.015) + "px"; } catch (e) {}
      if (state.dropShadow) {
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = Math.round(W * 0.012);
        ctx.shadowOffsetY = Math.round(W * 0.008);
      }
      if (state.gradientTitle) {
        var tg = ctx.createLinearGradient(0, ty - tPx, 0, ty + tPx * 0.12);
        tg.addColorStop(0, "#ffffff");
        tg.addColorStop(0.55, grade.captionTint);
        tg.addColorStop(1, "#ff7a18");
        ctx.fillStyle = tg;
      } else {
        ctx.fillStyle = "#ffffff";
      }
      ctx.fillText(title, W / 2, ty);
      if (state.outline) {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.lineWidth = Math.max(2, Math.round(W * 0.0035));
        ctx.strokeStyle = "rgba(20, 6, 32, 0.9)";
        ctx.strokeText(title, W / 2, ty);
      }
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      try { ctx.letterSpacing = "0px"; } catch (e) {}
    }

    /* Tagline under the title, small and tracked. */
    if (state.subtitle) {
      try { ctx.letterSpacing = Math.round(W * 0.032 * 0.22) + "px"; } catch (e) {}
      var sPx = fitFont(ctx, state.subtitle, "500", "Oswald, sans-serif",
        Math.round(W * 0.032), maxW * 0.94);
      ctx.font = "500 " + sPx + "px Oswald, sans-serif";
      try { ctx.letterSpacing = Math.round(sPx * 0.22) + "px"; } catch (e) {}
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = Math.round(W * 0.005);
      ctx.shadowOffsetY = Math.round(W * 0.002);
      ctx.fillText(state.subtitle, W / 2, H * 0.935);
      try { ctx.letterSpacing = "0px"; } catch (e) {}
    }
    ctx.restore();
  }

  /* Halftone: dots whose size follows the poster's own darkness. */
  function drawHalftone(ctx, W, H, strength, base) {
    if (strength <= 0.01) return;
    var cols = 110;
    var rows = Math.round(cols * H / W);
    var probe = document.createElement("canvas");
    probe.width = cols;
    probe.height = rows;
    var pc = probe.getContext("2d");
    pc.drawImage(base, 0, 0, cols, rows);
    var data = pc.getImageData(0, 0, cols, rows).data;
    var cellW = W / cols, cellH = H / rows;
    ctx.save();
    ctx.fillStyle = "rgba(12, 4, 24, 0.85)";
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var i = (y * cols + x) * 4;
        var lum = (data[i] * 0.3 + data[i + 1] * 0.5 + data[i + 2] * 0.2) / 255;
        var dark = 1 - lum;
        if (dark < 0.35) continue;
        var r = (dark - 0.3) * cellW * 0.62 * strength;
        if (r < 0.4) continue;
        ctx.globalAlpha = Math.min(0.9, dark * strength);
        ctx.beginPath();
        ctx.arc((x + 0.5) * cellW, (y + 0.5) * cellH, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawGrain(ctx, W, H, strength) {
    if (strength <= 0.01) return;
    var tile = makeNoiseTile();
    var pat = ctx.createPattern(tile, "repeat");
    ctx.save();
    ctx.globalAlpha = strength * 0.22;
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawVignette(ctx, W, H) {
    var g = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.42,
      W / 2, H / 2, Math.max(W, H) * 0.78
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.save();
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* Full pipeline. `opts.highlight` is a panel index to outline (preview
     only; exports pass -1). */
  function drawPoster(ctx, W, H, state, scenes, opts) {
    opts = opts || {};
    var layout = VCS.state.LAYOUTS[state.layout];
    var panels = VCS.state.panelsForLayout(state);

    /* Off-white gutters show through between panels. */
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f4efe8";
    ctx.fillRect(0, 0, W, H);

    panels.forEach(function (panel, i) {
      var r = layout.panels[i];
      var rect = [r[0] * W, r[1] * H, r[2] * W, r[3] * H];
      var img = panel.photo || scenes[panel.scene % scenes.length];
      drawPhoto(ctx, img, rect, panel);
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = Math.max(1, W * 0.0012);
      ctx.strokeRect(rect[0], rect[1], rect[2], rect[3]);
      if (opts.highlight === i) {
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = Math.max(3, W * 0.006);
        ctx.strokeRect(rect[0], rect[1], rect[2], rect[3]);
      }
    });
    ctx.restore();

    /* Snapshot the ungraded poster; captions + grade work from it. */
    var base = document.createElement("canvas");
    base.width = W;
    base.height = H;
    var bc = base.getContext("2d");
    bc.drawImage(ctx.canvas, 0, 0);

    drawCaptions(bc, W, H, state, VCS.grades.GRADES[state.grade] || VCS.grades.GRADES.sunset);
    VCS.grades.apply(ctx, W, H, state.grade, base);

    drawHalftone(ctx, W, H, state.halftone, base);
    drawGrain(ctx, W, H, state.grain);
    if (state.vignette) drawVignette(ctx, W, H);
  }

  global.VCS.render = { drawPoster: drawPoster };
})(window);
