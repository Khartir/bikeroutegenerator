import { GPX, Map } from "leaflet";
import { TileLayer, Tooltip, ZoomControl } from "react-leaflet";
import { MapInteraction } from "./MapInteraction";

export function Controls({gpx}: {gpx: GPX|null}) {
    // return <ZoomControl
    return <Tooltip permanent>
          <button>Download</button>
          {/* <button onClick={() => map.removeLayer(gpx)}>Delete</button> */}
          </Tooltip>
}