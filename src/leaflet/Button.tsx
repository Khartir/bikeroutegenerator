import { MouseEvent } from "react";
import { useRegisterWithLeaflet } from "./leafletHelpers";
import UiButton from "@mui/material/Button";

export function Button({ label, onClick }: { label: string; onClick: (e: MouseEvent) => void }) {
    const disableRef = useRegisterWithLeaflet();
    return (
        <UiButton onClick={onClick} ref={disableRef}>
            {label}
        </UiButton>
    );
}
