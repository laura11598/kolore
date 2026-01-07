import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("threeFinal");
if (!canvas) {
  console.warn("[KOLORE] No encuentro #threeFinal (canvas) para Three.js");
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 10;

const KOLORE_PINK = "#ff0098";
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: false,
  antialias: true,
});
renderer.setClearColor(KOLORE_PINK, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const ambient = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
keyLight.position.set(5, 7, 10);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 30;
keyLight.shadow.camera.left = -12;
keyLight.shadow.camera.right = 12;
keyLight.shadow.camera.top = 12;
keyLight.shadow.camera.bottom = -12;
scene.add(keyLight);

const rim = new THREE.PointLight(0x00ff77, 0.9, 40);
rim.position.set(-6, -4, 8);
scene.add(rim);

const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.22 });
const shadowPlaneGeo = new THREE.PlaneGeometry(50, 50);
const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
shadowPlane.position.set(0, 0, -2);
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

const mouseNDC = new THREE.Vector2(999, 999);
const mouseWorld = new THREE.Vector3(999, 999, 0);
const raycaster = new THREE.Raycaster();
const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

window.addEventListener(
  "pointermove",
  (e) => {
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -((e.clientY / window.innerHeight) * 2 - 1);
    raycaster.setFromCamera(mouseNDC, camera);
    raycaster.ray.intersectPlane(zPlane, mouseWorld);
  },
  { passive: true }
);

function getBoundsAtZ0() {
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(vFov / 2) * camera.position.z;
  const width = height * camera.aspect;
  return { halfW: width / 2, halfH: height / 2 };
}

const balls = [];
const colors = ["#ff5a8a", "#9b4dff", "#dfff4f", "#ffd34d", "#00ff77", "#ffffff"];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function makeBall() {
  const radius = rand(0.35, 0.75);
  const geo = new THREE.SphereGeometry(radius, 40, 28);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
    roughness: 0.28,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;

  const { halfW, halfH } = getBoundsAtZ0();
  mesh.position.set(
    rand(-halfW + radius, halfW - radius),
    rand(-halfH + radius, halfH - radius),
    rand(-0.6, 0.6)
  );

  const vel = new THREE.Vector3(rand(-1.2, 1.2), rand(-1.0, 1.0), rand(-0.15, 0.15));
  return { mesh, radius, vel };
}

for (let i = 0; i < 14; i++) {
  const b = makeBall();
  balls.push(b);
  scene.add(b.mesh);
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.033);
  const { halfW, halfH } = getBoundsAtZ0();

  const influence = 2.4;
  const pushPower = 14.0;
  const swirl = 4;
  const damping = 0.995;

  for (const b of balls) {
    const m = b.mesh;

    const dx = m.position.x - mouseWorld.x;
    const dy = m.position.y - mouseWorld.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.0001;

    if (dist < influence) {
      const nx = dx / dist;
      const ny = dy / dist;
      const strength = (1 - dist / influence) * pushPower;

      b.vel.x += nx * strength * dt;
      b.vel.y += ny * strength * dt;

      b.vel.x += -ny * swirl * dt;
      b.vel.y += nx * swirl * dt;
    }

    m.position.x += b.vel.x * dt;
    m.position.y += b.vel.y * dt;
    m.position.z += b.vel.z * dt;

    if (m.position.x > halfW - b.radius) {
      m.position.x = halfW - b.radius;
      b.vel.x *= -1;
    }
    if (m.position.x < -halfW + b.radius) {
      m.position.x = -halfW + b.radius;
      b.vel.x *= -1;
    }

    if (m.position.y > halfH - b.radius) {
      m.position.y = halfH - b.radius;
      b.vel.y *= -1;
    }
    if (m.position.y < -halfH + b.radius) {
      m.position.y = -halfH + b.radius;
      b.vel.y *= -1;
    }

    if (m.position.z > 0.9) {
      m.position.z = 0.9;
      b.vel.z *= -1;
    }
    if (m.position.z < -0.9) {
      m.position.z = -0.9;
      b.vel.z *= -1;
    }

    b.vel.multiplyScalar(damping);
    const maxSpeed = 5.5;
    if (b.vel.length() > maxSpeed) b.vel.setLength(maxSpeed);

    m.rotation.x += (b.vel.y * 0.02) * dt;
    m.rotation.y += (b.vel.x * 0.02) * dt;
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  },
  { passive: true }
);