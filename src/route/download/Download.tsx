import { useAppSelector } from "../../state/hooks";
import { selectRoute } from "../calculateRoute/routeSlice";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import DownloadIcon from "@mui/icons-material/Download";

export const Download = () => {
    const route = useAppSelector(selectRoute);
    if (!route) {
        return null;
    }
    return (
        <Button label={messages.download.label} onClick={() => downloadRoute(route)}>
            <DownloadIcon />
        </Button>
    );
};

const downloadRoute = (gpxData: string) => {
    const file = new File([gpxData], "route.gpx", { type: "application/gpx+xml" });
    const exportUrl = URL.createObjectURL(file);
    const element = document.createElement("a");
    element.setAttribute("href", exportUrl);
    element.setAttribute("download", file.name);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();
    URL.revokeObjectURL(exportUrl);

    document.body.removeChild(element);
};
