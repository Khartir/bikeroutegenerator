import { Box, ButtonGroup, Stack } from "@mui/material";
import { CalcRoute } from "./calculateRoute/CalcRoute";
import { Download } from "./download/Download";
import { Length } from "./length/Length";
import { StartPoint } from "./startPoint/StartPoint";

export function RouteForm() {
    return (
        <Box
            sx={{
                position: "absolute",
                right: "10px",
                top: "10px",
                zIndex: 1000,
                background: "white",
                display: "block",
                padding: ".5em",
                borderRadius: "4px",
            }}
        >
            <Stack spacing={2}>
                <Length />
                <ButtonGroup variant="outlined" orientation="vertical">
                    <StartPoint />
                    <CalcRoute />
                    <Download />
                </ButtonGroup>
            </Stack>
        </Box>
    );
}
