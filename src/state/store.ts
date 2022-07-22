import { configureStore } from "@reduxjs/toolkit";
import startPointReducer from "../route/startPoint/startPointSlice";
import routeReducer from "../route/calculateRoute/routeSlice";
import lengthReducer from "../route/options/length/lengthSlice";
import profileReducer from "../route/options/profile/profileSlice";
import boundsReducer from "../route/position/boundsSlice";

export const store = configureStore({
    reducer: {
        startPoint: startPointReducer,
        route: routeReducer,
        length: lengthReducer,
        bounds: boundsReducer,
        profile: profileReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
