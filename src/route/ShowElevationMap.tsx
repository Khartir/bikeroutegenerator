import Layers from "@mui/icons-material/Layers";
import { Button } from "../leaflet/Button";
import { messages } from "../localization/localization";
import { useAppDispatch } from "../state/hooks";
import { toggleShowElevationMap } from "./routeSlice";

export function ShowElevationMap() {
    const dispatch = useAppDispatch();
    return (
        <Button label={messages.showElevationMap.label} onClick={() => dispatch(toggleShowElevationMap())}>
            <Layers />
        </Button>
    );
}

export const localization = {
    en: {
        label: "Show elevation",
    },
    de: {
        label: "Höhe anzeigen",
    },
};
