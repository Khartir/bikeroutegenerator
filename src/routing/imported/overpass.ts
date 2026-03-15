import { Feature, Point, point as turfPoint, polygon, Polygon, Position } from "@turf/helpers";
import distance from "@turf/distance";
import { Profile, ProfileConfig, profiles } from "../routeAPI";
import { addDebugPosition, log } from "./debug";
import { findMinDistancePosIndex } from "./distance";

let overpassBaseUrl = "https://overpass.private.coffee/api/interpreter";

export function setOverpassBaseUrl(url: string) {
    overpassBaseUrl = url;
}

async function fetchOverpassJson(query: string): Promise<{ elements: any[] }> {
    const response = await fetch(overpassBaseUrl, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
    });

    const text = await response.text();

    if (text.trimStart().startsWith("<") || text.trimStart().startsWith("<!")) {
        const match = text.match(/<p>.*?<strong[^>]*>Error<\/strong>:\s*(.*?)\s*<\/p>/s);
        const errorMsg = match ? match[1].replace(/<[^>]*>/g, "").trim() : "Overpass returned an HTML error response";
        throw new Error(`Overpass error: ${errorMsg}`);
    }

    return JSON.parse(text);
}

function buildSingleQuery(wayClauses: string, radius: number, lat: number, lon: number): string {
    return `[out:json];
(
  ${wayClauses}
);
node(w)(around:${radius},${lat},${lon});
out;`;
}

function buildBatchQuery(positions: Position[], config: ProfileConfig, radius: number): string {
    const wayClauses = positions.map((pos) => config.overpassFilter(radius, pos[1], pos[0])).join("\n  ");
    return `[out:json];
(
  ${wayClauses}
);
node(w);
out;`;
}

export async function snapPolygonToRoad(startPoint: Feature<Point>, poly: Feature<Polygon>, profile: Profile) {
    const profileConfig = profiles[profile];
    const points = poly.geometry.coordinates[0].slice(0, -1) as Position[];

    const startCoords = startPoint.geometry.coordinates;
    const nonStartPoints = points.filter((pos) => pos[0] !== startCoords[0] || pos[1] !== startCoords[1]);

    const snappedMap = await snapAllVerticesToRoad(nonStartPoints, profileConfig);

    const snapped = points.map((pos) => {
        if (pos[0] === startCoords[0] && pos[1] === startCoords[1]) {
            return pos;
        }
        return snappedMap.get(pos) ?? pos;
    });

    snapped.push(snapped[0]);

    const newPoly = polygon([snapped], {
        "fill-opacity": 0,
        stroke: "#aa0",
        "stroke-width": 4,
        debugLabel: "snappedToRoad",
    });
    return newPoly;
}

async function snapAllVerticesToRoad(
    positions: Position[],
    config: ProfileConfig
): Promise<Map<Position, Position>> {
    const result = new Map<Position, Position>();
    const initialRadius = 2000;

    const nodes = await queryNodes(positions, config, initialRadius);

    const unmatched: Position[] = [];
    for (const pos of positions) {
        const nearest = findNearestWithinRadius(pos, nodes, initialRadius);
        if (nearest) {
            addDebugPosition(nearest, { "marker-color": "#dd0" });
            result.set(pos, nearest);
        } else {
            unmatched.push(pos);
        }
    }

    if (unmatched.length > 0) {
        log(`${unmatched.length} vertices had no road within ${initialRadius}m, retrying at 5000m`);
        const fallbackRadius = 5000;
        const fallbackNodes = await queryNodes(unmatched, config, fallbackRadius);

        for (const pos of unmatched) {
            const nearest = findNearestWithinRadius(pos, fallbackNodes, fallbackRadius);
            if (nearest) {
                addDebugPosition(nearest, { "marker-color": "#dd0" });
                result.set(pos, nearest);
            } else {
                throw new Error("Overpass queries failed :'(");
            }
        }
    }

    return result;
}

async function queryNodes(positions: Position[], config: ProfileConfig, radius: number): Promise<Position[]> {
    const query = buildBatchQuery(positions, config, radius);
    log("Batched Overpass query for", positions.length, "vertices at radius", radius);

    const data = await fetchOverpassJson(query);

    return data.elements.flatMap((el: any): Position[] => (el.type === "node" ? [[el.lon, el.lat]] : []));
}

function findNearestWithinRadius(pos: Position, nodes: Position[], radiusMeters: number): Position | null {
    if (nodes.length === 0) return null;

    const index = findMinDistancePosIndex(pos, nodes);
    const nearest = nodes[index];

    const dist = distance(turfPoint(pos), turfPoint(nearest), { units: "meters" });

    if (dist > radiusMeters) {
        log(`Nearest node for vertex [${pos[1]},${pos[0]}] is ${Math.round(dist)}m away (limit: ${radiusMeters}m)`);
        return null;
    }

    return nearest;
}

export async function snapPosToRoad(pos: Position, profileOrConfig: Profile | ProfileConfig): Promise<Position> {
    const config = typeof profileOrConfig === "string" ? profiles[profileOrConfig] : profileOrConfig;

    for (const searchRadius of [2000, 5000]) {
        const wayClauses = config.overpassFilter(searchRadius, pos[1], pos[0]);
        const query = buildSingleQuery(wayClauses, searchRadius, pos[1], pos[0]);

        const data = await fetchOverpassJson(query);

        if (!data.elements.length) {
            log(`Overpass Query with radius=${searchRadius} returned no results :/`);
            continue;
        }

        const nodes = data.elements.flatMap((el: any): Position[] => (el.type === "node" ? [[el.lon, el.lat]] : []));
        const index = findMinDistancePosIndex(pos, nodes);

        addDebugPosition(nodes[index], { "marker-color": "#dd0" });
        return nodes[index];
    }

    throw new Error("Overpass queries failed :'(");
}
