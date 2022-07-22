import { configureStore } from "@reduxjs/toolkit";
import startPointReducer from "../route/startPoint/startPointSlice";
import routeReducer from "../route/calculateRoute/routeSlice";
import lengthReducer from "../route/options/length/lengthSlice";
import boundsReducer from "../route/position/boundsSlice";

export const store = configureStore({
    reducer: {
        startPoint: startPointReducer,
        route: routeReducer,
        length: lengthReducer,
        bounds: boundsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
