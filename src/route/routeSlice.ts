import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LatLng, LatLngBounds } from "leaflet";
import { getRoute, Profile } from "../routing/routeAPI";
import { RootState } from "../state/store";

export const fetchRoute = createAsyncThunk("route/newRoute", getRoute);

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
}

const noRoute = {
    route: "",
    startPoint: null,
    bounds: null,
    distance: 0,
    elevation: 0,
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
    },
    extraReducers: (builder) => {
        builder.addCase(fetchRoute.fulfilled, (state, action) => {
            state.route = action.payload;
        });
    },
});

export const { resetRoute, setStartPoint, gpxParsed, setDesiredLength, setProfile, toggleOptions } = routeSlice.actions;

export const selectRoute = (state: RootState) => state.route.route;

export const selectStartPoint = ({ route: { startPoint } }: RootState) =>
    startPoint ? new LatLng(startPoint.lat, startPoint.lng, startPoint.alt) : null;

export const selectBounds = ({ route: { bounds } }: RootState) =>
    bounds
        ? new LatLngBounds(
              new LatLng(bounds.southWest.lat, bounds.southWest.lng, bounds.southWest.alt),
              new LatLng(bounds.northEast.lat, bounds.northEast.lng, bounds.northEast.alt)
          )
        : null;

export const selectInfo = ({ route: { distance, elevation } }: RootState) => {
    return { distance, elevation };
};

export const selectDesiredLength = (state: RootState) => state.route.options.length;
export const selectProfile = (state: RootState) => state.route.options.profile;
export const selectOptionsState = (state: RootState) => state.route.options.open;

export default routeSlice.reducer;
