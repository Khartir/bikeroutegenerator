import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Feature, LineString, Position } from "@turf/helpers";
import { LatLng, LatLngBounds, FeatureGroup, Polyline } from "leaflet";
import { turfToLatLng } from "../leaflet/leafletHelpers";
import { getWaypoints, GetRouteArgs, Profile, makeRoute } from "../routing/routeAPI";
import { AppDispatch, RootState } from "../state/store";

export const fetchWayPointsAndRoute = createAsyncThunk(
    "route/newWayPoints",
    async (args: GetRouteArgs, { dispatch }) => {
        const wayPoints = await getWaypoints(args, dispatch as AppDispatch);
        const route = await makeRoute(wayPoints, args.profile, dispatch as AppDispatch);

        let elevation = 0;
        let distance = 0;
        const featureGroup = new FeatureGroup();

        route.forEach((segment) => {
            elevation += parseInt(segment.properties?.["filtered ascend"] ?? 0);
            distance += parseInt(segment.properties?.["track-length"]);
            featureGroup.addLayer(new Polyline(segment.geometry.coordinates.map(turfToLatLng)));
        });

        const bounds = featureGroup.getBounds();

        return {
            wayPoints,
            route,
            elevation,
            distance,
            bounds: {
                southWest: { ...bounds.getSouthWest() },
                northEast: { ...bounds.getNorthEast() },
            },
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
    debugFeatures: Feature[];
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

const initialState: RouteState = {
    loading: "idle",
    options: {
        length: 50,
        profile: "",
        open: true,
    },
    ...noRoute,
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
            return { ...state, ...noRoute, startPoint };
        },
        setStartPoint: (state, { payload }: PayloadAction<PseudoLatLng>) => {
            state.startPoint = payload;
            if (!state.options.length || !state.options.profile) {
                state.options.open = true;
            }
        },
        gpxParsed: (state, { payload }: PayloadAction<GPXData>) => {
            return { ...state, ...payload };
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
        moveWayPoint: (
            state,
            { payload: { index, position } }: PayloadAction<{ index: number; position: Position }>
        ) => {
            state.wayPoints[index] = position;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchWayPointsAndRoute.fulfilled, (state, { payload }) => {
            return { ...state, ...payload };
        });
        builder.addCase(fetchWayPointsAndRoute.rejected, (state, action) => {
            console.log(action.error);
        });
    },
});

export const {
    resetRoute,
    setStartPoint,
    gpxParsed,
    setDesiredLength,
    setProfile,
    toggleOptions,
    addDebugFeature,
    moveWayPoint,
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

export const selectDebugFeatures = ({ route: { debugFeatures } }: RootState) => debugFeatures;

export default routeSlice.reducer;

function denormalizeLatLng({ lat, lng, alt }: PseudoLatLng) {
    return new LatLng(lat, lng, alt);
}
