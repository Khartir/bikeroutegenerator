import { point } from "@turf/helpers";
import { LatLng } from "leaflet";
import { makeRandomRoute } from "./imported/route";

export async function getRoute({ startPoint, length }: { startPoint: LatLng; length: number }) {
    const startAsTurfPoint = point([startPoint.lng, startPoint.lat]);
    const gpxUrl = await makeRandomRoute(startAsTurfPoint, length, false);
    const gpxData = await (await fetch(gpxUrl)).text();
    return gpxData;
}
