import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LatLngTuple } from "leaflet";
import { RootState } from "../state/store";

interface MapState {
    center: LatLngTuple;
    zoom: number;
}

export const initialState: MapState = {
    center: [49.78798721874146, 9.968176237899439],
    zoom: 13,
};

const mapSlice = createSlice({
    name: "map",
    initialState,
    reducers: {
        moveCenter: (state, { payload }: PayloadAction<LatLngTuple>) => {
            state.center = payload;
        },
        changeZoom: (state, { payload }: PayloadAction<MapState>) => {
            return payload;
        },
    },
});

export const { moveCenter, changeZoom } = mapSlice.actions;

export const selectCenter = (state: RootState) => state.map.center;
export const selectZoom = (state: RootState) => state.map.zoom;

export default mapSlice.reducer;
