import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { LatLng, LatLngBounds, LatLngBoundsExpression } from "leaflet";
import { RootState } from "../../state/store";
import { PseudoLatLng } from "../startPoint/startPointSlice";

interface PseudoLatLngBounds {
    southWest: PseudoLatLng;
    northEast: PseudoLatLng;
}

interface State {
    value: PseudoLatLngBounds | null;
}

const initialState: State = {
    value: null,
};

const boundsSlice = createSlice({
    name: "bounds",
    initialState,
    reducers: {
        setBounds: (state, action: PayloadAction<PseudoLatLngBounds>) => {
            state.value = action.payload;
        },
    },
});

export const { setBounds } = boundsSlice.actions;

export const selectBounds = (state: RootState) =>
    state.bounds.value
        ? new LatLngBounds(
              new LatLng(
                  state.bounds.value.southWest.lat,
                  state.bounds.value.southWest.lng,
                  state.bounds.value.southWest.alt
              ),
              new LatLng(
                  state.bounds.value.northEast.lat,
                  state.bounds.value.northEast.lng,
                  state.bounds.value.northEast.alt
              )
          )
        : null;

export default boundsSlice.reducer;
