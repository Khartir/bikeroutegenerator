import { MouseEvent, useCallback } from "react";
import L from "leaflet";

export function Button({ label, onClick }: { label: string; onClick: (e: MouseEvent) => void }) {
    const disableRef = useCallback((node: HTMLButtonElement) => {
        L.DomEvent.disableClickPropagation(node);
    }, []);
    return (
        <button
            style={{ position: "absolute", right: "10%", top: "10%", zIndex: 1000 }}
            onClick={onClick}
            ref={disableRef}
        >
            {label}
        </button>
    );
}
