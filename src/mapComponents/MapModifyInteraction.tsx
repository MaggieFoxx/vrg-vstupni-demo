import { Map, Overlay } from "ol";
import Modify from "ol/interaction/Modify";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import Draw from "ol/interaction/Draw";
import VectorSource from "ol/source/Vector";
import {
  getLineCoordinates,
  modifyTooltip,
} from "../../services/helperLineFunctions";
import { Mode } from "../../types/ModeEnum";
import { Coordinate } from "ol/coordinate";
import { LineCoordinates } from "../../types/CoordinatesType";

export const enableModifyMode = (
  mapRef: React.MutableRefObject<Map | null>,
  drawRef: React.MutableRefObject<Draw | null>,
  overlaysRef: React.MutableRefObject<
    {
      feature: Feature<Geometry>;
      overlay: Overlay;
    }[]
  >,
  drawnFeatures: React.MutableRefObject<VectorSource>,
  setLineCoordinates: React.Dispatch<React.SetStateAction<LineCoordinates>>,
  setMode: React.Dispatch<React.SetStateAction<Mode>>,
  updateLineOnMap: () => void,
  selectedFeatureRef: React.MutableRefObject<Feature<Geometry> | null>,
  formatLength: (line: LineString) => string,
  calculateAzimuth: (start: Coordinate, end: Coordinate) => string
) => {
  setMode(Mode.MODIFYING);

  if (mapRef.current) {
    if (drawRef.current) {
      mapRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }
    const modify = new Modify({ source: drawnFeatures.current });
    mapRef.current.addInteraction(modify);

    modify.on("modifyend", (evt) => {
      const features = evt.features.getArray();
      features.forEach((feature) => {
        const coordinates = getLineCoordinates(feature as Feature<Geometry>);
        if (coordinates) {
          setLineCoordinates(coordinates as LineCoordinates);
          selectedFeatureRef.current = feature as Feature<Geometry>;
          updateLineOnMap();

          modifyTooltip({
            feature,
            overlaysRef,
            selectedFeatureRef,
            coordinates: coordinates as LineCoordinates,
            formatLength,
            calculateAzimuth,
            mapRef,
          });
        }
      });
    });
  }
};
