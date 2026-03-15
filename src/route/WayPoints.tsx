import { DivIcon, LeafletMouseEvent } from "leaflet";
import { Marker } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import {
    moveWayPoint,
    moveProfileWayPoint,
    selectProfileRoutes,
    selectProfiles,
    selectShowElevationMap,
    selectWayPoints,
} from "./routeSlice";
import { turfToLatLng } from "../leaflet/leafletHelpers";
import { profileColors } from "./profileColors";
import { useMemo } from "react";

function createColoredIcon(color: string) {
    return new DivIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

export function WayPoints() {
    const topLevelWayPoints = useAppSelector(selectWayPoints);
    const profileRoutes = useAppSelector(selectProfileRoutes);
    const selectedProfiles = useAppSelector(selectProfiles);
    const showWayPoints = !useAppSelector(selectShowElevationMap);
    const dispatch = useAppDispatch();

    const coloredIcons = useMemo(
        () => Object.fromEntries(Object.entries(profileColors).map(([k, v]) => [k, createColoredIcon(v)])),
        []
    );

    if (!showWayPoints) return null;

    const hasMultipleProfiles = selectedProfiles.filter((p) => profileRoutes[p]).length > 1;

    if (!hasMultipleProfiles) {
        // Single profile: draggable markers (original behavior)
        const lastIndex = topLevelWayPoints.length - 1;
        if (lastIndex <= 0) return null;

        return (
            <>
                {topLevelWayPoints.map((wayPoint, index) => {
                    if (index === 0 || index === lastIndex) return null;
                    return (
                        <Marker
                            position={turfToLatLng(wayPoint)}
                            key={index}
                            draggable
                            eventHandlers={{
                                move: (e) =>
                                    dispatch(
                                        moveWayPoint({
                                            index,
                                            position: [
                                                (e as LeafletMouseEvent).latlng.lng,
                                                (e as LeafletMouseEvent).latlng.lat,
                                            ],
                                        })
                                    ),
                            }}
                        />
                    );
                })}
            </>
        );
    }

    // Multiple profiles: colored draggable markers per profile
    return (
        <>
            {selectedProfiles.map((profile) => {
                const result = profileRoutes[profile];
                if (!result) return null;
                const icon = coloredIcons[profile] ?? createColoredIcon("#3388ff");
                const lastIndex = result.wayPoints.length - 1;
                if (lastIndex <= 0) return null;

                return result.wayPoints.map((wayPoint, index) => {
                    if (index === 0 || index === lastIndex) return null;
                    return (
                        <Marker
                            position={turfToLatLng(wayPoint)}
                            key={`${profile}-${index}`}
                            icon={icon}
                            draggable
                            eventHandlers={{
                                move: (e) =>
                                    dispatch(
                                        moveProfileWayPoint({
                                            profile,
                                            index,
                                            position: [
                                                (e as LeafletMouseEvent).latlng.lng,
                                                (e as LeafletMouseEvent).latlng.lat,
                                            ],
                                        })
                                    ),
                            }}
                        />
                    );
                });
            })}
        </>
    );
}
