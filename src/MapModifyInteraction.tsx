import { Map } from "ol";
import Modify from "ol/interaction/Modify";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import Draw from "ol/interaction/Draw";
import VectorSource from "ol/source/Vector";
import { getLineCoordinates } from "../services/helperLineFunctions";
import { Mode } from "../types/ModeEnum";

export const enableModifyMode = (
  mapRef: React.MutableRefObject<Map | null>,
  drawRef: React.MutableRefObject<Draw | null>,
  drawnFeatures: React.MutableRefObject<VectorSource>,
  setLineCoordinates: React.Dispatch<
    React.SetStateAction<{
      startLon: number;
      startLat: number;
      endLon: number;
      endLat: number;
    }>
  >,
  setMode: React.Dispatch<React.SetStateAction<Mode>>,
  updateLineOnMap: () => void,
  selectedFeatureRef: React.MutableRefObject<Feature<Geometry> | null>
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
          setLineCoordinates(coordinates);
          selectedFeatureRef.current = feature as Feature<Geometry>;
          updateLineOnMap();
        }
      });
    });
  }
};
