import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const plannedColor = new THREE.Color("#7fc8ff");
const completedColor = new THREE.Color("#1f5bff");
const neutralColor = new THREE.Color("#8d99ae");

const mountains = [
  {
    name: "Mont Blanc",
    height: 4808,
    position: { x: 0, z: 0 },
  },
  {
    name: "Matterhorn",
    height: 4478,
    position: { x: -24, z: -12 },
  },
  {
    name: "Dufourspitze",
    height: 4634,
    position: { x: -28, z: -6 },
  },
  {
    name: "Großglockner",
    height: 3798,
    position: { x: 60, z: -10 },
  },
  {
    name: "Zugspitze",
    height: 2962,
    position: { x: 48, z: 45 },
  },
  {
    name: "Piz Bernina",
    height: 4049,
    position: { x: 18, z: 14 },
  },
  {
    name: "Eiger",
    height: 3967,
    position: { x: -6, z: 22 },
  },
  {
    name: "Jungfrau",
    height: 4158,
    position: { x: -2, z: 24 },
  },
  {
    name: "Weißhorn",
    height: 4506,
    position: { x: -12, z: 10 },
  },
  {
    name: "Aiguille Verte",
    height: 4122,
    position: { x: -6, z: -4 },
  },
];

const container = document.getElementById("map-container");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2("#c6d9ff", 0.0065);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
camera.position.set(80, 70, 110);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.1;
controls.target.set(0, 10, 0);

const ambientLight = new THREE.AmbientLight(0xf6f7fb, 0.9);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
dirLight.position.set(120, 180, 90);
dirLight.castShadow = true;
scene.add(dirLight);

const planeGeometry = new THREE.PlaneGeometry(240, 180, 40, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#d7e7ff"),
  roughness: 0.95,
  metalness: 0.05,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

const mountainGroup = new THREE.Group();
scene.add(mountainGroup);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let currentMode = "planned";

const selectionInputs = document.querySelectorAll('input[name="selection"]');
selectionInputs.forEach((input) =>
  input.addEventListener("change", (event) => {
    currentMode = event.target.value;
  })
);

function createLabel(textLines) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const padding = 18;
  const fontSize = 34;
  context.font = `${fontSize}px Inter`;
  const width = Math.max(...textLines.map((line) => context.measureText(line).width));
  canvas.width = width + padding * 2;
  canvas.height = fontSize * textLines.length + padding * 1.4;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(13, 32, 68, 0.85)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.font = `${fontSize}px Inter`;
  context.textBaseline = "top";
  textLines.forEach((line, index) => {
    context.fillText(line, padding, padding + index * fontSize);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  const aspect = canvas.width / canvas.height;
  const baseScale = 16;
  sprite.scale.set(baseScale * aspect, baseScale, 1);
  return sprite;
}

function createMountain(mountain) {
  const geometry = new THREE.ConeGeometry(6, mountain.height / 80, 32);
  const material = new THREE.MeshStandardMaterial({ color: neutralColor.clone() });
  const cone = new THREE.Mesh(geometry, material);
  cone.position.set(mountain.position.x, geometry.parameters.height / 2, mountain.position.z);
  cone.castShadow = true;
  cone.receiveShadow = true;
  cone.userData = { mountain };

  const label = createLabel([
    mountain.name,
    `${mountain.height.toLocaleString("de-DE")} m`,
  ]);
  label.position.set(
    mountain.position.x,
    geometry.parameters.height + 12,
    mountain.position.z
  );
  cone.add(label);

  mountain.mesh = cone;
  mountain.label = label;
  mountain.status = "none";
  mountainGroup.add(cone);
}

mountains.forEach(createMountain);

function resizeRenderer() {
  const { clientWidth, clientHeight } = container;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
}

resizeRenderer();
window.addEventListener("resize", resizeRenderer);

function onPointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerDown(event) {
  onPointerMove(event);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(mountainGroup.children, false);
  if (intersects.length > 0) {
    const mountain = intersects[0].object.userData.mountain;
    updateMountainStatus(mountain);
  }
}

renderer.domElement.addEventListener("pointerdown", onPointerDown);

function updateMountainStatus(mountain) {
  if (currentMode === "none") {
    mountain.status = "none";
    mountain.mesh.material.color.copy(neutralColor);
  } else if (mountain.status === currentMode) {
    // toggle off when clicking the same status again
    mountain.status = "none";
    mountain.mesh.material.color.copy(neutralColor);
  } else {
    mountain.status = currentMode;
    const color = currentMode === "planned" ? plannedColor : completedColor;
    mountain.mesh.material.color.copy(color);
  }
  updateTourenbuch();
}

function updateTourenbuch() {
  const plannedList = document.getElementById("planned-list");
  const completedList = document.getElementById("completed-list");
  plannedList.innerHTML = "";
  completedList.innerHTML = "";

  mountains
    .filter((mountain) => mountain.status === "planned")
    .sort((a, b) => b.height - a.height)
    .forEach((mountain) => {
      plannedList.appendChild(createListItem(mountain));
    });

  mountains
    .filter((mountain) => mountain.status === "completed")
    .sort((a, b) => b.height - a.height)
    .forEach((mountain) => {
      completedList.appendChild(createListItem(mountain));
    });
}

function createListItem(mountain) {
  const li = document.createElement("li");
  li.textContent = mountain.name;
  const height = document.createElement("span");
  height.textContent = `${mountain.height.toLocaleString("de-DE")} m`;
  li.appendChild(height);
  return li;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
updateTourenbuch();
