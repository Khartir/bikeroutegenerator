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
import routeReducer, { initialState, DEFAULT_BROUTER_URL, DEFAULT_OVERPASS_URL } from "../route/routeSlice";
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
    6: (state: PersistedState) => {
        // Add useEllipse to options
        return {
            ...state,
            _persist: state!._persist,
            route: {
                ...(state as any)?.route,
                options: {
                    ...(state as any)?.route?.options,
                    useEllipse: false,
                },
            },
        };
    },
    7: (state: PersistedState) => {
        // Migrate from useEllipse boolean to enabledShapes array
        const useEllipse = (state as any)?.route?.options?.useEllipse ?? false;
        const { useEllipse: _, ...optionsRest } = (state as any)?.route?.options ?? {};
        return {
            ...state,
            _persist: state!._persist,
            route: {
                ...(state as any)?.route,
                options: {
                    ...optionsRest,
                    enabledShapes: useEllipse ? ["circle", "ellipse"] : ["circle"],
                },
            },
        };
    },
    8: (state: PersistedState) => {
        // Remove triangle_base from enabledShapes (feature removed)
        const enabledShapes = (state as any)?.route?.options?.enabledShapes ?? ["circle"];
        const filteredShapes = enabledShapes.filter((s: string) => s !== "triangle_base");
        return {
            ...state,
            _persist: state!._persist,
            route: {
                ...(state as any)?.route,
                options: {
                    ...(state as any)?.route?.options,
                    enabledShapes: filteredShapes.length > 0 ? filteredShapes : ["circle"],
                },
            },
        };
    },
    9: (state: PersistedState) => {
        // Add overpassUrl to options
        return {
            ...state,
            _persist: state!._persist,
            route: {
                ...(state as any)?.route,
                options: {
                    ...(state as any)?.route?.options,
                    overpassUrl: DEFAULT_OVERPASS_URL,
                },
            },
        };
    },
    10: (state: PersistedState) => {
        // Migrate old profile names to new trike profiles
        const oldProfile = (state as any)?.route?.options?.profile;
        const profileMap: Record<string, string> = {
            trekking: "trike-touring",
            "fastbike-verylowtraffic": "trike-safe",
        };
        const newProfile = profileMap[oldProfile] ?? oldProfile ?? "";
        return {
            ...state,
            _persist: state!._persist,
            route: {
                ...(state as any)?.route,
                options: {
                    ...(state as any)?.route?.options,
                    profile: newProfile,
                },
            },
        };
    },
    11: (state: PersistedState) => {
        // Migrate single profile to profiles array, add profileRoutes
        const oldProfile = (state as any)?.route?.options?.profile ?? "";
        const { profile: _, ...optionsRest } = (state as any)?.route?.options ?? {};
        return {
            ...state,
            _persist: state!._persist,
            route: {
                ...(state as any)?.route,
                profileRoutes: {},
                profileProgress: null,
                options: {
                    ...optionsRest,
                    profiles: oldProfile ? [oldProfile] : [],
                },
            },
        };
    },
};

const persistConfig = {
    key: "root",
    version: 11,
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
