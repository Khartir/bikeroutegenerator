import { MouseEvent, ReactNode } from "react";
import { useRegisterWithLeaflet } from "./leafletHelpers";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

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
            <Tooltip title={label} placement="left">
                <IconButton onClick={onClick} ref={disableRef} aria-labelledby={label}>
                    {children}
                </IconButton>
            </Tooltip>
        </>
    );
}
