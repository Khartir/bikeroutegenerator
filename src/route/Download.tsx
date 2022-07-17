import { useAppSelector } from "../state/hooks";
import { selectRoute } from "./calculateRoute/routeSlice";
import { Button } from "../leaflet/Button";

export const Download = () => {
    const route = useAppSelector(selectRoute);
    if (!route) {
        return null;
    }
    return <Button label="Download" onClick={() => downloadRoute(route)} />;
};

const downloadRoute = (gpxData: string) => {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(gpxData));
    element.setAttribute("download", "route.gpx");

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};
