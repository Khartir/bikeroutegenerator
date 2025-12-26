import { Feature, Point, polygon, Polygon, Position } from "@turf/helpers";
import circle from "@turf/circle";
import ellipse from "@turf/ellipse";
import destination from "@turf/destination";
import { debugCollectors, DebugCollectors, log } from "./debug";
import { snapPolygonToRoad } from "./overpass";
import { equalPos, findMinDistancePosIndex } from "./distance";
import { Profile } from "../routeAPI";
import { getWaypoints } from "./brouter";
import { GenerationStep, RouteShape } from "../../route/routeSlice";

export async function makeRandomRoute({
    startPoint,
    length,
    ccw = false,
    profile,
    steps = 5,
    shape = "circle",
    debug = debugCollectors,
    setStep,
    waitForNextStep = () => Promise.resolve(),
    setCenterPoint,
    getCenterPoint,
    getPolygonVertices,
    setPolygonVertices,
}: {
    startPoint: Feature<Point>;
    length: number;
    ccw?: boolean;
    profile: Profile;
    steps?: number;
    shape?: RouteShape;
    debug: DebugCollectors;
    setStep: (step: GenerationStep) => void;
    waitForNextStep?: () => Promise<void>;
    setCenterPoint?: (center: Position) => void;
    getCenterPoint?: () => Position | null;
    getPolygonVertices?: () => Position[];
    setPolygonVertices?: (vertices: Position[]) => void;
}) {
    // Empirischer Korrekturfaktor um Routing-Overhead auszugleichen
    // (Road-Snapping, BRouter-Umwege, Dead-End-Fixes führen zu ~25% längeren Routen)
    const routingCorrectionFactor = 0.75;
    const radius = (length * routingCorrectionFactor) / Math.PI / 2;
    log("going w/ radius", radius);

    // Step 1: Find center position
    setStep("finding_center");
    let center = findRandomCenterPos(startPoint, radius, debug);

    // Allow user to move the center point
    if (setCenterPoint) {
        setCenterPoint(center);
    }
    await waitForNextStep();

    // Check if user moved the center point
    if (getCenterPoint) {
        const userCenter = getCenterPoint();
        if (userCenter) {
            center = userCenter;
        }
    }

    // Step 2: Create polygon, snap vertices to roads, then allow user to adjust
    setStep("creating_polygon");
    const poly1 = findRandomCheckpointPolygon(center, radius, steps, startPoint, shape, debug);

    // Auto-snap all vertices to roads before user interaction
    if (setPolygonVertices) {
        const snappedPoly = await snapPolygonToRoad(startPoint, poly1, profile);
        // Update the c2 polygon coordinates with snapped positions
        const snappedCoords = snappedPoly.geometry.coordinates[0] as Position[];
        setPolygonVertices(snappedCoords.slice(0, -1)); // Remove closing vertex
    }

    await waitForNextStep();

    // Get the user-modified polygon vertices (already snapped to roads by UI)
    let poly2: Feature<Polygon>;
    if (getPolygonVertices) {
        const vertices = getPolygonVertices();
        if (vertices.length > 0) {
            // Close the polygon by adding first vertex at the end
            const closedVertices = [...vertices, vertices[0]];
            poly2 = polygon([closedVertices], {
                "fill-opacity": 0,
                stroke: "#aa0",
                "stroke-width": 4,
                debugLabel: "snappedToRoad",
            });
        } else {
            // Fallback: snap polygon to roads if no vertices from UI
            poly2 = await snapPolygonToRoad(startPoint, poly1, profile);
        }
    } else {
        // Non-interactive mode: snap polygon to roads automatically
        poly2 = await snapPolygonToRoad(startPoint, poly1, profile);
    }

    // Step 3: Find waypoints (user can move them after this step)
    setStep("finding_waypoints");
    const waypoints = await getWaypoints(startPoint, poly2, ccw, profile, debug);
    // Note: waitForNextStep will be called in routeSlice after waypoints are set
    // This allows user to see and modify waypoints before final route calculation

    return waypoints;
}

