import { configureStore } from "@reduxjs/toolkit";
import startPointReducer from "../route/startPoint/startPointSlice";
import routeReducer from "../route/calculateRoute/routeSlice";
import lengthReducer from "../route/options/length/lengthSlice";

export const store = configureStore({
    reducer: {
        startPoint: startPointReducer,
        route: routeReducer,
        length: lengthReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
