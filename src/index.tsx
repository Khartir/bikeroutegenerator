import ReactDOM from "react-dom/client";
import { Map } from "./leaflet/Map";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { CssBaseline } from "@mui/material";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { RouteInfo } from "./route/RouteInfo";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
let persistor = persistStore(store);
root.render(
    <>
        <CssBaseline />
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <Map />
                <RouteInfo />
            </PersistGate>
        </Provider>
    </>
);
