import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { LatLng, LatLngBoundsExpression } from "leaflet";
import { RootState } from "../../state/store";

interface State {
    value: LatLngBoundsExpression | null;
}

const initialState: State = {
    value: null,
};

const boundsSlice = createSlice({
    name: "bounds",
    initialState,
    reducers: {
        setBounds: (state, action: PayloadAction<LatLngBoundsExpression>) => {
            state.value = action.payload;
        },
    },
});

export const { setBounds } = boundsSlice.actions;

export const selectBounds = (state: RootState) => state.bounds.value;

export default boundsSlice.reducer;
