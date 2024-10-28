import React, { useState, useEffect, useRef } from "react";
import { Feature, Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import Draw from "ol/interaction/Draw";
import { Geometry, LineString } from "ol/geom";
import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Overlay from "ol/Overlay";
import { unByKey } from "ol/Observable";
import { Coordinate } from "ol/coordinate";
import { Fill, Stroke, Style } from "ol/style";
import "./index.css";
import CircleStyle from "ol/style/Circle";
import { useFormattedUnits } from "../services/helperFunctions";
import SideControlMenu from "./SideControlMenu";

const MapComponent: React.FC = () => {
  const [location, setLocation] = useState<string>("");
  const [mode, setMode] = useState<
    "idle" | "drawing" | "deleting" | "editing" | "measuringAngle"
  >("idle");
  const [lineCoordinates, setLineCoordinates] = useState({
    startLon: 0,
    startLat: 0,
    endLon: 0,
    endLat: 0,
  });

  const mapRef = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const helpTooltipRef = useRef<Overlay | null>(null);
  const helpTooltipElementRef = useRef<HTMLDivElement | null>(null);
  const drawnFeatures = useRef<VectorSource>(new VectorSource());
  const overlaysRef = useRef<
    { feature: Feature<Geometry>; overlay: Overlay }[]
  >([]);
  const selectedFeatureRef = useRef<Feature<Geometry> | null>(null);

  const { formatLength, calculateAzimuth } = useFormattedUnits();

  const calculateLineMetrics = (
    line: LineString,
    start: Coordinate,
    end: Coordinate
  ) => {
    const length = formatLength(line);
    const azimuth = calculateAzimuth(start, end);
    console.log(`Length: ${length}, Azimuth: ${azimuth}`);
    return { length, azimuth };
  };

  const style = new Style({
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.2)",
    }),
    stroke: new Stroke({
      color: "rgba(0, 0, 0, 0.5)",
      lineDash: [10, 10],
      width: 2,
    }),
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: "rgba(0, 0, 0, 0.7)",
      }),
      fill: new Fill({
        color: "rgba(255, 255, 255, 0.2)",
      }),
    }),
  });

  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const vectorLayer = new VectorLayer({
      source: drawnFeatures.current,
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new Stroke({
          color: "#ffcc33",
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: "#ffcc33",
          }),
        }),
      }),
    });

    const map = new Map({
      target: "map",
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 0,
      }),
    });

    mapRef.current = map;

    map.on("pointermove", pointerMoveHandler);

    map.getViewport().addEventListener("mouseout", () => {
      if (helpTooltipElementRef.current) {
        helpTooltipElementRef.current.classList.add("hidden");
      }
    });
    return () => map.setTarget("");
  }, []);

  const handleSearch = async () => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${location}&format=json`
    );
    const data = await response.json();
    if (data.length > 0) {
      const { lon, lat } = data[0];
      mapRef.current
        ?.getView()
        .setCenter(fromLonLat([parseFloat(lon), parseFloat(lat)]));
      mapRef.current?.getView().setZoom(12);
    } else {
      alert("City not found");
    }
  };

  const createMeasureTooltip = (feature: Feature<Geometry>) => {
    const measureTooltipElement = document.createElement("div");
    measureTooltipElement.className = "ol-tooltip ol-tooltip-measure";
    const measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: "bottom-center",
      stopEvent: false,
      insertFirst: false,
    });
    mapRef.current?.addOverlay(measureTooltip);
    overlaysRef.current.push({ feature, overlay: measureTooltip });
    return measureTooltip;
  };

  const createHelpTooltip = () => {
    if (helpTooltipElementRef.current) {
      helpTooltipElementRef.current.remove();
    }
    helpTooltipElementRef.current = document.createElement("div");
    helpTooltipElementRef.current.className = "ol-tooltip hidden";
    helpTooltipRef.current = new Overlay({
      element: helpTooltipElementRef.current,
      offset: [15, 0],
      positioning: "center-left",
    });
    mapRef.current?.addOverlay(helpTooltipRef.current);
  };

  const pointerMoveHandler = (evt: MapBrowserEvent<UIEvent>) => {
    if (evt.dragging) return;

    let helpMsg = "Click to start drawing";
    if (mode === "drawing") {
      helpMsg = "Click to continue drawing the line";
    } else if (mode === "deleting") {
      helpMsg = "Click on a line to delete it";
    } else if (mode === "measuringAngle") {
      helpMsg = "Draw two lines to measure the angle";
    }

    if (helpTooltipElementRef.current) {
      helpTooltipElementRef.current.innerHTML = helpMsg;
      helpTooltipRef.current?.setPosition(evt.coordinate);
      helpTooltipElementRef.current.classList.remove("hidden");
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on("pointermove", pointerMoveHandler);
    }
  }, [mode]);

  const addMeasureInteraction = () => {
    createHelpTooltip();

    if (mapRef.current) {
      const draw = new Draw({
        source: drawnFeatures.current,
        type: "LineString",
        style: style,
      });
      setMode("idle");

      draw.on("drawstart", (evt) => {
        setMode("drawing");
        const sketch = evt.feature;
        const measureTooltip = createMeasureTooltip(sketch);
        createHelpTooltip();
        let tooltipCoord: Coordinate | undefined;
        const geometry = sketch.getGeometry();
        if (!geometry) return;
        if (geometry instanceof LineString) {
          tooltipCoord = geometry.getLastCoordinate();
        }

        const listener = geometry.on("change", (evt) => {
          const geom = evt.target;
          let output;
          if (geom instanceof LineString) {
            const coordinates = geom.getCoordinates();
            const { length, azimuth } = calculateLineMetrics(
              geom,
              toLonLat(coordinates[0]),
              toLonLat(coordinates[1])
            );
            output = `${length} | Azimuth: ${azimuth}`;

            tooltipCoord = geom.getLastCoordinate();
          }
          if (measureTooltip.getElement()) {
            measureTooltip.getElement()!.innerHTML = output || "";
            measureTooltip.setPosition(tooltipCoord);
          }
        });

        draw.on("drawend", () => {
          if (measureTooltip.getElement()) {
            measureTooltip.getElement()!.className =
              "ol-tooltip ol-tooltip-static";
            measureTooltip.setOffset([0, -7]);
          }
          unByKey(listener);
          setMode("idle");
        });
      });

      mapRef.current.addInteraction(draw);
      drawRef.current = draw;
    }
  };

  const enableDeleteMode = () => {
    if (mapRef.current) {
      if (drawRef.current) {
        mapRef.current.removeInteraction(drawRef.current);
        drawRef.current = null;
      }
      mapRef.current.on("singleclick", handleDeleteFeature);
      setMode("deleting");
    }
  };

  const handleDeleteFeature = (evt: MapBrowserEvent<UIEvent>) => {
    mapRef.current?.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
      if (feature && layer instanceof VectorLayer) {
        drawnFeatures.current.removeFeature(feature as Feature<Geometry>);
        const overlayIndex = overlaysRef.current.findIndex(
          (o) => o.feature === feature
        );
        if (overlayIndex !== -1) {
          const overlay = overlaysRef.current[overlayIndex].overlay;
          mapRef.current?.removeOverlay(overlay);
          overlaysRef.current.splice(overlayIndex, 1);
        }
      }
    });
  };

  const addLineByCoordinates = () => {
    const { startLon, startLat, endLon, endLat } = lineCoordinates;
    const start = fromLonLat([startLon, startLat]);
    const end = fromLonLat([endLon, endLat]);
    const line = new LineString([start, end]);

    const feature = new Feature({
      geometry: line,
    });

    drawnFeatures.current.addFeature(feature);
    createMeasureTooltip(feature);
  };

  const enableEditMode = () => {
    if (mapRef.current) {
      if (drawRef.current) {
        mapRef.current.removeInteraction(drawRef.current);
        drawRef.current = null;
      }
      mapRef.current.on("singleclick", handleEditFeature);
      setMode("editing");
    }
  };

  const handleEditFeature = (evt: MapBrowserEvent<UIEvent>) => {
    mapRef.current?.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
      if (feature && layer instanceof VectorLayer) {
        const geometry = feature.getGeometry();
        if (geometry instanceof LineString) {
          const coordinates = geometry.getCoordinates();
          const start = toLonLat(coordinates[0]);
          const end = toLonLat(coordinates[coordinates.length - 1]);
          setLineCoordinates({
            startLon: start[0],
            startLat: start[1],
            endLon: end[0],
            endLat: end[1],
          });
          selectedFeatureRef.current = feature as Feature<Geometry>;
        }
      }
    });
  };

  const updateLineOnMap = () => {
    if (selectedFeatureRef.current) {
      const geometry = selectedFeatureRef.current.getGeometry() as LineString;
      geometry.setCoordinates([
        fromLonLat([lineCoordinates.startLon, lineCoordinates.startLat]),
        fromLonLat([lineCoordinates.endLon, lineCoordinates.endLat]),
      ]);

      const overlay = overlaysRef.current.find(
        (o) => o.feature === selectedFeatureRef.current
      )?.overlay;
      if (overlay) {
        overlay.setPosition(
          fromLonLat([lineCoordinates.endLon, lineCoordinates.endLat])
        );
        const { length, azimuth } = calculateLineMetrics(
          geometry,
          [lineCoordinates.startLon, lineCoordinates.startLat],
          [lineCoordinates.endLon, lineCoordinates.endLat]
        );
        overlay.getElement()!.innerHTML = `${length} | Azimuth: ${azimuth}`;
      }
    }
  };

  useEffect(() => {
    if (mode === "editing") {
      updateLineOnMap();
    }
  }, [lineCoordinates]);

  return (
    <div className="flex h-full">
      <div className="w-1/5">
        <SideControlMenu
          location={location}
          setLocation={setLocation}
          handleSearch={handleSearch}
          addMeasureInteraction={addMeasureInteraction}
          enableDeleteMode={enableDeleteMode}
          enableEditMode={enableEditMode}
          lineCoordinates={lineCoordinates}
          setLineCoordinates={setLineCoordinates}
          addLineByCoordinates={addLineByCoordinates}
          updateLineOnMap={updateLineOnMap}
        />
      </div>
      <div className="w-4/5">
        <div id="map" className="w-full h-full"/>
      </div>
    </div>
  );
};

export default MapComponent;
