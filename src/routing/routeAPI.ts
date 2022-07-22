import { point } from "@turf/helpers";
import { LatLng } from "leaflet";
import { makeRandomRoute } from "./imported/route";

export async function getRoute({
    startPoint,
    length,
    profile,
}: {
    startPoint: LatLng;
    length: number;
    profile: Profile;
}) {
    const startAsTurfPoint = point([startPoint.lng, startPoint.lat]);
    const gpxUrl = await makeRandomRoute(startAsTurfPoint, length, false, profile);
    const gpxData = await (await fetch(gpxUrl)).text();
    return gpxData;
}

export const profiles = {
    "fastbike-verylowtraffic": "[highway~'tertiary|unclassified']",
    trekking: "[highway]",
};

export type Profile = keyof typeof profiles;
