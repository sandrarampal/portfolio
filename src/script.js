import * as THREE from "three";
import GUI from "lil-gui";
import gsap from "gsap";

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Light
 */

const directionnalLight = new THREE.DirectionalLight("#ffffff", 3);
directionnalLight.position.set(1, 1, 0);
scene.add(directionnalLight);

/**
 * Texture
 */
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("./textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;
const particlesTexture = textureLoader.load("/textures/particles/3.png");

/**
 * Material
 */

const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  transparent: true,

  gradientMap: gradientTexture,
});

/**
 * Geometry
 */
const mesh1 = new THREE.Mesh(
  new THREE.TorusGeometry(0.8, 0.4, 16, 60),
  material
);
const mesh2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), material);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.7, 0.3, 100, 16),
  material
);
// const plane1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), material);
scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

const objectDistance = 4;

mesh1.position.y = -objectDistance * 0;
mesh2.position.y = -objectDistance * 1;
mesh3.position.y = -objectDistance * 2;

mesh1.position.x = 1.7;
mesh2.position.x = -2.2;
mesh3.position.x = 1.6;

/**
 * Particles
 */

const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: Math.random() * 0.3,
});
particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particlesTexture;
particlesMaterial.depthWrite = false;

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

for (let i = 0; i < particlesCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 10;
  positions[i3 + 1] =
    objectDistance * 0.5 -
    Math.random() * objectDistance * sectionMeshes.length;
  positions[i3 + 2] = (Math.random() - 0.5) * 10;
}

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Cursor
 */

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Camera
 */

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;

cameraGroup.add(camera);

/**
 * Scroll
 */

let currentSection = 0;
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);
  if (newSection !== currentSection) {
    currentSection = newSection;
    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power1.inOut",
      x: "+=4",
      y: "+=2",
      z: "+=0.5",
    });
  }
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  particles.rotation.y = elapsedTime * 0.03;

  camera.position.y = (-scrollY / sizes.height) * objectDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
