import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface LengthState {
    value: number;
}

const initialState: LengthState = {
    value: 50,
};

const lengthSlice = createSlice({
    name: "startPoint",
    initialState,
    reducers: {
        setLength: (state, action: PayloadAction<number>) => {
            state.value = action.payload;
        },
    },
});

export const { setLength } = lengthSlice.actions;

export const selectLength = (state: RootState) => state.length.value;

export default lengthSlice.reducer;
