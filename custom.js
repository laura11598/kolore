// KOLORE · custom.js
// ------------------------------------------------------------
// CONTENIDO:
// 1) HERO · ScrambleText Showcase
// 2) HEADER · Hide / Show on scroll
// 3) CHECKER · Tiles + hover chicle + parallax
// 4) BALL SECTION · Bola rebotando + efecto lente sobre texto
// ------------------------------------------------------------

window.addEventListener("DOMContentLoaded", () => {
  const hasGSAP = typeof window.gsap !== "undefined";
  const hasScramble = typeof window.ScrambleTextPlugin !== "undefined";

  // ============================================================
  // 1) HERO · SCRAMBLE TEXT
  // ============================================================
  (function heroScramble() {
    const heroTitle = document.querySelector(".k-hero-quote");
    if (!heroTitle || !hasGSAP || !hasScramble) return;

    gsap.registerPlugin(ScrambleTextPlugin);

    const isMobile = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

    const finalText = isMobile
      ? "La\nvida\nde\ncolor\nrosa"     // MÁS líneas en móvil
      : "La vida\nde color\nrosa";     // 3 líneas en desktop
    heroTitle.style.whiteSpace = "pre";

    gsap.set(heroTitle, { opacity: 1 });

    gsap.fromTo(
      heroTitle,
      { scrambleText: { text: "", chars: "upperAndLowerCase" } },
      {
        duration: 1.4,
        scrambleText: {
          text: finalText,
          chars: "XO*#%@!&?/\\|<>-_+=~",
          speed: 0.5,
          revealDelay: 0.2,
          tweenLength: false,
        },
      }
    );

    heroTitle.addEventListener("mouseenter", () => {
      gsap.to(heroTitle, {
        duration: 0.9,
        scrambleText: {
          text: finalText,
          chars: "XO*#%@!&?/\\|<>-_+=~",
          speed: 0.4,
          tweenLength: false,
        },
      });
    });
  })();

  // ============================================================
  // 2) HEADER · HIDE / SHOW ON SCROLL
  // ============================================================
  (function headerScroll() {
    const header = document.querySelector(".k-header");
    if (!header || !hasGSAP) return;

    let lastScroll = window.scrollY;
    let hidden = false;

    gsap.set(header, { y: 0 });

    window.addEventListener(
      "scroll",
      () => {
        const current = window.scrollY;

        if (current > lastScroll && current > 100 && !hidden) {
          hidden = true;
          gsap.to(header, { y: -header.offsetHeight, duration: 0.35 });
        }

        if (current < lastScroll && hidden) {
          hidden = false;
          gsap.to(header, { y: 0, duration: 0.35 });
        }

        lastScroll = current;
      },
      { passive: true }
    );
  })();

  // ============================================================
  // 3) CHECKER · TILES + HOVER + PARALLAX
  // ============================================================
  (function checkerSection() {
    const section = document.querySelector("#checker");
    const grid = document.querySelector(".checker-tiles");
    if (!section || !grid || !hasGSAP) return;

    const TILE = 82;
    let tiles = [];

    function buildTiles() {
      const cols = Math.ceil(section.clientWidth / TILE) + 2;
      const rows = Math.ceil(section.clientHeight / TILE) + 2;

      grid.style.gridTemplateColumns = `repeat(${cols}, ${TILE}px)`;
      grid.innerHTML = "";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = document.createElement("div");
          t.className = "tile" + ((r + c) % 2 === 0 ? " blue" : "");
          grid.appendChild(t);
        }
      }
      tiles = grid.querySelectorAll(".tile");
    }

    function addHover() {
      gsap.set(tiles, { transformOrigin: "50% 50%" });

      tiles.forEach((t) => {
        t.addEventListener("mouseenter", () => {
          gsap.fromTo(t, { scale: 1 }, { scale: 1.2, duration: 0.35, ease: "back.out(3)" });
        });
        t.addEventListener("mouseleave", () => {
          gsap.to(t, { scale: 1, duration: 0.3 });
        });
      });
    }

    buildTiles();
    addHover();

    window.addEventListener("resize", () => {
      buildTiles();
      addHover();
    }, { passive: true });

    section.addEventListener("mousemove", (e) => {
      const r = section.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;

      gsap.to(grid, { x: x * 30, y: y * 30, duration: 0.4 });
    }, { passive: true });

    section.addEventListener("mouseleave", () => {
      gsap.to(grid, { x: 0, y: 0, duration: 0.5 });
    });
  })();

  // ============================================================
  // 4) BALL SECTION · BOUNCING BALL + LENS TEXT
  // ============================================================
  (function ballSection() {
    const section = document.querySelector("#ballSection");
    const ball = document.querySelector("#ball");
    const lens = document.querySelector(".ballText--lens");
    if (!section || !ball || !lens) return;

    let vx = 4.2, vy = 3.6;
    let x = 40, y = 140;

    function update() {
      const bw = ball.offsetWidth;
      const bh = ball.offsetHeight;
      const maxX = section.clientWidth - bw;
      const maxY = section.clientHeight - bh;

      x += vx; y += vy;
      if (x <= 0) { x = 0; vx *= -1; }
      if (x >= maxX) { x = maxX; vx *= -1; }
      if (y <= 0) { y = 0; vy *= -1; }
      if (y >= maxY) { y = maxY; vy *= -1; }

      ball.style.transform = `translate(${x}px, ${y}px)`;

      const sectionRect = section.getBoundingClientRect();
      const lensRect = lens.getBoundingClientRect();

      const cx = sectionRect.left + x + bw / 2 - lensRect.left;
      const cy = sectionRect.top + y + bh / 2 - lensRect.top;

      lens.style.clipPath = `circle(${bw / 2}px at ${cx}px ${cy}px)`;

      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  })();

  // ============================================================
  // 5) SCROLL SNAP · marcar sección activa (encaje)
  // ============================================================
  (function snapActiveSection(){
    const sections = Array.from(document.querySelectorAll(
      ".k-hero, .k-section, .checker-section, .k-ball-section"
    ));
    if (!sections.length) return;

    // Ensure only one is active at a time
   const setActive = (el) => {
  sections.forEach(s => s.classList.remove("k-snap-active"));
  if (el) el.classList.add("k-snap-active");

  // If we're entering the checker section, restart marquee so it begins immediately
  if (el && el.classList.contains("checker-section")) {
    el.querySelectorAll(".marquee-track").forEach(track => {
      // restart CSS animation
      track.style.animation = "none";
      // force reflow
      void track.offsetHeight;
      track.style.animation = "";
      // ensure it runs
      track.style.animationPlayState = "running";
    });
  }
};

    // Start with the first section
    setActive(sections[0]);

    const io = new IntersectionObserver(
      (entries) => {
        // pick the most visible entry
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible && visible.target) setActive(visible.target);
      },
      {
        // Make the “active” zone feel like a snap slot
        root: null,
        threshold: [0.35, 0.5, 0.65, 0.8],
      }
    );

    sections.forEach(s => io.observe(s));
  })();
});
// =========================
// HERO button: scroll suave a la siguiente sección
// =========================
(function heroExploreScroll() {
  const btn = document.querySelector(".k-hero-button");
  const target = document.querySelector("#video1"); // <- destino

  if (!btn || !target) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();

// sección video animación filtro color 
// =========================
// VIDEO · “color transformer” circular (mask + blend)
// =========================
(function videoColorTransformer(){
  const section = document.querySelector(".k-section-video");
  const tint = document.querySelector(".k-section-video .video-tint");
  if (!section || !tint) return;

  let raf = null;
  let lastX = 0;
  let lastY = 0;

  const setVars = () => {
    tint.style.setProperty("--x", `${lastX}px`);
    tint.style.setProperty("--y", `${lastY}px`);
    raf = null;
  };

  section.addEventListener("mousemove", (e) => {
    const rect = section.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;

    if (!raf) raf = requestAnimationFrame(setVars);
  }, { passive: true });

  section.addEventListener("mouseenter", () => {
    // radio (ajusta a tu gusto)
    tint.style.setProperty("--r", "160px");
  }, { passive: true });

  section.addEventListener("mouseleave", () => {
    // “apaga” el círculo al salir
    tint.style.setProperty("--r", "0px");
  }, { passive: true });
})();

// sección 2 colores 
// ============================================================
// SECTION 2 (COLORES) · hover scale + click curtain + invert panel
// ============================================================
(function colorGridCurtain() {
  if (typeof window.gsap === "undefined") {
    console.warn("[KOLORE] GSAP no está cargado: Section 2 curtain no funcionará.");
    return;
  }

  const grid = document.querySelector("#colorGrid");
  if (!grid) return;

  const cells = Array.from(grid.querySelectorAll(".color-cell"));

  const setAria = (cell, isOpen) => {
    const btn = cell.querySelector(".color-cell__btn");
    const panel = cell.querySelector(".color-cell__panel");
    if (btn) btn.setAttribute("aria-expanded", String(isOpen));
    if (panel) panel.setAttribute("aria-hidden", String(!isOpen));
  };

  const ensureCurtain = (cell) => {
    let curtain = cell.querySelector(".color-cell__curtain");
    if (!curtain) {
      curtain = document.createElement("div");
      curtain.className = "color-cell__curtain";
      cell.appendChild(curtain);
    }
    return curtain;
  };

  const closeCell = (cell, instant = false) => {
    if (!cell.classList.contains("is-open")) return;

    const curtain = cell.querySelector(".color-cell__curtain");
    const finish = () => {
      cell.classList.remove("is-open");
      setAria(cell, false);
      cell.dataset.animating = "0";
    };

    if (instant || !curtain) {
      finish();
      return;
    }

    if (cell.dataset.animating === "1") return;
    cell.dataset.animating = "1";

    gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete: finish })
      .set(curtain, { scaleY: 0, transformOrigin: "top" })
      .to(curtain, { scaleY: 1, duration: 0.22 })
      .add(() => {
        cell.classList.remove("is-open");
        setAria(cell, false);
      })
      .set(curtain, { transformOrigin: "bottom" })
      .to(curtain, { scaleY: 0, duration: 0.22 });
  };

  const openCell = (cell) => {
    if (cell.dataset.animating === "1") return;
    cell.dataset.animating = "1";

    // cerramos otras (instantáneo)
    cells.forEach((c) => {
      if (c !== cell) closeCell(c, true);
    });

    const curtain = ensureCurtain(cell);

    gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => (cell.dataset.animating = "0"),
    })
      .set(curtain, { scaleY: 0, transformOrigin: "top" })
      .to(curtain, { scaleY: 1, duration: 0.26 })
      .add(() => {
        cell.classList.add("is-open");
        setAria(cell, true);
      })
      .set(curtain, { transformOrigin: "bottom" })
      .to(curtain, { scaleY: 0, duration: 0.26 });
  };

  cells.forEach((cell) => {
    const btn = cell.querySelector(".color-cell__btn");
    const closeBtn = cell.querySelector(".color-cell__close");

    btn?.addEventListener("click", () => {
      if (cell.classList.contains("is-open")) closeCell(cell);
      else openCell(cell);
    });

    closeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeCell(cell);
    });
  });
})();