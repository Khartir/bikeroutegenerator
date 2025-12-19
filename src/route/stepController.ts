let resolveNextStep: (() => void) | null = null;
let stepThroughEnabled = false;
let dispatchWaiting: ((waiting: boolean) => void) | null = null;

export function configureStepController(
    isEnabled: boolean,
    setWaiting: (waiting: boolean) => void
): void {
    stepThroughEnabled = isEnabled;
    dispatchWaiting = setWaiting;
}

export function waitForNextStep(): Promise<void> {
    if (!stepThroughEnabled) {
        return Promise.resolve();
    }

    if (dispatchWaiting) {
        dispatchWaiting(true);
    }

    return new Promise((resolve) => {
        resolveNextStep = resolve;
    });
}

export function triggerNextStep(): void {
    if (resolveNextStep) {
        resolveNextStep();
        resolveNextStep = null;
    }
}

export function resetStepController(): void {
    resolveNextStep = null;
    stepThroughEnabled = false;
    dispatchWaiting = null;
}
