import { MouseEvent, useCallback } from "react";
import L from "leaflet";

export function Button({ label, onClick }: { label: string; onClick: (e: MouseEvent) => void }) {
    const disableRef = useCallback((node: HTMLButtonElement | null) => {
        if (node) {
            L.DomEvent.disableClickPropagation(node);
        }
    }, []);
    return (
        <button onClick={onClick} ref={disableRef}>
            {label}
        </button>
    );
}
