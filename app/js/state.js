/* Vice Cover Studio — state, layouts and export sizes.
   All geometry lives in 0..1 space so a poster renders at any pixel size. */

(function (global) {
  "use strict";

  var SIZES = {
    "1080x1350": { w: 1080, h: 1350, label: "1080 × 1350 portrait" },
    "1080x1080": { w: 1080, h: 1080, label: "1080 × 1080 square" },
    "1920x1080": { w: 1920, h: 1080, label: "1920 × 1080 landscape" }
  };

  /* Panel rects are [x, y, w, h] in fractions of the poster.
     GUTTER is the white gap between panels, also in fractions. */
  var GUTTER = 0.012;

  var LAYOUTS = {
    hero: {
      label: "Hero + duo",
      panels: [
        [0, 0, 0.64 - GUTTER / 2, 1],
        [0.64 + GUTTER / 2, 0, 0.36 - GUTTER / 2, 0.5 - GUTTER / 2],
        [0.64 + GUTTER / 2, 0.5 + GUTTER / 2, 0.36 - GUTTER / 2, 0.5 - GUTTER / 2]
      ]
    },
    trio: {
      label: "Three panels",
      panels: [
        [0, 0, 1 / 3 - GUTTER * 2 / 3, 1],
        [1 / 3 + GUTTER / 3, 0, 1 / 3 - GUTTER * 2 / 3, 1],
        [2 / 3 + GUTTER * 2 / 3, 0, 1 / 3 - GUTTER * 2 / 3, 1]
      ]
    },
    solo: {
      label: "Full bleed",
      panels: [[0, 0, 1, 1]]
    }
  };

  /* One panel's photo placement. zoom 1 = cover fit; ox/oy pan in
     fractions of the panel; flip mirrors the photo. */
  function freshPanel(sceneIndex) {
    return {
      scene: sceneIndex,
      photo: null, // an HTMLImageElement / canvas once the user uploads
      zoom: 1,
      ox: 0,
      oy: 0,
      flip: false
    };
  }

  function defaultState() {
    return {
      layout: "hero",
      grade: "sunset",
      size: "1080x1350",
      title: "SUNSET HEIST",
      subtitle: "Two thieves. One last score.",
      place: "LEONIDA",
      outline: true,
      gradientTitle: true,
      dropShadow: true,
      halftone: 0.55,
      grain: 0.5,
      vignette: true,
      selected: 0,
      panels: [freshPanel(0), freshPanel(1), freshPanel(2)]
    };
  }

  /* Keep the panel array in step with the layout: extra panels are
     parked (not lost) so switching layouts never drops a photo. */
  function panelsForLayout(state) {
    var want = LAYOUTS[state.layout].panels.length;
    while (state.panels.length < want) {
      state.panels.push(freshPanel(state.panels.length % 3));
    }
    if (state.selected >= want) state.selected = 0;
    return state.panels.slice(0, want);
  }

  function clonePanel(p) {
    return {
      scene: p.scene,
      photo: p.photo,
      zoom: p.zoom,
      ox: p.ox,
      oy: p.oy,
      flip: p.flip
    };
  }

  global.VCS = global.VCS || {};
  global.VCS.state = {
    SIZES: SIZES,
    LAYOUTS: LAYOUTS,
    GUTTER: GUTTER,
    defaultState: defaultState,
    freshPanel: freshPanel,
    panelsForLayout: panelsForLayout,
    clonePanel: clonePanel
  };
})(window);
