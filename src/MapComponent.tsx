import React, { useState, useEffect, useRef, useCallback } from "react";
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
import SideControlMenu from "./SideControlMenu";
import "./index.css";
import {
  createNewLine,
  getTooltipText,
  useFormattedUnits,
} from "../services/helperFunctions";
import {
  defaultStyle,
  measurementStyle,
  createMeasureTooltipElement,
  createHelpTooltipElement,
} from "./style";
import axios from "axios";

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

  const { formatLength, calculateAzimuth, calculateAngle } =
    useFormattedUnits();

  const calculateLineMetrics = useCallback(
    (line: LineString, start: Coordinate, end: Coordinate) => {
      const length = formatLength(line);
      const azimuth = calculateAzimuth(start, end);
      return { length, azimuth };
    },
    [formatLength, calculateAzimuth]
  );

  const printTooltipMessage = useCallback(
    (evt: MapBrowserEvent<UIEvent>) => {
      if (evt.dragging) return;
      const helpMsg = getTooltipText(mode);

      if (helpTooltipElementRef.current) {
        helpTooltipElementRef.current.innerHTML = helpMsg;
        helpTooltipRef.current?.setPosition(evt.coordinate);
        helpTooltipElementRef.current.classList.remove("hidden");
      }
    },
    [mode]
  );

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on("pointermove", printTooltipMessage);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.un("pointermove", printTooltipMessage);
      }
    };
  }, [printTooltipMessage]);

  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const vectorLayer = new VectorLayer({
      source: drawnFeatures.current,
      style: defaultStyle,
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
    map.getViewport().addEventListener("mouseout", () => {
      if (helpTooltipElementRef.current) {
        helpTooltipElementRef.current.classList.add("hidden");
      }
    });
    return () => map.setTarget("");
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?city=${location}&format=json`
      );
      const data = response.data;
      if (data.length > 0) {
        const { lon, lat } = data[0];
        mapRef.current
          ?.getView()
          .setCenter(fromLonLat([parseFloat(lon), parseFloat(lat)]));
        mapRef.current?.getView().setZoom(12);
      } else {
        alert("City not found");
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      alert("An error occurred while searching for the city");
    }
  };

  const createMeasureTooltip = (feature: Feature<Geometry>) => {
    const measureTooltip = createMeasureTooltipElement();
    mapRef.current?.addOverlay(measureTooltip);
    overlaysRef.current.push({ feature, overlay: measureTooltip });
    return measureTooltip;
  };

  const createHelpTooltip = () => {
    if (helpTooltipElementRef.current) {
      helpTooltipElementRef.current.remove();
    }
    helpTooltipRef.current = createHelpTooltipElement(helpTooltipElementRef);
    mapRef.current?.addOverlay(helpTooltipRef.current);
  };

  const addMeasureInteraction = () => {
    createHelpTooltip();

    if (mapRef.current) {
      const draw = new Draw({
        source: drawnFeatures.current,
        type: "LineString",
        style: measurementStyle,
      });
      setMode("drawing");

      draw.on("drawstart", (evt) => {
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
            if (mode !== "measuringAngle") {
              output = `${length} | Azimuth: ${azimuth}`;
              tooltipCoord = geom.getLastCoordinate();
            }
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

  const addAngleInteraction = () => {
    createHelpTooltip();

    if (mapRef.current) {
      const draw = new Draw({
        source: drawnFeatures.current,
        type: "LineString",
        style: measurementStyle,
      });
      setMode("measuringAngle");

      draw.on("drawstart", (evt) => {
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
          const angle = calculateAngle(geom);
          const output = `Angle: ${angle}`;

          const coordinates = geom.getCoordinates();
          tooltipCoord = coordinates[coordinates.length - 2];

          if (measureTooltip.getElement()) {
            measureTooltip.getElement()!.innerHTML = output || "";
            measureTooltip.setPosition(tooltipCoord);
          }
        });

        draw.on("drawend", () => {
          unByKey(listener);
          setMode("idle");
        });
      });

      mapRef.current.addInteraction(draw);
      drawRef.current = draw;
    }
  };

  const enableDeleteMode = () => {
    setMode("deleting");
    if (mapRef.current) {
      if (drawRef.current) {
        mapRef.current.removeInteraction(drawRef.current);
        drawRef.current = null;
      }
      mapRef.current.on("singleclick", handleDeleteFeature);
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
    const line = createNewLine(lineCoordinates);
    drawnFeatures.current.addFeature(line);
    const measureTooltip = createMeasureTooltip(line);

    const { length, azimuth } = calculateLineMetrics(
      line.getGeometry() as LineString,
      [lineCoordinates.startLon, lineCoordinates.startLat],
      [lineCoordinates.endLon, lineCoordinates.endLat]
    );
    measureTooltip.getElement()!.innerHTML = `${length} | Azimuth: ${azimuth}`;
    measureTooltip.setPosition(
      fromLonLat([lineCoordinates.endLon, lineCoordinates.endLat])
    );
  };

  const enableEditMode = () => {
    setMode("editing");
    if (mapRef.current) {
      if (drawRef.current) {
        mapRef.current.removeInteraction(drawRef.current);
        drawRef.current = null;
      }
      mapRef.current.on("singleclick", handleEditFeature);
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

  const updateLineOnMap = useCallback(() => {
    if (selectedFeatureRef.current && mode === "editing") {
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
  }, [lineCoordinates, mode, calculateLineMetrics]);

  useEffect(() => {
    updateLineOnMap();
  }, [lineCoordinates, updateLineOnMap]);

  return (
    <div className="flex h-full">
      <div className="w-1/5">
        <SideControlMenu
          location={location}
          setLocation={setLocation}
          handleSearch={handleSearch}
          addMeasureInteraction={addMeasureInteraction}
          addAngleInteraction={addAngleInteraction}
          enableDeleteMode={enableDeleteMode}
          enableEditMode={enableEditMode}
          lineCoordinates={lineCoordinates}
          setLineCoordinates={setLineCoordinates}
          addLineByCoordinates={addLineByCoordinates}
          updateLineOnMap={updateLineOnMap}
        />
      </div>
      <div className="w-4/5">
        <div id="map" className="w-full h-full" />
      </div>
    </div>
  );
};

export default MapComponent;
