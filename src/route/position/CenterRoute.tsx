import { Button } from "../../leaflet/Button";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import { useMap } from "react-leaflet";
import { useAppSelector } from "../../state/hooks";
import { selectBounds } from "./boundsSlice";
import { messages } from "../../localization/localization";

export function CenterRoute() {
    const map = useMap();
    const bounds = useAppSelector(selectBounds);
    return (
        bounds && (
            <Button
                label={messages.position.centerRoute}
                onClick={() => {
                    map.fitBounds(bounds);
                }}
            >
                <CenterFocusStrongIcon />
            </Button>
        )
    );
}
