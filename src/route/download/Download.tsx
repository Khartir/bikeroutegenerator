import { useAppSelector } from "../../state/hooks";
import { selectProfileRoutes, selectProfiles } from "../routeSlice";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import { Download as DownloadIcon } from "@mui/icons-material";
import { lineString, Position } from "@turf/helpers";
import { profiles } from "../../routing/routeAPI";
import { profileColors } from "../profileColors";
import togpx from "togpx";

export const Download = () => {
    const profileRoutes = useAppSelector(selectProfileRoutes);
    const selectedProfiles = useAppSelector(selectProfiles);

    const profileOrder = Object.keys(profiles);
    const entries = selectedProfiles
        .filter((p) => profileRoutes[p] && profileRoutes[p].route.length > 0)
        .sort((a, b) => profileOrder.indexOf(a) - profileOrder.indexOf(b));
    if (entries.length === 0) return null;

    if (entries.length === 1) {
        const route = profileRoutes[entries[0]].route;
        const points: Position[] = route.reduce(
            (pts, line) => (line?.geometry ? pts.concat(line.geometry.coordinates) : pts),
            [] as Position[]
        );
        const gpx = togpx(lineString(points));
        return (
            <Button label={messages.download.label} onClick={() => downloadRoute(gpx, "route.gpx")}>
                <DownloadIcon />
            </Button>
        );
    }

    return (
        <>
            {entries.map((profile) => {
                const route = profileRoutes[profile].route;
                const points: Position[] = route.reduce(
                    (pts, line) => (line?.geometry ? pts.concat(line.geometry.coordinates) : pts),
                    [] as Position[]
                );
                const gpx = togpx(lineString(points));
                const label = profiles[profile]?.label ?? profile;
                const color = profileColors[profile];
                return (
                    <Button
                        key={profile}
                        label={`${messages.download.label} (${label})`}
                        onClick={() => downloadRoute(gpx, `route-${profile}.gpx`)}
                    >
                        <DownloadIcon sx={{ color }} />
                    </Button>
                );
            })}
        </>
    );
};

const downloadRoute = (gpxData: string, filename: string) => {
    const file = new File([gpxData], filename, { type: "application/gpx+xml" });
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
