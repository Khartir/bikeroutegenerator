import { Button } from "../../leaflet/Button";
import MyLocation from "@mui/icons-material/MyLocation";
import { useMapEvents } from "react-leaflet";
import { messages } from "../../localization/localization";

export function CurrentPosition() {
    const map = useMapEvents({
        locationfound(e) {
            map.flyTo(e.latlng, map.getZoom());
        },
    });
    return (
        <Button
            label={messages.position.currentPosition}
            onClick={() => {
                map.locate();
            }}
        >
            <MyLocation />
        </Button>
    );
}
