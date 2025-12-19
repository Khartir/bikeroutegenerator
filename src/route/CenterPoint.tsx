import { LeafletMouseEvent, divIcon, LatLngBounds } from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { moveCenterPoint, selectCenterPoint, selectGenerationStep, selectDebugFeatures, selectStartPoint, selectWayPoints } from "./routeSlice";
import { turfToLatLng } from "../leaflet/leafletHelpers";
import { useEffect, useRef } from "react";
import { Position } from "@turf/helpers";

// Grey teardrop marker icon for non-editable center point (step 2 only)
const greyIcon = divIcon({
    className: "grey-center-marker",
    html: `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 2.4.7 4.6 1.9 6.5L12.5 41l10.6-22c1.2-1.9 1.9-4.1 1.9-6.5C25 5.6 19.4 0 12.5 0z" fill="#888" stroke="#666" stroke-width="1"/>
        <circle cx="12.5" cy="12.5" r="5" fill="#666"/>
    </svg>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export function CenterPoint() {
    const centerPoint = useAppSelector(selectCenterPoint);
    const startPoint = useAppSelector(selectStartPoint);
    const generationStep = useAppSelector(selectGenerationStep);
    const debugFeatures = useAppSelector(selectDebugFeatures);
    const wayPoints = useAppSelector(selectWayPoints);
    const dispatch = useAppDispatch();
    const map = useMap();
    const hasSnappedToCenter = useRef(false);
    const hasSnappedToPolygon = useRef(false);
    const hasSnappedToWaypoints = useRef(false);

    const isEditable = generationStep === "finding_center";
    // Center point visible in step 1 (editable) and step 2 (grey), hidden in step 3+
    const isVisible = centerPoint && (generationStep === "finding_center" || generationStep === "creating_polygon");

    // Snap to show both center point and start point when finding_center step starts
    useEffect(() => {
        if (generationStep === "finding_center" && centerPoint && startPoint && !hasSnappedToCenter.current) {
            const centerLatLng = turfToLatLng(centerPoint);
            const bounds = new LatLngBounds(centerLatLng, centerLatLng);
            bounds.extend(startPoint);
            map.fitBounds(bounds, { padding: [50, 50] });
            hasSnappedToCenter.current = true;
        }
        // Reset snap tracking when generation is idle or done
        if (generationStep === "idle" || generationStep === "done") {
            hasSnappedToCenter.current = false;
            hasSnappedToPolygon.current = false;
            hasSnappedToWaypoints.current = false;
        }
    }, [generationStep, centerPoint, startPoint, map]);

    // Snap to polygon bounds when creating_polygon step starts
    useEffect(() => {
        if (generationStep === "creating_polygon" && !hasSnappedToPolygon.current) {
            // Find the polygon in debug features (c2 polygon)
            const polygon = debugFeatures.find(f => f.geometry.type === "Polygon" && f.properties?.debugLabel === "c2");
            if (polygon && polygon.geometry.type === "Polygon") {
                const coords = polygon.geometry.coordinates[0] as Position[];
                const latLngs = coords.map(turfToLatLng);
                if (latLngs.length > 0) {
                    const bounds = new LatLngBounds(latLngs[0], latLngs[0]);
                    latLngs.forEach(latLng => bounds.extend(latLng));
                    map.fitBounds(bounds, { padding: [20, 20] });
                    hasSnappedToPolygon.current = true;
                }
            }
        }
    }, [generationStep, debugFeatures, map]);

    // Snap to waypoints bounds when finding_waypoints step starts
    useEffect(() => {
        if (generationStep === "finding_waypoints" && wayPoints.length > 0 && !hasSnappedToWaypoints.current) {
            const latLngs = wayPoints.map(turfToLatLng);
            const bounds = new LatLngBounds(latLngs[0], latLngs[0]);
            latLngs.forEach(latLng => bounds.extend(latLng));
            map.fitBounds(bounds, { padding: [30, 30] });
            hasSnappedToWaypoints.current = true;
        }
    }, [generationStep, wayPoints, map]);

    if (!isVisible) {
        return null;
    }

    if (isEditable) {
        return (
            <Marker
                position={turfToLatLng(centerPoint)}
                draggable
                eventHandlers={{
                    move: (e) =>
                        dispatch(
                            moveCenterPoint([
                                (e as LeafletMouseEvent).latlng.lng,
                                (e as LeafletMouseEvent).latlng.lat,
                            ])
                        ),
                }}
            >
                <Popup>center</Popup>
            </Marker>
        );
    }

    // Non-editable grey marker for step 2 (no tooltip)
    return <Marker position={turfToLatLng(centerPoint)} icon={greyIcon} />;
}
