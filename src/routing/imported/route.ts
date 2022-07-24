import { Feature, Point, polygon, Polygon, Position } from "@turf/helpers";
import circle from "@turf/circle";
import { debugCollectors, DebugCollectors, log } from "./debug";
import { snapPolygonToRoad } from "./overpass";
import { equalPos, findMinDistancePosIndex } from "./distance";
import { Profile } from "../routeAPI";
import { getWaypoints } from "./brouter";

export async function makeRandomRoute({
    startPoint,
    length,
    ccw = false,
    profile,
    steps = 5,
    debug = debugCollectors,
}: {
    startPoint: Feature<Point>;
    length: number;
    ccw?: boolean;
    profile: Profile;
    steps?: number;
    debug: DebugCollectors;
}) {
    const radius = length / Math.PI / 2;
    log("going w/ radius", radius);

    const center = findRandomCenterPos(startPoint, radius, debug);
    const poly1 = findRandomCheckpointPolygon(center, radius, steps, startPoint, debug);
    const poly1b = shiftToStartPoint(startPoint, poly1);

    const poly2 = await snapPolygonToRoad(startPoint, poly1b, profile);
    debug.addDebugFeature(poly2);

    return getWaypoints(startPoint, poly2, ccw, profile, debug);
}

function shiftToStartPoint(startPoint: Feature<Point>, poly1: Feature<Polygon>): Feature<Polygon> {
    const [...points] = poly1.geometry.coordinates[0];

    while (!equalPos(points[0], startPoint.geometry.coordinates)) {
        points.pop();
        const p = points.shift();
        points.push(p!);
        points.push(points[0]);
    }

    return polygon([points]);
}

function findRandomCheckpointPolygon(
    center: Position,
    radius: number,
    steps: number,
    startPoint: Feature<Point>,
    { addDebugFeature }: DebugCollectors
): Feature<Polygon> {
    const c2 = circle(center, radius, { steps });
    c2.properties || (c2.properties = {});
    c2.properties.debugLabel = "c2";
    const minDistanceIndex = findMinDistancePosIndex(startPoint, c2.geometry.coordinates[0]);

    c2.geometry.coordinates[0].splice(minDistanceIndex, 1, startPoint.geometry.coordinates);

    if (minDistanceIndex === 0) {
        c2.geometry.coordinates[0].splice(-1, 1, startPoint.geometry.coordinates);
    }

    addDebugFeature(c2);
    return c2;
}

function findRandomCenterPos(
    startPoint: Feature<Point>,
    radius: number,
    { addDebugFeature, addDebugPosition }: DebugCollectors
): Position {
    const c1 = circle(startPoint, radius, { steps: 180, properties: { "fill-opacity": 0.1, debugLabel: "c1" } });
    startPoint.properties || (startPoint.properties = {});
    startPoint.properties.debugLabel = "startPoint";
    addDebugFeature(startPoint);
    addDebugFeature(c1);

    const center = c1.geometry.coordinates[0][Math.floor(Math.random() * c1.geometry.coordinates[0].length)];
    log("chosen random center", center);
    addDebugPosition(center, { "marker-color": "#0d0", debugLabel: "center" });

    return center;
}
