import { turfToLatLng } from "../leaflet/leafletHelpers";
import { Position } from "@turf/helpers";
import { Marker, Polyline, Popup } from "react-leaflet";
import { useAppSelector } from "../state/hooks";
import { selectDebugFeatures, selectGenerationStep } from "./routeSlice";

export function Debug() {
    const features = useAppSelector(selectDebugFeatures);
    const generationStep = useAppSelector(selectGenerationStep);

    // Step 1: show c1 circle
    // Step 2: hide c1 circle, show c2 polygon with movable vertices
    // Step 3+: hide polygon
    // Route segments (dead end detection): only show during finding_waypoints step
    const showC1Circle = generationStep === "finding_center";
    const showPolygon = generationStep === "creating_polygon";
    const showRouteSegments = generationStep === "finding_waypoints";

    return (
        <>
            {features.map(({ geometry, properties }, index) => {
                const debugLabel = properties?.debugLabel;

                // Skip start point (shown separately)
                if (debugLabel === "startPoint") {
                    return null;
                }

                // c1 circle: only show in step 1
                if (debugLabel === "c1" && !showC1Circle) {
                    return null;
                }

                // c2 polygon: only show in steps 2-3
                if (debugLabel === "c2" && !showPolygon) {
                    return null;
                }

                if (geometry.type === "Point") {
                    // Waypoint markers from dead end detection: don't show (real waypoints shown by WayPoints.tsx)
                    if (debugLabel === "Waypoint") {
                        return null;
                    }
                    return (
                        <Marker position={turfToLatLng(geometry.coordinates as Position)} key={index}>
                            {debugLabel && <Popup>{debugLabel}</Popup>}
                        </Marker>
                    );
                }
                if (geometry.type === "Polygon") {
                    return (
                        <Polyline positions={(geometry.coordinates[0] as Position[]).map(turfToLatLng)} key={index}>
                            {debugLabel && <Popup>{debugLabel}</Popup>}
                        </Polyline>
                    );
                }
                if (geometry.type === "LineString") {
                    // Route segments from dead end detection: only show during finding_waypoints step
                    if (debugLabel === "dead end" && !showRouteSegments) {
                        return null;
                    }
                    return (
                        <Polyline positions={(geometry.coordinates as Position[]).map(turfToLatLng)} key={index}>
                            {debugLabel && <Popup>{debugLabel}</Popup>}
                        </Polyline>
                    );
                }
                console.error("unknown geometry type" + geometry.type);
            })}
        </>
    );
}