function findRandomCheckpointPolygon(
    center: Position,
    radius: number,
    steps: number,
    startPoint: Feature<Point>,
    shape: RouteShape,
    { addDebugFeature }: DebugCollectors
): Feature<Polygon> {
    let c2Shape: Feature<Polygon>;

    switch (shape) {
        case "ellipse":
            c2Shape = createEllipse(center, radius, steps);
            break;
        case "triangle_tip":
            c2Shape = createEquilateralTriangle(center, radius);
            break;
        case "circle":
        default:
            c2Shape = circle(center, radius, { steps });
            break;
    }

    // Create a mutable copy of the coordinates
    const coords = [...c2Shape.geometry.coordinates[0]];
    const minDistanceIndex = findMinDistancePosIndex(startPoint, coords);

    // Replace closest point with start point
    coords[minDistanceIndex] = startPoint.geometry.coordinates;
    if (minDistanceIndex === 0) {
        coords[coords.length - 1] = startPoint.geometry.coordinates;
    }

    // Rotate so start point is at index 0
    while (!equalPos(coords[0], startPoint.geometry.coordinates)) {
        coords.pop(); // Remove closing vertex
        const p = coords.shift()!; // Remove first and save
        coords.push(p); // Add to end
        coords.push(coords[0]); // Re-close polygon
    }

    // Create new polygon with mutable coordinates
    const c2 = polygon([coords], { debugLabel: "c2" });

    addDebugFeature(c2);
    return c2;
}

function createEllipse(center: Position, radius: number, steps: number): Feature<Polygon> {
    // Generate random axis ratio between 0.5 and 0.9 (how much shorter the minor axis is)
    const axisRatio = 0.5 + Math.random() * 0.4;

    // Ellipsen-Umfang-Korrektur mit Ramanujan-Approximation
    // Verhältnis Ellipse-Umfang zu Kreis-Umfang für normalisierte Achsen (a=1/sqrt(k), b=sqrt(k))
    const normA = 1 / Math.sqrt(axisRatio);
    const normB = Math.sqrt(axisRatio);
    const ellipseToCircleRatio = (3 * (normA + normB) - Math.sqrt((3 * normA + normB) * (normA + 3 * normB))) / 2;

    // Radius skalieren damit Ellipse gleichen Umfang wie Kreis hat
    const scaledRadius = radius / ellipseToCircleRatio;

    const semiMajor = scaledRadius / Math.sqrt(axisRatio);
    const semiMinor = scaledRadius * Math.sqrt(axisRatio);

    // Random rotation angle for the ellipse
    const rotation = Math.random() * 360;
    log(
        `creating ellipse axisRatio=${axisRatio.toFixed(2)}, semiMajor=${semiMajor.toFixed(
            1
        )}km, semiMinor=${semiMinor.toFixed(1)}km, rotation=${rotation.toFixed(0)}°`
    );

    return ellipse(center, semiMajor, semiMinor, { steps, angle: rotation });
}

function createEquilateralTriangle(center: Position, targetRadius: number): Feature<Polygon> {
    // Equilateral triangle: perimeter = 3 * side = 3 * r * sqrt(3) where r is circumradius
    // Match circle perimeter: 3 * circumradius * sqrt(3) = 2 * PI * targetRadius
    // circumradius = (2 * PI * targetRadius) / (3 * sqrt(3))
    const circumradius = (2 * Math.PI * targetRadius) / (3 * Math.sqrt(3));
    const rotation = Math.random() * 360;

    const vertices: Position[] = [];
    for (let i = 0; i < 3; i++) {
        const angle = rotation + i * 120;
        const vertex = destination(center, circumradius, angle);
        vertices.push(vertex.geometry.coordinates);
    }
    vertices.push(vertices[0]); // Close polygon

    log(`creating triangle (tip start) circumradius=${circumradius.toFixed(2)}km, rotation=${rotation.toFixed(0)}°`);
    return polygon([vertices]);
}

function findRandomCenterPos(
    startPoint: Feature<Point>,
    radius: number,
    { addDebugFeature }: DebugCollectors
): Position {
    const c1 = circle(startPoint, radius, { steps: 180, properties: { "fill-opacity": 0.1, debugLabel: "c1" } });
    startPoint.properties || (startPoint.properties = {});
    startPoint.properties.debugLabel = "startPoint";
    addDebugFeature(startPoint);
    addDebugFeature(c1);

    const center = c1.geometry.coordinates[0][Math.floor(Math.random() * c1.geometry.coordinates[0].length)];
    log("chosen random center", center);

    return center;
}
