// Cesium über das globale Fensterobjekt (von index.html) beziehen
const Cesium = window.Cesium;

/* Farben */
const plannedColor   = Cesium.Color.fromCssColorString("#7fc8ff");
const completedColor = Cesium.Color.fromCssColorString("#1f5bff");
const neutralColor   = Cesium.Color.fromCssColorString("#8d99ae");

/* Gipfel (Geokoordinaten) */
const mountains = [
  { name: "Mont Blanc",    height: 4808, lat: 45.8326, lon: 6.8652 },
  { name: "Matterhorn",    height: 4478, lat: 45.9763, lon: 7.6586 },
  { name: "Dufourspitze",  height: 4634, lat: 45.9367, lon: 7.8709 },
  { name: "Großglockner",  height: 3798, lat: 47.0746, lon: 12.6938 },
  { name: "Zugspitze",     height: 2962, lat: 47.4210, lon: 10.9855 },
  { name: "Piz Bernina",   height: 4049, lat: 46.3772, lon: 9.9020 },
  { name: "Eiger",         height: 3967, lat: 46.5775, lon: 8.0053 },
  { name: "Jungfrau",      height: 4158, lat: 46.5465, lon: 7.9616 },
  { name: "Weißhorn",      height: 4506, lat: 46.0833, lon: 7.6500 },
  { name: "Aiguille Verte",height: 4122, lat: 45.9225, lon: 6.9869 },
];

/* Viewer minimal mit OSM-Kacheln */
const viewer = new Cesium.Viewer("viewer", {
  animation: false,
  baseLayerPicker: false,
  geocoder: false,
  timeline: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  infoBox: false,
  selectionIndicator: false,
  imageryProvider: new Cesium.UrlTemplateImageryProvider({
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    credit: "© OpenStreetMap-Mitwirkende",
  }),
});

/* Erstmal ohne WorldTerrain (robuster für GitHub Pages).
   Wenn du World Terrain willst, kommentiere unten zwei Zeilen ein und setze ggf. deinen Ion-Token. */
// Cesium.Ion.defaultAccessToken = "DEIN_ION_TOKEN";
// Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true })
//   .then(t => viewer.terrainProvider = t)
//   .catch(() => { viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider(); });

viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

/* Kamera-Startposition Alpen */
viewer.scene.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(10.8, 46.7, 700000),
  orientation: { heading: Cesium.Math.toRadians(10), pitch: Cesium.Math.toRadians(-45), roll: 0 },
});

/* Zoomgrenzen angenehm einschränken */
viewer.scene.screenSpaceCameraController.minimumZoomDistance = 15000;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 2500000;

/* Radiobutton-Status */
let currentMode = "planned";
document.querySelectorAll('input[name="selection"]').forEach((el) =>
  el.addEventListener("change", (e) => (currentMode = e.target.value))
);

/* Gipfelpunkte + Labels */
mountains.forEach((m) => {
  m.status = "none";
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(m.lon, m.lat, m.height + 120),
    point: {
      pixelSize: 18,
      color: Cesium.Color.clone(neutralColor),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
      heightReference: Cesium.HeightReference.NONE,
    },
    label: {
      text: `${m.name}\n${m.height.toLocaleString("de-DE")} m`,
      font: '16px "Inter", sans-serif',
      fillColor: Cesium.Color.WHITE,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString("rgba(13,32,68,0.85)"),
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -2
