import { LeafletMouseEvent } from "leaflet";
import { Marker } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { movePolygonVertex, selectPolygonVertices, selectGenerationStep, selectStartPoint, selectProfile } from "./routeSlice";
import { turfToLatLng } from "../leaflet/leafletHelpers";
import { snapPosToRoad } from "../routing/imported/overpass";
import { Profile } from "../routing/routeAPI";
import { Position } from "@turf/helpers";
import { useState } from "react";
import { equalPos } from "../routing/imported/distance";

export function PolygonVertices() {
    const vertices = useAppSelector(selectPolygonVertices);
    const generationStep = useAppSelector(selectGenerationStep);
    const startPoint = useAppSelector(selectStartPoint);
    const profile = useAppSelector(selectProfile);
    const dispatch = useAppDispatch();
    const [snappingIndex, setSnappingIndex] = useState<number | null>(null);

    // Show in step 2 (creating_polygon) - combined step for polygon + vertex editing
    if (generationStep !== "creating_polygon" || vertices.length === 0) {
        return null;
    }

    const handleDragEnd = async (index: number, position: Position) => {
        if (!profile) return;

        setSnappingIndex(index);
        try {
            const snappedPos = await snapPosToRoad(position, profile as Profile);
            dispatch(movePolygonVertex({ index, position: snappedPos }));
        } catch (error) {
            console.error("Failed to snap vertex to road:", error);
            // Keep the current position if snapping fails
        } finally {
            setSnappingIndex(null);
        }
    };

    return (
        <>
            {vertices.map((vertex, index) => {
                // Skip the start point vertex - it's displayed by StartPoint component
                if (startPoint && equalPos(vertex, [startPoint.lng, startPoint.lat])) {
                    return null;
                }
                const vertexLatLng = turfToLatLng(vertex);

                const isSnapping = snappingIndex === index;

                return (
                    <Marker
                        position={vertexLatLng}
                        key={index}
                        draggable={!isSnapping}
                        opacity={isSnapping ? 0.5 : 1}
                        eventHandlers={{
                            move: (e) =>
                                dispatch(
                                    movePolygonVertex({
                                        index,
                                        position: [
                                            (e as LeafletMouseEvent).latlng.lng,
                                            (e as LeafletMouseEvent).latlng.lat,
                                        ],
                                    })
                                ),
                            dragend: (e) => {
                                const latlng = e.target.getLatLng();
                                handleDragEnd(index, [latlng.lng, latlng.lat]);
                            },
                        }}
                    />
                );
            })}
        </>
    );
}
