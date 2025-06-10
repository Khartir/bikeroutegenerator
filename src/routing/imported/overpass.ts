import { Feature, Point, polygon, Polygon, Position } from "@turf/helpers";
import { overpassJson } from "overpass-ts";
import { Profile, profiles } from "../routeAPI";
import { addDebugPosition, log } from "./debug";
import { findMinDistancePosIndex } from "./distance";

export async function snapPolygonToRoad(startPoint: Feature<Point>, poly: Feature<Polygon>, profile: Profile) {
    const points = poly.geometry.coordinates[0].slice(0, -1);

    const snapped = await Promise.all(
        points.map((pos): Promise<Position> => {
            if (startPoint.geometry.coordinates[0] === pos[0] && startPoint.geometry.coordinates[1] === pos[1]) {
                return Promise.resolve(pos);
            }

            return snapPosToRoad(pos, profile);
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

async function snapPosToRoad(pos: Position, profile: Profile): Promise<Position> {
    for (const searchRadius of [1000, 2000, 5000]) {
        const query = `
        [out:json];
        (way
            ${profiles[profile]}
            (around:${searchRadius}.0,${pos[1]},${pos[0]});
            >;
        );
        out;
    `;

        const result = await overpassJson(query, {
            verbose: true,
            endpoint: "https://overpass-api.de/api/interpreter",
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
