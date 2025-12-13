import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Feature, LineString, Position } from "@turf/helpers";
import { LatLng, LatLngBounds, FeatureGroup, Polyline } from "leaflet";
import { turfToLatLng } from "../leaflet/leafletHelpers";
import { getWaypoints, GetRouteArgs, Profile, makeRoute, getDebugSetters } from "../routing/routeAPI";
import { AppDispatch, RootState } from "../state/store";

export const fetchWayPointsAndRoute = createAsyncThunk(
    "route/newWayPoints",
    async (args: GetRouteArgs, { dispatch, getState }) => {
        dispatch(clearDebugFeatures());
        const wayPoints = await getWaypoints(args, dispatch as AppDispatch);
        const state = getState() as RootState;
        const debug = getDebugSetters(dispatch as AppDispatch, state.route.showIntermediateSteps);
        dispatch(setGenerationStep("calculating_route"));
        const route = await makeRoute(wayPoints, args.profile, debug);

        dispatch(updateRoute(route));
        dispatch(toggleFitToBounds());
        dispatch(setGenerationStep("done"));

        return {
            wayPoints,
        };
    }
);

export interface PseudoLatLng {
    lat: number;
    lng: number;
    alt?: number | undefined;
}

interface PseudoLatLngBounds {
    southWest: PseudoLatLng;
    northEast: PseudoLatLng;
}

interface GPXData {
    bounds: PseudoLatLngBounds | null;
    distance: number;
    elevation: number;
}

export type GenerationStep = "idle" | "creating_polygon" | "snapping_to_roads" | "calculating_route" | "done";

export type ErrorSource = "overpass" | "brouter" | "app";

export interface RouteError {
    step: GenerationStep;
    source: ErrorSource;
    message: string;
}

interface RouteState extends GPXData {
    route: Feature<LineString>[];
    wayPoints: Position[];
    loading: "idle" | "pending" | "succeeded" | "failed";
    startPoint: PseudoLatLng | null;
    options: {
        length: number;
        profile: Profile | "";
        open: boolean;
    };
    showElevationMap: boolean;
    showIntermediateSteps: boolean;
    debugFeatures: Feature[];
    fitToBounds: boolean;
    generationStep: GenerationStep;
    error: RouteError | null;
}

const noRoute = {
    route: [],
    wayPoints: [],
    startPoint: null,
    bounds: null,
    distance: 0,
    elevation: 0,
    debugFeatures: [],
};

export const initialState: RouteState = {
    loading: "idle",
    options: {
        length: 50,
        profile: "",
        open: true,
    },
    showElevationMap: false,
    showIntermediateSteps: false,
    ...noRoute,
    fitToBounds: false,
    generationStep: "idle",
    error: null,
};

