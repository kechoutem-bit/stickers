// Store home page: fills the exit grids from data.js and runs the sticker swap on the car photo.
const STORE = "https://shop.whypricesdothat.com";
const P = window.PRODUCTS;
const byNum = Object.fromEntries(P.map(p => [p.num, p]));
const buyUrl = p => p.url || `${STORE}/products`;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- grids ----
const tpl = document.getElementById("tpl-item");
const FIRST = matchMedia("(max-width: 760px)").matches ? 6 : 9;   // shown before "Show all"
for (const ul of document.querySelectorAll(".grid")) {
  const list = P.filter(p => p.exit === ul.dataset.exit);
  list.forEach((p, i) => {
    const li = tpl.content.firstElementChild.cloneNode(true);
    const label = p.custom ? `${p.title} (you add the words)` : p.title;
    li.querySelector(".art").href = buyUrl(p);
    li.querySelector(".art").setAttribute("aria-label", `${label}, $9.99`);
    li.querySelector("img").src = `img/s/${p.num}.webp`;
    li.querySelector("img").alt = `Bumper sticker: ${p.title}`;
    const buy = li.querySelector(".buy");
    buy.href = buyUrl(p);
    buy.setAttribute("aria-label", `Buy ${p.title}, $9.99`);
    li.style.setProperty("--d", `${(i % 3) * 70}ms`);
    if (i >= FIRST) li.classList.add("extra");
    ul.append(li);
  });
  document.querySelector(`[data-count="${ul.dataset.exit}"]`).textContent = list.length;
  if (list.length > FIRST) {
    const name = ul.closest("section").querySelector("h2").textContent.toLowerCase();
    const btn = Object.assign(document.createElement("button"), {
      type: "button", className: "btn btn-dark more", textContent: `Show all ${list.length} ${name} stickers`,
    });
    btn.addEventListener("click", () => {
      ul.classList.add("open");
      btn.remove();
      ul.querySelector(".extra a")?.focus({ preventScroll: true });
    });
    ul.after(btn);
  }
}

// stickers slap down as they reach the screen (content is visible without JS or with reduced motion)
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".item").forEach(el => io.observe(el));
}

// ---- sticker swap on the car ----
const { box, rotation, ar } = window.HERO;
const onCar = document.getElementById("onCar");
onCar.parentElement.style.setProperty("--ar", ar);   // the frame keeps the photo's own shape
const title = document.getElementById("nowTitle");
const buyNow = document.getElementById("buyNow");
const pad = 0.7; // % of the photo: covers the edge of the sticker already in the picture
Object.entries({ x: box.x - pad, y: box.y - pad * 2.5, w: box.w + 2 * pad, h: box.h + 5 * pad })
  .forEach(([k, v]) => onCar.style.setProperty(`--${k}`, `${v}%`));
rotation.forEach(n => { new Image().src = `img/s/${n}.webp`; });   // preload so the swap never blinks

let at = 0;
function show(i, slap = true) {
  at = (i + rotation.length) % rotation.length;
  const p = byNum[rotation[at]];
  title.textContent = p.title;
  buyNow.href = buyUrl(p);
  buyNow.setAttribute("aria-label", `Buy ${p.title}, $9.99`);
  // always the real art on the car: the photo's own sticker (number 0) was drawn by the photo tool
  onCar.src = `img/s/${p.num}.webp`;
  onCar.hidden = false;
  if (!slap) return;
  onCar.classList.remove("slap");
  void onCar.offsetWidth;
  onCar.classList.add("slap");
}
show(0, false);

// auto-swap until the visitor takes over; only while the photo is on screen
let timer = null, touched = false;
const run = on => {
  clearInterval(timer);
  if (on && !touched && !reduce) timer = setInterval(() => show(at + 1), 3800);
};
new IntersectionObserver(([e]) => run(e.isIntersecting)).observe(document.querySelector(".photo"));
document.getElementById("nextJoke").addEventListener("click", () => { touched = true; run(false); show(at + 1); });
