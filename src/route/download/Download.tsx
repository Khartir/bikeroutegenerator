import { useAppSelector } from "../../state/hooks";
import { selectRoute } from "../routeSlice";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import DownloadIcon from "@mui/icons-material/Download";
import { lineString, Position } from "@turf/helpers";
//@ts-ignore
import togpx from "togpx";

export const Download = () => {
    const route = useAppSelector(selectRoute);
    if (!route || route.length === 0) {
        return null;
    }
    const points: Position[] = route.reduce(
        (points, line) => points.concat(line.geometry.coordinates),
        [] as Position[]
    );
    const gpx = togpx(lineString(points));
    return (
        <Button label={messages.download.label} onClick={() => downloadRoute(gpx)}>
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