const routeSlice = createSlice({
    name: "route",
    initialState,
    reducers: {
        resetRoute: (state, { payload }: PayloadAction<boolean>) => {
            let { startPoint } = state;
            if (payload) {
                startPoint = null;
            }
            return { ...state, ...noRoute, startPoint, generationStep: "idle" };
        },
        setStartPoint: (state, { payload }: PayloadAction<PseudoLatLng>) => {
            state.startPoint = payload;
            if (!state.options.length || !state.options.profile) {
                state.options.open = true;
            }
        },
        moveStartPoint: {
            reducer(state, { payload }: PayloadAction<PseudoLatLng>) {
                state.startPoint = payload;
                if (!state.options.length || !state.options.profile) {
                    state.options.open = true;
                }
                const lastWaypoint = state.wayPoints.length - 1;
                if (lastWaypoint > 0) {
                    state.wayPoints[0] = [payload.lng, payload.lat];
                    state.wayPoints[lastWaypoint] = [payload.lng, payload.lat];
                }
            },
            prepare(payload) {
                return {
                    payload,
                    meta: {
                        throttle: {
                            time: 300,
                        },
                    },
                };
            },
        },
        setDesiredLength: (state, { payload }: PayloadAction<number>) => {
            state.options.length = payload;
        },
        setProfile: (state, { payload }: PayloadAction<Profile>) => {
            state.options.profile = payload;
        },
        toggleOptions: (state, { payload }: PayloadAction<boolean>) => {
            state.options.open = payload;
        },
        addDebugFeature: (state, { payload }: PayloadAction<Feature>) => {
            state.debugFeatures.push(payload);
        },
        clearDebugFeatures: (state) => {
            state.debugFeatures = [];
        },
        moveWayPoint: {
            reducer(state, { payload: { index, position } }: PayloadAction<{ index: number; position: Position }>) {
                state.wayPoints[index] = position;
            },
            prepare(payload) {
                return {
                    payload,
                    meta: {
                        throttle: {
                            time: 300,
                        },
                    },
                };
            },
        },
        updateRoute: (state, { payload }: PayloadAction<Feature<LineString>[]>) => {
            let elevation = 0;
            let distance = 0;
            const featureGroup = new FeatureGroup();

            payload.forEach((segment) => {
                elevation += parseInt(segment.properties?.["filtered ascend"] ?? 0);
                distance += parseInt(segment.properties?.["track-length"]);
                featureGroup.addLayer(new Polyline(segment.geometry.coordinates.map(turfToLatLng)));
            });

            const bounds = featureGroup.getBounds();
            return {
                ...state,
                elevation,
                distance,
                bounds: {
                    southWest: { ...bounds.getSouthWest() },
                    northEast: { ...bounds.getNorthEast() },
                },
                route: payload,
            };
        },
        toggleShowElevationMap: (state) => {
            state.showElevationMap = !state.showElevationMap;
        },
        toggleFitToBounds: (state) => {
            state.fitToBounds = !state.fitToBounds;
        },
        toggleShowIntermediateSteps: (state) => {
            state.showIntermediateSteps = !state.showIntermediateSteps;
        },
        setGenerationStep: (state, { payload }: PayloadAction<GenerationStep>) => {
            state.generationStep = payload;
        },
        setError: (state, { payload }: PayloadAction<RouteError | null>) => {
            state.error = payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchWayPointsAndRoute.fulfilled, (state, { payload }) => {
            return { ...state, ...payload, error: null };
        });
        builder.addCase(fetchWayPointsAndRoute.rejected, (state, action) => {
            const currentStep = state.generationStep;
            state.generationStep = "idle";

            // Parse error source from error message if available
            let source: ErrorSource = "app";
            const errorMessage = action.error.message || "An error occurred while generating the route";
            const lowerMessage = errorMessage.toLowerCase();

            if (lowerMessage.includes("overpass")) {
                source = "overpass";
            } else if (
                lowerMessage.includes("brouter") ||
                lowerMessage.includes("java.lang") ||
                currentStep === "calculating_route"
            ) {
                source = "brouter";
            } else if (currentStep === "snapping_to_roads") {
                source = "overpass";
            }

            state.error = {
                step: currentStep,
                source,
                message: errorMessage,
            };
            console.error("Route generation failed:", action.error);
        });
    },
});

export const {
    resetRoute,
    setStartPoint,
    setDesiredLength,
    setProfile,
    toggleOptions,
    addDebugFeature,
    clearDebugFeatures,
    moveWayPoint,
    moveStartPoint,
    updateRoute,
    toggleShowElevationMap,
    toggleFitToBounds,
    toggleShowIntermediateSteps,
    setGenerationStep,
    setError,
    clearError,
} = routeSlice.actions;

export const selectRoute = (state: RootState) => state.route.route;
export const selectWayPoints = (state: RootState) => state.route.wayPoints;

export const selectStartPoint = ({ route: { startPoint } }: RootState) =>
    startPoint ? denormalizeLatLng(startPoint) : null;

export const selectBounds = ({ route: { bounds } }: RootState) =>
    bounds ? new LatLngBounds(denormalizeLatLng(bounds.southWest), denormalizeLatLng(bounds.northEast)) : null;

export const selectInfo = ({ route: { distance, elevation } }: RootState) => {
    return { distance, elevation };
};

export const selectDesiredLength = (state: RootState) => state.route.options.length;
export const selectProfile = (state: RootState) => state.route.options.profile;
export const selectOptionsState = (state: RootState) => state.route.options.open;
export const selectShowElevationMap = (state: RootState) => state.route.showElevationMap;
export const selectFitToBounds = (state: RootState) => state.route.fitToBounds;

export const selectDebugFeatures = ({ route: { debugFeatures } }: RootState) => debugFeatures;
export const selectShowIntermediateSteps = (state: RootState) => state.route.showIntermediateSteps;
export const selectGenerationStep = (state: RootState) => state.route.generationStep;
export const selectError = (state: RootState) => state.route.error;

export default routeSlice.reducer;

function denormalizeLatLng({ lat, lng, alt }: PseudoLatLng) {
    return new LatLng(lat, lng, alt);
}
