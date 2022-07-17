import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRoute } from "../routing/routeAPI";
import { RootState } from "./store";

export const fetchRoute = createAsyncThunk("route/newRoute", getRoute);

interface RouteState {
    route: string;
    loading: "idle" | "pending" | "succeeded" | "failed";
}

const initialState = {
    route: "",
    loading: "idle",
} as RouteState;

const routeSlice = createSlice({
    name: "route",
    initialState,
    reducers: {
        resetRoute: (state) => {
            console.log("reset");
            state.route = "";
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchRoute.fulfilled, (state, action) => {
            state.route = action.payload;
        });
    },
});

export const { resetRoute } = routeSlice.actions;

export const selectRoute = (state: RootState) => state.route.route;

export default routeSlice.reducer;
