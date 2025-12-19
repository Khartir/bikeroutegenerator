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
import routeReducer, { initialState, DEFAULT_BROUTER_URL } from "../route/routeSlice";
import mapReducer from "../leaflet/mapSlice";
import createThrottle from "redux-throttle";
import { middleware } from "../route/updateRouteMiddleware";

const migrations = {
    2: (state: PersistedState) => {
        return { _persist: state!._persist, route: initialState };
    },
    3: (state: PersistedState) => {
        // Add stepThroughMode and waitingForNextStep fields
        return {
            ...state,
            _persist: state!._persist,
            route: {
                ...(state as any)?.route,
                stepThroughMode: false,
                waitingForNextStep: false,
            },
        };
    },
    4: (state: PersistedState) => {
        // Remove showIntermediateSteps field (now tied to stepThroughMode)
        const { showIntermediateSteps, ...routeWithoutShowIntermediateSteps } = (state as any)?.route ?? {};
        return {
            ...state,
            _persist: state!._persist,
            route: routeWithoutShowIntermediateSteps,
        };
    },
    5: (state: PersistedState) => {
        // Add brouterUrl to options
        return {
            ...state,
            _persist: state!._persist,
            route: {
                ...(state as any)?.route,
                options: {
                    ...(state as any)?.route?.options,
                    brouterUrl: DEFAULT_BROUTER_URL,
                },
            },
        };
    },
};

const persistConfig = {
    key: "root",
    version: 5,
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
