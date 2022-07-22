import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { LatLng, LatLngBounds } from "leaflet";
import { RootState } from "../../state/store";
import { PseudoLatLng } from "../startPoint/startPointSlice";

interface PseudoLatLngBounds {
    southWest: PseudoLatLng;
    northEast: PseudoLatLng;
}

interface State {
    bounds: PseudoLatLngBounds | null;
    distance: number;
    elevation: number;
}

const initialState: State = {
    bounds: null,
    distance: 0,
    elevation: 0,
};

// todo: rename
const boundsSlice = createSlice({
    name: "bounds",
    initialState,
    reducers: {
        gpxParsed: (state, action: PayloadAction<State>) => action.payload,
    },
});

export const { gpxParsed } = boundsSlice.actions;

export const selectBounds = (state: RootState) =>
    state.bounds.bounds
        ? new LatLngBounds(
              new LatLng(
                  state.bounds.bounds.southWest.lat,
                  state.bounds.bounds.southWest.lng,
                  state.bounds.bounds.southWest.alt
              ),
              new LatLng(
                  state.bounds.bounds.northEast.lat,
                  state.bounds.bounds.northEast.lng,
                  state.bounds.bounds.northEast.alt
              )
          )
        : null;

export const selectInfo = (state: RootState) => {
    return { distance: state.bounds.distance, elevation: state.bounds.elevation };
};

export default boundsSlice.reducer;
