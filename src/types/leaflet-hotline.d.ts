declare module "leaflet-hotline" {
    import type L, { LatLng, Layer, Polyline } from "leaflet";
    interface Hotline extends Polyline {
        constructor(lines: LatLng[], options: { min?: number; max?: number });
    }
    interface Leaflet extends L {
        Hotline: Hotline;
        hotline: (lines: LatLng[], options: { min?: number; max?: number }) => Hotline;
    }

    export default function (leaflet: L): Leaflet;
}
