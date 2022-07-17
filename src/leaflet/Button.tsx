import { MouseEvent } from "react";
import { useRegisterWithLeaflet } from "./leafletHelpers";

export function Button({ label, onClick }: { label: string; onClick: (e: MouseEvent) => void }) {
    const disableRef = useRegisterWithLeaflet();
    return (
        <button onClick={onClick} ref={disableRef}>
            {label}
        </button>
    );
}
