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
import SideControlMenu from "../menuComponents/SideControlMenu";
import "../index.css";
import { useFormattedUnits } from "../../services/helperUnitCalculationFunctions";
import {
  calculateLineMetrics,
  createNewLine,
  getLineCoordinates,
  hasAllCoordinatesSet,
  modifyTooltip,
} from "../../services/helperLineFunctions";
import {
  defaultStyle,
  measurementStyle,
  createMeasureTooltipElement,
  createHelpTooltipElement,
} from "../style";
import { enableModifyMode } from "./MapModifyInteraction";
import { Mode, getTooltipText } from "../../types/ModeEnum";
import Modify from "ol/interaction/Modify";
import {
  defaultLineCoordinates,
  LineCoordinates,
} from "../../types/CoordinatesType";

const MapComponent: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.IDLE);
  const [lineCoordinates, setLineCoordinates] = useState<LineCoordinates>(
    defaultLineCoordinates
  );

  const mapRef = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const modifyRef = useRef<Modify | null>(null);
  const helpTooltipRef = useRef<Overlay | null>(null);
  const helpTooltipElementRef = useRef<HTMLDivElement | null>(null);
  const drawnFeatures = useRef<VectorSource>(new VectorSource());
  const overlaysRef = useRef<
    { feature: Feature<Geometry>; overlay: Overlay }[]
  >([]);
  const selectedFeatureRef = useRef<Feature<Geometry> | null>(null);

  const { formatLength, calculateAzimuth, calculateAngle } =
    useFormattedUnits();

  const calculateLineMetricsCallback = useCallback(
    (line: LineString, start: Coordinate, end: Coordinate) => {
      return calculateLineMetrics(
        line,
        start,
        end,
        formatLength,
        calculateAzimuth
      );
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

  const addInteraction = (interactionType: "distance" | "angle") => {
    createHelpTooltip();

    if (mapRef.current) {
      const draw = new Draw({
        source: drawnFeatures.current,
        type: "LineString",
        style: measurementStyle,
      });
      setMode(
        interactionType === "distance" ? Mode.DRAWING : Mode.MEASURING_ANGLE
      );

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
            if (interactionType === "distance") {
              const { length, azimuth } = calculateLineMetricsCallback(
                geom,
                toLonLat(coordinates[0]),
                toLonLat(coordinates[1])
              );
              if (mode !== Mode.MEASURING_ANGLE) {
                output = `${length} | Azimuth: ${azimuth}`;
                tooltipCoord = geom.getLastCoordinate();
              }
            } else {
              const angle = calculateAngle(geom);
              output = `Angle: ${angle}`;
              const coordinates = geom.getCoordinates();
              tooltipCoord = coordinates[coordinates.length - 2];
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
          setMode(Mode.IDLE);
        });
      });

      mapRef.current.addInteraction(draw);
      drawRef.current = draw;
    }
  };

  const enableDeleteMode = () => {
    setMode(Mode.DELETING);
    if (mapRef.current) {
      if (drawRef.current) {
        mapRef.current.removeInteraction(drawRef.current);
        drawRef.current = null;
      }
      if (modifyRef.current) {
        mapRef.current.removeInteraction(modifyRef.current);
        modifyRef.current = null;
      }
      mapRef.current.on("click", (evt) => {
        handleDeleteFeature(evt);
        setLineCoordinates(defaultLineCoordinates);
      });
    }
    setMode(Mode.IDLE);
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
    setLineCoordinates(lineCoordinates);
    const line = createNewLine(lineCoordinates);
    if (line) {
      drawnFeatures.current.addFeature(line);
      const measureTooltip = createMeasureTooltip(line);

      modifyTooltip({
        feature: line,
        overlaysRef,
        selectedFeatureRef,
        coordinates: lineCoordinates,
        formatLength,
        calculateAzimuth,
        mapRef,
        measureTooltip,
      });
    }
  };

  const enableEditMode = () => {
    setMode(Mode.EDITING);
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
        const coordinates = getLineCoordinates(feature as Feature<Geometry>);
        if (coordinates) {
          setLineCoordinates(coordinates);
          selectedFeatureRef.current = feature as Feature<Geometry>;
        }
      }
    });
  };

  const updateLineOnMap = useCallback(() => {
    if (selectedFeatureRef.current && mode === Mode.EDITING) {
      const geometry = selectedFeatureRef.current.getGeometry() as LineString;
      if (hasAllCoordinatesSet(lineCoordinates)) {
        geometry.setCoordinates([
          fromLonLat([lineCoordinates.startLon!, lineCoordinates.startLat!]),
          fromLonLat([lineCoordinates.endLon!, lineCoordinates.endLat!]),
        ]);
      }

      const overlay = overlaysRef.current.find(
        (o) => o.feature === selectedFeatureRef.current
      )?.overlay;
      if (overlay) {
        if (hasAllCoordinatesSet(lineCoordinates)) {
          overlay.setPosition(
            fromLonLat([lineCoordinates.endLon!, lineCoordinates.endLat!])
          );
        }
        if (hasAllCoordinatesSet(lineCoordinates)) {
          const { length, azimuth } = calculateLineMetricsCallback(
            geometry,
            [lineCoordinates.startLon!, lineCoordinates.startLat!],
            [lineCoordinates.endLon!, lineCoordinates.endLat!]
          );
          overlay.setPosition(
            fromLonLat([lineCoordinates.endLon!, lineCoordinates.endLat!])
          );
          overlay.getElement()!.innerHTML = `${length} | Azimuth: ${azimuth}`;
        }
      }
    }
  }, [lineCoordinates, mode, calculateLineMetricsCallback]);

  useEffect(() => {
    updateLineOnMap();
  }, [lineCoordinates, updateLineOnMap]);

  return (
    <div className="flex h-full">
      <div className="w-1/5">
        <SideControlMenu
          addMeasureInteraction={() => addInteraction("distance")}
          addAngleInteraction={() => addInteraction("angle")}
          enableDeleteMode={enableDeleteMode}
          enableEditMode={() =>
            enableModifyMode({
              mapRef,
              drawRef,
              modifyRef,
              overlaysRef,
              drawnFeatures,
              setLineCoordinates,
              setMode,
              updateLineOnMap,
              selectedFeatureRef,
              formatLength,
              calculateAzimuth,
            })
          }
          lineCoordinates={lineCoordinates}
          setLineCoordinates={setLineCoordinates}
          addLineByCoordinates={addLineByCoordinates}
          editLineCoordinates={enableEditMode}
          mapRef={mapRef}
        />
      </div>
      <div className="w-4/5">
        <div id="map" className="w-full h-full" />
      </div>
    </div>
  );
};

export default MapComponent;
