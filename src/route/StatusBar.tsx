import { Box, LinearProgress, Typography, styled } from "@mui/material";
import { messages } from "../localization/localization";
import { useAppSelector } from "../state/hooks";
import { selectGenerationStep, selectInfo } from "./routeSlice";

const StatusBarWrapper = styled(Box)({
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTop: "1px solid #ddd",
    zIndex: 1000,
});

const ContentWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 16px",
    minHeight: "48px",
    flexWrap: "wrap",
    gap: "8px",
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "stretch",
        padding: "8px 12px",
    },
}));

const InfoSection = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: "24px",
    [theme.breakpoints.down("sm")]: {
        justifyContent: "space-between",
        gap: "12px",
    },
}));

const StepSection = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    [theme.breakpoints.down("sm")]: {
        justifyContent: "center",
    },
}));

export function StatusBar() {
    const { distance, elevation } = useAppSelector(selectInfo);
    const generationStep = useAppSelector(selectGenerationStep);

    const isGenerating = generationStep !== "idle" && generationStep !== "done";
    const stepMessage = isGenerating ? getStepMessage(generationStep) : "";

    return (
        <StatusBarWrapper>
            {isGenerating && <LinearProgress />}
            <ContentWrapper>
                <InfoSection>
                    <Typography variant="body2">
                        {messages.routeInfo.distance}: {(distance / 1000).toFixed(2)} km
                    </Typography>
                    <Typography variant="body2">
                        {messages.routeInfo.elevation}: {elevation.toFixed(2)} m
                    </Typography>
                </InfoSection>
                {stepMessage && (
                    <StepSection>
                        <Typography variant="body2" color="primary">
                            {stepMessage}
                        </Typography>
                    </StepSection>
                )}
            </ContentWrapper>
        </StatusBarWrapper>
    );
}

function getStepMessage(step: string): string {
    switch (step) {
        case "creating_polygon":
            return messages.statusBar.creatingPolygon;
        case "snapping_to_roads":
            return messages.statusBar.snappingToRoads;
        case "calculating_route":
            return messages.statusBar.calculatingRoute;
        default:
            return "";
    }
}

export const localization = {
    en: {
        creatingPolygon: "Creating route shape...",
        snappingToRoads: "Snapping to roads...",
        calculatingRoute: "Calculating route...",
    },
    de: {
        creatingPolygon: "Routenform wird erstellt...",
        snappingToRoads: "An Straßen anpassen...",
        calculatingRoute: "Route wird berechnet...",
    },
};
