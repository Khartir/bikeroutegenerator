import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import routeReducer from "../route/routeSlice";
//@ts-ignore
import createThrottle from "redux-throttle";
import { middleware } from "../route/updateRouteMiddleware";

const persistConfig = {
    key: "root",
    version: 1,
    storage,
};

const rootReducer = combineReducers({
    route: routeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat([createThrottle(), middleware]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
