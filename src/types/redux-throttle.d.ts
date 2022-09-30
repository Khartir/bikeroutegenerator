declare module "redux-throttle" {
    import type { Middleware } from "redux";
    export default function middleware(defaultWait = 300, defaultThrottleOption = {}): Middleware;
}
