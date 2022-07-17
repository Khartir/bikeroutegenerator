import { configureStore } from "@reduxjs/toolkit";
import startPointReducer from "./startPoint";
import routeReducer from "./route";
import lengthReducer from "./length";

export const store = configureStore({
    reducer: {
        startPoint: startPointReducer,
        route: routeReducer,
        length: lengthReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
