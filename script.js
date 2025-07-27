const canvas = document.getElementById('particle-bg');
const ctx = canvas.getContext('2d');
let W = window.innerWidth, H = window.innerHeight;
canvas.width = W; canvas.height = H;

const STAR_COUNT = 130;
let stars = [];
let lastMouse = {x: W/2, y: H/2}, parallax = {x: 0, y: 0};

// --- Shooting Stars (improved: full-screen, several at a time, not spammy) ---
let shootingStars = [];
let shootingTimer = 0;
function ShootingStar() {
  // Start on a random edge (top/left), random angle but NOT always 45deg.
  const edge = Math.random() > 0.5 ? 'top' : 'left';
  let x, y, angle;
  if(edge === 'top') {
    x = Math.random() * W;
    y = -80;
    angle = Math.PI / 2 + (Math.random() - 0.5)*Math.PI/5; // mostly down
  } else {
    x = -80;
    y = Math.random() * H;
    angle = 0 + (Math.random() - 0.5)*Math.PI/6; // mostly right
  }
  const tx = Math.cos(angle), ty = Math.sin(angle);
  this.x = x; this.y = y;
  this.tx = tx; this.ty = ty;
  this.length = Math.random()*90 + 110;
  this.speed = Math.random()*4.8 + 5.7;
  this.alpha = 1;
}
ShootingStar.prototype.update = function() {
  this.x += this.tx * this.speed;
  this.y += this.ty * this.speed;
  this.alpha -= 0.005;
};
ShootingStar.prototype.draw = function() {
  ctx.save();
  ctx.globalAlpha = Math.max(this.alpha,0);
  ctx.strokeStyle = "#b7eaff";
  ctx.shadowColor = "#0ff";
  ctx.shadowBlur = 35;
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x - this.tx * this.length, this.y - this.ty * this.length);
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
};
function maybeAddShootingStars() {
  // Allow 1–3 at a time, but only at set intervals
  shootingTimer--;
  if(shootingTimer<=0) {
    let amount = Math.random()<0.6 ? 1 : (Math.random()<0.5 ? 2 : 3);
    for(let i=0;i<amount;i++) shootingStars.push(new ShootingStar());
    shootingTimer = ~~(50 + Math.random()*80); // new cluster 1–2 sec
  }
}

// --- Normal Stars ---
function Star(x, y, r, vx, vy, burst = false) {
  this.x = x;
  this.y = y;
  this.radius = r;
  // Make stars move more!
  this.vx = vx * 1.8;
  this.vy = vy * 1.8;
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
};
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
};
function createStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; ++i) {
    stars.push(new Star(
      Math.random() * W,
      Math.random() * H,
      Math.random() * 1.4 + 0.9,
      (Math.random() - 0.5) * 0.21,
      (Math.random() - 0.5) * 0.21
    ));
  }
}
function animate() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  maybeAddShootingStars();

  // update and draw shooting stars
  shootingStars = shootingStars.filter(s => s.x < W+150 && s.x > -150 && s.y < H+120 && s.y > -120 && s.alpha > 0.04);
  for(let s of shootingStars) { s.update(); s.draw(); }

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

// Section navigation
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

// --- SHARP CUSTOM CURSOR ---
// Remove default cursor and overlay with SVG triangle "pointer"
const neonCursor = document.getElementById('custom-cursor');
neonCursor.innerHTML = `
<svg width="34" height="34" viewBox="0 0 34 34" style="overflow:visible">
  <polygon points="5,3 30,16 13,21 10,31" fill="#0cf9fd" stroke="#09e4fa" stroke-width="2.2" filter="url(#glow)"/>
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#0cf9fd" flood-opacity="0.88"/>
      <feDropShadow dx="0" dy="0" stdDeviation="9" flood-color="#0cf9fd" flood-opacity="0.69"/>
    </filter>
  </defs>
</svg>
`;
document.body.style.cursor = 'none';
window.addEventListener("mousemove", e => {
  neonCursor.style.left = e.clientX + 'px';
  neonCursor.style.top = e.clientY + 'px';
});
window.addEventListener('mousedown',()=>neonCursor.classList.add('active'));
window.addEventListener('mouseup',()=>neonCursor.classList.remove('active'));
