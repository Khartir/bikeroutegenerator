import { Feature, FeatureCollection, LineString, Point, Polygon, Position } from "@turf/helpers";
import { Profile } from "../routeAPI";
import { debugCollectors, DebugCollectors, log } from "./debug";
import { equalPos } from "./distance";

const baseUrl = "http://localhost:17777/brouter";

export async function polygonToGpxUrl(
    startPoint: Feature<Point>,
    poly: Feature<Polygon>,
    ccw: boolean,
    profile: Profile,
    debug: DebugCollectors = debugCollectors
) {
    const fixedPoints: Position[] = await getWaypoints(startPoint, poly, ccw, profile, debug);

    const lonlats = fixedPoints.map((x) => x.join(",")).join("|");
    const url = `${baseUrl}?lonlats=${lonlats}&profile=${profile}&alternativeidx=0&format=gpx`;
    log("brouter gpx url", url);

    return url;
}

export async function getWaypoints(
    startPoint: Feature<Point>,
    poly: Feature<Polygon>,
    ccw: boolean,
    profile: Profile,
    debug: DebugCollectors = debugCollectors
) {
    const [...polyPoints] = poly.geometry.coordinates[0];
    if (!ccw) polyPoints.reverse();

    const route = await makeRoute(polyPoints, profile, debug);
    const fixes = findAllDeadEnds(startPoint, route, debug);
    log("found fixes", fixes);

    const fixedPoints: Position[] = [];
    for (let i = 0; i < polyPoints.length; i++) {
        const fix = fixes.find((f) => equalPos(polyPoints[i], f[0]));
        fixedPoints.push(fix ? fix[1] : polyPoints[i]);
    }
    return fixedPoints;
}

export async function makeRoute(polyPoints: Position[], profile: string, debug: DebugCollectors) {
    const pairs = collectPosPairs(polyPoints);
    return Promise.all(pairs.map((pair) => callRouter(pair, profile, debug)));
}

function collectPosPairs(points: Position[]): [Position, Position][] {
    const result: [Position, Position][] = [];

    for (let i = 0; i < points.length - 1; i++) {
        result.push([points[i], points[i + 1]]);
    }

    return result;
}

async function callRouter(
    pair: [Position, Position],
    profile: string,
    { addDebugFeature }: DebugCollectors
): Promise<Feature<LineString>> {
    const lonlats = pair.map((x) => x.join(",")).join("|");
    const url = `${baseUrl}?lonlats=${lonlats}&profile=${profile}&alternativeidx=0&format=geojson`;
    log("calling brouter w/", url);
    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BRouter API error (${response.status}): ${errorText}`);
    }

    const result: FeatureCollection<LineString> = (await response.json()) as any;
    result.features[0].properties!.stroke = "#f00";
    result.features[0].properties!.debugLabel = "dead end";
    addDebugFeature(result.features[0]);

    return result.features[0];
}

function findAllDeadEnds(
    startPoint: Feature<Point>,
    route: Feature<LineString>[],
    debug: DebugCollectors
): [Position, Position][] {
    const fixes: [Position, Position][] = [];
    for (let segment = 0; segment < route.length - 1; segment++) {
        const seg = route[segment].geometry.coordinates;
        if (equalPos(seg[seg.length - 1], startPoint.geometry.coordinates)) {
            continue;
        }

        const fix = findDeadEndOnRoute(seg, route[segment + 1].geometry.coordinates, debug);
        if (fix) fixes.push(fix);
    }

    if (!equalPos(route[0].geometry.coordinates[0].slice(0, 2), startPoint.geometry.coordinates)) {
        const fix = findDeadEndOnRoute(
            route[route.length - 1].geometry.coordinates,
            route[0].geometry.coordinates,
            debug
        );
        if (fix) fixes.push(fix);
    }

    return fixes;
}

function findDeadEndOnRoute(
    segA: Position[],
    segB: Position[],
    { addDebugPosition }: DebugCollectors
): undefined | [Position, Position] {
    const maxOffset = Math.min(segA.length, segB.length);

    let offA = 0;
    let offB = 0;

    while (equalPos(segA[segA.length - 1 - offA], segA[segA.length - 1 - offA - 1])) offA++;
    while (equalPos(segB[offB], segB[offB + 1])) offB++;

    while (offA < maxOffset && equalPos(segA[segA.length - 1 - offA], segB[offB])) {
        offA++;
        offB++;

        while (equalPos(segA[segA.length - 1 - offA], segA[segA.length - 1 - offA - 1])) offA++;
        while (equalPos(segB[offB], segB[offB + 1])) offB++;
    }

    if (offA === 1) return;

    addDebugPosition(segB[offB - 1], { "marker-color": "#d00", debugLabel: "Waypoint" });
    return [segB[0], segB[offB - 1]];
}
