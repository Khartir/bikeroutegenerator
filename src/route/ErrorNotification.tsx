import { Alert, Snackbar, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { clearError, selectError, ErrorSource, GenerationStep } from "./routeSlice";
import { messages } from "../localization/localization";

function getStepLabel(step: GenerationStep): string {
    switch (step) {
        case "creating_polygon":
            return messages.error.steps.creatingPolygon;
        case "snapping_to_roads":
            return messages.error.steps.snappingToRoads;
        case "calculating_route":
            return messages.error.steps.calculatingRoute;
        default:
            return messages.error.steps.unknown;
    }
}

function getSourceLabel(source: ErrorSource): string {
    switch (source) {
        case "overpass":
            return messages.error.sources.overpass;
        case "brouter":
            return messages.error.sources.brouter;
        case "app":
            return messages.error.sources.app;
    }
}

export function ErrorNotification() {
    const error = useAppSelector(selectError);
    const dispatch = useAppDispatch();

    const handleClose = () => {
        dispatch(clearError());
    };

    return (
        <Snackbar open={!!error} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
            <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: "100%" }}>
                <Typography variant="body2" fontWeight="bold">
                    {messages.error.routeGenerationFailed}
                </Typography>
                {error && (
                    <>
                        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                            {messages.error.failedDuring}: {getStepLabel(error.step)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {messages.error.source}: {getSourceLabel(error.source)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8, fontStyle: "italic" }}>
                            {error.message}
                        </Typography>
                    </>
                )}
            </Alert>
        </Snackbar>
    );
}

export const localization = {
    en: {
        routeGenerationFailed: "Route generation failed",
        failedDuring: "Failed during",
        source: "Source",
        steps: {
            creatingPolygon: "Creating polygon",
            snappingToRoads: "Snapping to roads",
            calculatingRoute: "Calculating route",
            unknown: "Unknown step",
        },
        sources: {
            overpass: "Overpass API",
            brouter: "BRouter API",
            app: "Application",
        },
    },
    de: {
        routeGenerationFailed: "Routenerstellung fehlgeschlagen",
        failedDuring: "Fehlgeschlagen bei",
        source: "Quelle",
        steps: {
            creatingPolygon: "Polygon erstellen",
            snappingToRoads: "An Straßen ausrichten",
            calculatingRoute: "Route berechnen",
            unknown: "Unbekannter Schritt",
        },
        sources: {
            overpass: "Overpass API",
            brouter: "BRouter API",
            app: "Anwendung",
        },
    },
};
