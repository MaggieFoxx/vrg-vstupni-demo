import Overlay from "ol/Overlay";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";

export const measurementStyle = new Style({
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

export const defaultStyle = new Style({
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
});

export const tooltipStyles = {
  backgroundColor: "#f9f9f9",
  color: "#333",
  padding: "10px 15px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  maxWidth: "180px",
};

export const createMeasureTooltipElement = (): Overlay => {
  const measureTooltipElement = document.createElement("div");
  measureTooltipElement.className = "ol-tooltip ol-tooltip-measure";
  const measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: "bottom-center",
    stopEvent: false,
    insertFirst: false,
  });
  return measureTooltip;
};

export const createHelpTooltipElement = (
  helpTooltipElementRef: React.MutableRefObject<HTMLDivElement | null>
): Overlay => {
  helpTooltipElementRef.current = document.createElement("div");
  helpTooltipElementRef.current.className = "ol-tooltip hidden";
  return new Overlay({
    element: helpTooltipElementRef.current,
    offset: [15, 0],
    positioning: "center-left",
  });
};
