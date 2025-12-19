import { Box, Button, LinearProgress, Typography, styled } from "@mui/material";
import { SkipNext } from "@mui/icons-material";
import { messages } from "../localization/localization";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { advanceStep, selectGenerationStep, selectInfo, selectWaitingForNextStep } from "./routeSlice";
import { triggerNextStep } from "./stepController";

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
    const waitingForNextStep = useAppSelector(selectWaitingForNextStep);
    const dispatch = useAppDispatch();

    const isGenerating = generationStep !== "idle" && generationStep !== "done";
    const stepMessage = isGenerating ? getStepMessage(generationStep) : "";

    const handleNextStep = () => {
        dispatch(advanceStep());
        triggerNextStep();
    };

    return (
        <StatusBarWrapper>
            {isGenerating && !waitingForNextStep && <LinearProgress />}
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
                        {waitingForNextStep && (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<SkipNext />}
                                onClick={handleNextStep}
                            >
                                {messages.statusBar.nextStep}
                            </Button>
                        )}
                    </StepSection>
                )}
            </ContentWrapper>
        </StatusBarWrapper>
    );
}

function getStepMessage(step: string): string {
    switch (step) {
        case "finding_center":
            return messages.statusBar.findingCenter;
        case "creating_polygon":
            return messages.statusBar.creatingPolygon;
        case "snapping_to_roads":
            return messages.statusBar.snappingToRoads;
        case "finding_waypoints":
            return messages.statusBar.findingWaypoints;
        case "calculating_route":
            return messages.statusBar.calculatingRoute;
        default:
            return "";
    }
}

export const localization = {
    en: {
        findingCenter: "Finding center point (drag to adjust)...",
        creatingPolygon: "Creating route shape...",
        snappingToRoads: "Snapping to roads...",
        findingWaypoints: "Finding waypoints (drag to adjust)...",
        calculatingRoute: "Calculating route...",
        nextStep: "Next Step",
    },
    de: {
        findingCenter: "Mittelpunkt finden (ziehen zum Anpassen)...",
        creatingPolygon: "Routenform wird erstellt...",
        snappingToRoads: "An Straßen anpassen...",
        findingWaypoints: "Wegpunkte finden (ziehen zum Anpassen)...",
        calculatingRoute: "Route wird berechnet...",
        nextStep: "Nächster Schritt",
    },
};
