import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import startPointReducer from "../route/startPoint/startPointSlice";
import routeReducer from "../route/calculateRoute/routeSlice";
import lengthReducer from "../route/options/length/lengthSlice";
import profileReducer from "../route/options/profile/profileSlice";
import boundsReducer from "../route/position/boundsSlice";

const persistConfig = {
    key: "root",
    version: 1,
    storage,
};

const rootReducer = combineReducers({
    startPoint: startPointReducer,
    route: routeReducer,
    length: lengthReducer,
    bounds: boundsReducer,
    profile: profileReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
