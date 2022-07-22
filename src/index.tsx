import ReactDOM from "react-dom/client";
import { Map } from "./leaflet/Map";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { CssBaseline } from "@mui/material";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <Provider store={store}>
        <CssBaseline />
        <Map />
    </Provider>
);
