import ReactDOM from "react-dom/client";
import { Map } from "./leaflet/Map";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { CssBaseline } from "@mui/material";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { RouteInfo } from "./route/RouteInfo";
import { StrictMode } from "react";

const persistor = persistStore(store);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <CssBaseline />
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <Map />
                <RouteInfo />
            </PersistGate>
        </Provider>
    </StrictMode>
);
