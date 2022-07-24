import { Feature, featureCollection, point, Position, Properties } from "@turf/helpers";

const features: Feature[] = [];

export function addDebugFeature(feature: Feature) {
    features.push(feature);
}

export function addDebugPosition(position: Position, props?: Properties) {
    addDebugFeature(point(position, props));
}

export function getDebugFeatureCollection() {
    return featureCollection(features);
}

export const debugEnabled = false;

export function log(...values: any) {
    if (!debugEnabled) {
        return;
    }
    console.log(...values);
}

export const debugCollectors = {
    addDebugFeature,
    addDebugPosition,
};

export type DebugCollectors = typeof debugCollectors;
