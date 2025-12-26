import { RouteShape } from "../routeSlice";

export default {
    en: {
        title: "Options",
        stepThroughMode: "Step-through mode",
        brouterUrl: "BRouter URL",
        shapeSelection: "Route shapes",
        shapes: {
            circle: "Circle",
            ellipse: "Ellipse (random eccentricity)",
            triangle_tip: "Triangle (start at tip)",
        } as Record<RouteShape, string>,
    },
    de: {
        title: "Optionen",
        stepThroughMode: "Schrittweiser Modus",
        brouterUrl: "BRouter URL",
        shapeSelection: "Routenformen",
        shapes: {
            circle: "Kreis",
            ellipse: "Ellipse (zufällige Exzentrizität)",
            triangle_tip: "Dreieck (Start an Spitze)",
        } as Record<RouteShape, string>,
    },
} as const;
