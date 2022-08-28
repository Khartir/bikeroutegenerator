import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
    persistReducer,
    createMigrate,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    PersistedState,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import routeReducer, { initialState } from "../route/routeSlice";
import mapReducer from "../leaflet/mapSlice";
//@ts-ignore
import createThrottle from "redux-throttle";
import { middleware } from "../route/updateRouteMiddleware";

const migrations = {
    2: (state: PersistedState) => {
        return { _persist: state!._persist, route: initialState };
    },
};

const persistConfig = {
    key: "root",
    version: 2,
    storage,
    migrate: createMigrate(migrations, { debug: false }),
};

const rootReducer = combineReducers({
    route: routeReducer,
    map: mapReducer,
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
