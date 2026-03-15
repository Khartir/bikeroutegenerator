import { Box, Grid, Typography, styled } from "@mui/material";
import { messages } from "../localization/localization";
import { useAppSelector } from "../state/hooks";
import { selectProfileRoutes, selectProfiles } from "./routeSlice";
import { profiles } from "../routing/routeAPI";
import { profileColors } from "./profileColors";

const Wrapper = styled(Grid)({
    minHeight: "3em",
});

export function RouteInfo() {
    const profileRoutes = useAppSelector(selectProfileRoutes);
    const selectedProfiles = useAppSelector(selectProfiles);
    const entries = selectedProfiles
        .filter((p) => profileRoutes[p])
        .map((p) => ({ profile: p, ...profileRoutes[p] }));

    if (entries.length === 0) return null;

    if (entries.length === 1) {
        const { distance, elevation } = entries[0];
        return (
            <Wrapper spacing={2} container alignItems="center" justifyItems="center">
                <Grid item xs={6} sx={{ textAlign: "center" }}>
                    <Typography>
                        {messages.routeInfo.distance}: {(distance / 1000).toFixed(2)} km
                    </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: "center" }}>
                    <Typography>
                        {messages.routeInfo.elevation}: {elevation.toFixed(2)} m
                    </Typography>
                </Grid>
            </Wrapper>
        );
    }

    return (
        <Box sx={{ px: 1 }}>
            {entries.map(({ profile, distance, elevation }) => (
                <Box key={profile} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.25 }}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: profileColors[profile] ?? "#3388ff",
                            flexShrink: 0,
                        }}
                    />
                    <Typography variant="body2">
                        {profiles[profile]?.label}: {(distance / 1000).toFixed(2)} km / {elevation.toFixed(0)} m
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

export const localization = {
    en: {
        distance: "Distance",
        elevation: "Elevation",
    },
    de: {
        distance: "Länge",
        elevation: "Höhenmeter",
    },
};
