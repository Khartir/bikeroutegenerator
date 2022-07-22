import { MouseEvent, ReactNode } from "react";
import { useRegisterWithLeaflet } from "./leafletHelpers";
import UiButton from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

export function Button({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: (e: MouseEvent) => void;
    children?: ReactNode;
}) {
    const disableRef = useRegisterWithLeaflet();
    return (
        <>
            {/* <UiButton
                sx={{ display: { xs: "none", xl: "inline-flex" } }}
                variant="outlined"
                onClick={onClick}
                ref={disableRef}
                fullWidth
                startIcon={children}
            >
                {label}
            </UiButton> */}
            <IconButton onClick={onClick} ref={disableRef} aria-labeledby={label}>
                {children}
            </IconButton>
        </>
    );
}
