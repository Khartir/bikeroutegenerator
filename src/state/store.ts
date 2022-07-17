import { configureStore } from "@reduxjs/toolkit";
import startPointReducer from "./startPoint";
import routeReducer from "./route";

export const store = configureStore({
    reducer: {
        startPoint: startPointReducer,
        route: routeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
