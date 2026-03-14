import { Feature, Point, polygon, Polygon, Position } from "@turf/helpers";
import { overpassJson } from "overpass-ts";
import { Profile, ProfileConfig, profiles } from "../routeAPI";
import { addDebugPosition, log } from "./debug";
import { findMinDistancePosIndex } from "./distance";

let overpassBaseUrl = "https://overpass.private.coffee/api/interpreter";

export function setOverpassBaseUrl(url: string) {
    overpassBaseUrl = url;
}

export async function snapPolygonToRoad(startPoint: Feature<Point>, poly: Feature<Polygon>, profile: Profile) {
    const profileConfig = profiles[profile];
    const points = poly.geometry.coordinates[0].slice(0, -1);

    const snapped = await Promise.all(
        points.map((pos): Promise<Position> => {
            if (startPoint.geometry.coordinates[0] === pos[0] && startPoint.geometry.coordinates[1] === pos[1]) {
                return Promise.resolve(pos);
            }

            return snapPosToRoad(pos, profileConfig);
        })
    );

    snapped.push(snapped[0]);

    const newPoly = polygon([snapped], {
        "fill-opacity": 0,
        stroke: "#aa0",
        "stroke-width": 4,
        debugLabel: "snappedToRoad",
    });
    return newPoly;
}

export async function snapPosToRoad(pos: Position, profileOrConfig: Profile | ProfileConfig): Promise<Position> {
    const config = typeof profileOrConfig === "string" ? profiles[profileOrConfig] : profileOrConfig;

    for (const searchRadius of [2000, 5000]) {
        const filterBody = config.overpassFilter(searchRadius, pos[1], pos[0]);
        const query = `
        [out:json];
        ${filterBody}
        out;
    `;

        const result = await overpassJson(query, {
            verbose: true,
            endpoint: overpassBaseUrl,
        });

        if (!result.elements.length) {
            log(`Overpass Query with radius=${searchRadius} returned no results :/`);
            continue;
        }

        const nodes = result.elements.flatMap((el): Position[] => (el.type === "node" ? [[el.lon, el.lat]] : []));
        const index = findMinDistancePosIndex(pos, nodes);

        addDebugPosition(nodes[index], { "marker-color": "#dd0" });
        return nodes[index];
    }

    throw new Error("Overpass queries failed :'(");
}
