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
    };
}

const initialState: RouteState = {
    route: "",
    loading: "idle",
    startPoint: null,
    bounds: null,
    distance: 0,
    elevation: 0,
    options: {
        length: 50,
        profile: "",
    },
};

const routeSlice = createSlice({
    name: "route",
    initialState,
    reducers: {
        resetRoute: (state) => {
            state.route = "";
        },
        setStartPoint: (state, action: PayloadAction<PseudoLatLng>) => {
            state.startPoint = action.payload;
        },
        unsetStartPoint: (state) => {
            state.startPoint = null;
        },
        gpxParsed: (state, action: PayloadAction<GPXData>) => {
            return { ...state, ...action.payload };
        },
        setDesiredLength: (state, action: PayloadAction<number>) => {
            state.options.length = action.payload;
        },
        setProfile: (state, action: PayloadAction<Profile>) => {
            state.options.profile = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchRoute.fulfilled, (state, action) => {
            state.route = action.payload;
        });
    },
});

export const { resetRoute, setStartPoint, unsetStartPoint, gpxParsed, setDesiredLength, setProfile } =
    routeSlice.actions;

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

export default routeSlice.reducer;
