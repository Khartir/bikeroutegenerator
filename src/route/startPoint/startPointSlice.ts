import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { LatLng } from "leaflet";
import { RootState } from "../../state/store";

interface PseudoLatLng {
    lat: number;
    lng: number;
    alt?: number | undefined;
}

interface StartPointState {
    value: PseudoLatLng | null;
}

const initialState: StartPointState = {
    value: null,
};

const startPointSlice = createSlice({
    name: "startPoint",
    initialState,
    reducers: {
        setStartPoint: (state, action: PayloadAction<PseudoLatLng>) => {
            state.value = action.payload;
        },
        unsetStartPoint: (state) => {
            state.value = null;
        },
    },
});

export const { setStartPoint, unsetStartPoint } = startPointSlice.actions;

export const selectStartPoint = (state: RootState) =>
    state.startPoint.value
        ? new LatLng(state.startPoint.value.lat, state.startPoint.value?.lng, state.startPoint.value.alt)
        : null;

export default startPointSlice.reducer;
