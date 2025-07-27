const canvas = document.getElementById('particle-bg');
const ctx = canvas.getContext('2d');
let W = window.innerWidth, H = window.innerHeight;
canvas.width = W; canvas.height = H;

const STAR_COUNT = 130;
let stars = [];
let lastMouse = {x: W/2, y: H/2}, parallax = {x: 0, y: 0};

function Star(x, y, r, vx, vy, burst = false) {
  this.x = x;
  this.y = y;
  this.radius = r;
  this.vx = vx;
  this.vy = vy;
  this.burst = burst;
  this.life = burst ? 1.0 : null;
  this.twinkle = Math.random() * Math.PI * 2;
}
Star.prototype.update = function() {
  if (this.burst) {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.025;
    this.radius *= 0.98;
  } else {
    this.x += this.vx + parallax.x * 0.16 * this.radius;
    this.y += this.vy + parallax.y * 0.16 * this.radius;
  }
  this.twinkle += 0.021 + Math.random() * 0.009;
  if (!this.burst) {
    if (this.x < 0) this.x += W;
    if (this.x > W) this.x -= W;
    if (this.y < 0) this.y += H;
    if (this.y > H) this.y -= H;
  }
}
Star.prototype.draw = function() {
  ctx.save();
  let alpha = this.burst ? Math.max(0, this.life) : 0.71 + 0.24 * Math.sin(this.twinkle + Date.now() * 0.002);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = this.burst ? 16 : 9 * (this.radius / 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function createStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; ++i) {
    stars.push(new Star(
      Math.random() * W,
      Math.random() * H,
      Math.random() * 1.4 + 0.9,
      (Math.random() - 0.5) * 0.10,
      (Math.random() - 0.5) * 0.10
    ));
  }
}

function animate() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  stars = stars.filter(star => !star.burst || (star.life > 0.03 && star.radius > 0.3));
  for (let star of stars) star.update();
  for (let star of stars) star.draw();
  parallax.x *= 0.89;
  parallax.y *= 0.89;
  requestAnimationFrame(animate);
}
// Mouse parallax
canvas.addEventListener("mousemove", e => {
  parallax.x = ((e.clientX - lastMouse.x) / W) * 2.9;
  parallax.y = ((e.clientY - lastMouse.y) / H) * 2.9;
  lastMouse = { x: e.clientX, y: e.clientY };
});
// Star burst effect on click
canvas.addEventListener("click", e => {
  const burst = 18, cx = e.clientX, cy = e.clientY;
  for (let i = 0; i < burst; ++i) {
    let angle = (Math.PI * 2 * i) / burst + Math.random() * 0.23;
    let speed = Math.random() * 2.1 + 0.69;
    stars.push(
      new Star(
        cx, cy,
        Math.random() * 1.3 + 1.2,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        true
      )
    );
  }
});
window.addEventListener("resize", () => {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  createStars();
});
// Navigation logic
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.page-section');
function hideAllSections() {
  sections.forEach(s => { s.classList.remove('active'); });
  navBtns.forEach(b => b.classList.remove('active'));
}
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    hideAllSections();
    btn.classList.add('active');
    document.getElementById(btn.dataset.section).classList.add('active');
  });
});
window.addEventListener('DOMContentLoaded', () => {
  createStars();
  animate();
  setTimeout(() => {
    document.querySelector('.main-wrapper').style.opacity = '1';
    navBtns[0].click();
  }, 340);
});
