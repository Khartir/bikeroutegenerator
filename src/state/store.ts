import { configureStore } from "@reduxjs/toolkit";
import startPointReducer from "./startPoint";

export const store = configureStore({
    reducer: {
        startPoint: startPointReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
