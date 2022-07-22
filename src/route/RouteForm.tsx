import { ButtonGroup } from "@mui/material";
import { CalcRoute } from "./calculateRoute/CalcRoute";
import { Download } from "./download/Download";
import Options from "./options/Options";
import { StartPoint } from "./startPoint/StartPoint";

export function RouteForm() {
    return (
        <ButtonGroup
            orientation="vertical"
            sx={{
                position: "absolute",
                right: "10px",
                top: "10px",
                zIndex: 1000,
                background: "white",
                padding: ".5em",
                borderRadius: "4px",
            }}
        >
            <Options />
            <StartPoint />
            <CalcRoute />
            <Download />
        </ButtonGroup>
    );
}
