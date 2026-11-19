/* Vice Cover Studio — bootstrap.
   Loads the display fonts, paints the sample scenes, wires the rail and
   paints the first preview. URL parameters drive screenshot variants:
   ?cover=1920x1080 renders the poster alone, full-window, for captures;
   ?layout= / ?grade= / ?size= / ?title= / ?subtitle= / ?place= preset it. */

(function (global) {
  "use strict";

  var VCS = global.VCS;

  function $(id) { return document.getElementById(id); }

  function readParams(state) {
    var q = new URLSearchParams(global.location.search);
    var cover = q.get("cover");
    if (cover && VCS.state.SIZES[cover]) state.size = cover;
    if (q.get("size") && VCS.state.SIZES[q.get("size")]) {
      state.size = q.get("size");
    }
    if (q.get("layout") && VCS.state.LAYOUTS[q.get("layout")]) {
      state.layout = q.get("layout");
    }
    if (q.get("grade") && VCS.grades.GRADES[q.get("grade")]) {
      state.grade = q.get("grade");
    }
    var scene = parseInt(q.get("scene"), 10);
    if (!isNaN(scene) && scene >= 0 && scene < VCS.samples.count) {
      state.panels[0].scene = scene;
    }
    if (q.get("title")) state.title = q.get("title").slice(0, 28);
    if (q.get("subtitle")) state.subtitle = q.get("subtitle").slice(0, 60);
    if (q.get("place")) state.place = q.get("place").slice(0, 24);
    return { cover: cover };
  }

  function paintPreview(state, scenes) {
    var size = VCS.state.SIZES[state.size];
    var stage = $("stage");
    if (stage.width !== size.w || stage.height !== size.h) {
      stage.width = size.w;
      stage.height = size.h;
    }
    var ctx = stage.getContext("2d");
    VCS.render.drawPoster(ctx, size.w, size.h, state, scenes,
      { highlight: state.selected });
    $("stageSize").textContent = size.label;
    $("stageLabel").textContent = "Poster preview — " +
      VCS.state.LAYOUTS[state.layout].label + " · " +
      VCS.grades.GRADES[state.grade].name;
  }

  function paintCover(state, scenes, coverKey) {
    var size = VCS.state.SIZES[coverKey] || VCS.state.SIZES["1920x1080"];
    document.body.classList.add("cover-mode");
    var stage = $("stage");
    stage.width = size.w;
    stage.height = size.h;
    var ctx = stage.getContext("2d");
    VCS.render.drawPoster(ctx, size.w, size.h, state, scenes, { highlight: -1 });
    document.title = "Vice Cover — " + size.w + "x" + size.h;
  }

  function waitForFonts() {
    var wants = [
      document.fonts.load("700 100px Oswald"),
      document.fonts.load("600 60px Oswald"),
      document.fonts.load("400 100px 'Archivo Black'")
    ];
    return Promise.all(wants).catch(function () { return null; });
  }

  function boot() {
    var state = VCS.state.defaultState();
    var params = readParams(state);
    var scenes = VCS.samples.buildAll();

    /* Mirror URL-driven state into the visible controls. */
    $("titleInput").value = state.title;
    $("subtitleInput").value = state.subtitle;
    $("placeInput").value = state.place;
    $("sizeSelect").value = state.size;
    $("halftoneRange").value = String(Math.round(state.halftone * 100));
    $("grainRange").value = String(Math.round(state.grain * 100));
    VCS.ui.syncPickers(state);

    function renderPreview() { paintPreview(state, scenes); }

    function onExport() {
      VCS.exporter.exportPNG(state, scenes, state.size)
        .then(function (name) {
          $("exportBtn").textContent = "Saved " + name;
          setTimeout(function () { $("exportBtn").textContent = "Export PNG"; }, 2500);
        })
        .catch(function (err) {
          $("exportBtn").textContent = "Export failed — retry";
          setTimeout(function () { $("exportBtn").textContent = "Export PNG"; }, 2500);
          if (global.console) console.error(err);
        });
    }

    waitForFonts().then(function () {
      if (params.cover) {
        paintCover(state, scenes, params.cover);
        return;
      }
      VCS.ui.buildPanelList(state, scenes, renderPreview);
      VCS.ui.initUI(state, scenes, renderPreview, onExport);
      renderPreview();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
