const CesiumGlobal = window.Cesium;

if (!CesiumGlobal) {
  console.error(
    "Cesium.js konnte nicht geladen werden. Stelle sicher, dass eine Internetverbindung besteht."
  );
} else {
  const Cesium = CesiumGlobal;

  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NjQ3NTU3YS05ZjY5LTQ4MjUtOTIxOS04NmU5NDk3NjE2MGMiLCJpZCI6MTY4LCJpYXQiOjE1NjYxNjAxMjh9.tuWGINuDhcW7UZ5EONosFVJeFt3PcTJS3BM4tiTqcAQ";

  const plannedColor = Cesium.Color.fromCssColorString("#7fc8ff");
  const completedColor = Cesium.Color.fromCssColorString("#1f5bff");
  const neutralColor = Cesium.Color.fromCssColorString("#8d99ae");

  const mountains = [
    {
      name: "Mont Blanc",
      height: 4808,
      lat: 45.8326,
      lon: 6.8652,
    },
    {
      name: "Matterhorn",
      height: 4478,
      lat: 45.9763,
      lon: 7.6586,
    },
    {
      name: "Dufourspitze",
      height: 4634,
      lat: 45.9367,
      lon: 7.8709,
    },
    {
      name: "Großglockner",
      height: 3798,
      lat: 47.0746,
      lon: 12.6938,
    },
    {
      name: "Zugspitze",
      height: 2962,
      lat: 47.421,
      lon: 10.9855,
    },
    {
      name: "Piz Bernina",
      height: 4049,
      lat: 46.3772,
      lon: 9.902,
    },
    {
      name: "Eiger",
      height: 3967,
      lat: 46.5775,
      lon: 8.0053,
    },
    {
      name: "Jungfrau",
      height: 4158,
      lat: 46.5465,
      lon: 7.9616,
    },
    {
      name: "Weißhorn",
      height: 4506,
      lat: 46.0833,
      lon: 7.65,
    },
    {
      name: "Aiguille Verte",
      height: 4122,
      lat: 45.9225,
      lon: 6.9869,
    },
  ];

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
      credit: "&copy; OpenStreetMap-Mitwirkende",
    }),
  });

  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.postProcessStages.fxaa.enabled = true;
  viewer.scene.highDynamicRange = false;
  viewer.scene.skyAtmosphere.show = true;

  Cesium.createWorldTerrainAsync({
    requestVertexNormals: true,
    requestWaterMask: true,
  })
    .then((terrain) => {
      viewer.terrainProvider = terrain;
    })
    .catch((error) => {
      console.warn("Konnte Welt-Terrain nicht laden, verwende Ellipsoid.", error);
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    });

  viewer.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(10.8, 46.7, 700000.0),
    orientation: {
      heading: Cesium.Math.toRadians(10),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0.0,
    },
  });

  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 15000;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 2500000;

  const selectionInputs = document.querySelectorAll('input[name="selection"]');
  let currentMode = "planned";
  selectionInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
      currentMode = event.target.value;
    });
  });

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click) => {
    const picked = viewer.scene.pick(click.position);
    if (Cesium.defined(picked) && picked.id && picked.id.mountainRef) {
      updateMountainStatus(picked.id.mountainRef);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  mountains.forEach((mountain) => {
    mountain.status = "none";
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        mountain.lon,
        mountain.lat,
        mountain.height + 120
      ),
      point: {
        pixelSize: 18,
        color: Cesium.Color.clone(neutralColor),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        heightReference: Cesium.HeightReference.NONE,
      },
      label: {
        text: `${mountain.name}\n${mountain.height.toLocaleString("de-DE")} m`,
        font: "16px \"Inter\", sans-serif",
        fillColor: Cesium.Color.WHITE,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString("rgba(13,32,68,0.85)"),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -24),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        translucencyByDistance: new Cesium.NearFarScalar(200000, 1, 1200000, 0),
        heightReference: Cesium.HeightReference.NONE,
      },
    });

    entity.mountainRef = mountain;
    mountain.entity = entity;
  });

  function updateMountainStatus(mountain) {
    if (currentMode === "none") {
      setMountainStatus(mountain, "none");
      return;
    }

    if (mountain.status === currentMode) {
      setMountainStatus(mountain, "none");
    } else {
      setMountainStatus(mountain, currentMode);
    }
  }

  function setMountainStatus(mountain, status) {
    mountain.status = status;
    const point = mountain.entity.point;
    if (!point) return;
    let color;
    switch (status) {
      case "planned":
        color = plannedColor;
        break;
      case "completed":
        color = completedColor;
        break;
      default:
        color = neutralColor;
    }
    point.color = Cesium.Color.clone(color);
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

  updateTourenbuch();
}
