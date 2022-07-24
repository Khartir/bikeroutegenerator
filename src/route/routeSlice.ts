import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Feature } from "@turf/helpers";
import { LatLng, LatLngBounds } from "leaflet";
import { getRoute, GetRouteArgs, Profile } from "../routing/routeAPI";
import { AppDispatch, RootState } from "../state/store";

export const fetchRoute = createAsyncThunk("route/newRoute", (args: GetRouteArgs, { dispatch }) =>
    getRoute(args, dispatch as AppDispatch)
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
    route: string;
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
    route: "",
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
    },
    extraReducers: (builder) => {
        builder.addCase(fetchRoute.fulfilled, (state, action) => {
            state.route = action.payload;
        });
        builder.addCase(fetchRoute.rejected, (state, action) => {
            console.log(action.error);
        });
    },
});

export const { resetRoute, setStartPoint, gpxParsed, setDesiredLength, setProfile, toggleOptions, addDebugFeature } =
    routeSlice.actions;

export const selectRoute = (state: RootState) => state.route.route;

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
