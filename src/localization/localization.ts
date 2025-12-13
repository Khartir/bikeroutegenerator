import LocalizedStrings from "react-localization";
import startPoint from "../route/startPoint/localization";
import calculateRoute from "../route/calculateRoute/localization";
import download from "../route/download/localization";
import length from "../route/options/length/localization";
import profile from "../route/options/profile/localization";
import options from "../route/options/localization";
import position from "../route/position/localization";
import { localization as routeInfo } from "../route/RouteInfo";
import { localization as showElevationMap } from "../route/ShowElevationMap";
import { localization as statusBar } from "../route/StatusBar";

const m = {
    en: {
        download: download.en,
        calculateRoute: calculateRoute.en,
        startPoint: startPoint.en,
        length: length.en,
        options: options.en,
        position: position.en,
        profile: profile.en,
        routeInfo: routeInfo.en,
        actions: {
            close: "close",
        },
        showElevationMap: showElevationMap.en,
        statusBar: statusBar.en,
    },
    de: {
        download: download.de,
        calculateRoute: calculateRoute.de,
        startPoint: startPoint.de,
        length: length.de,
        options: options.de,
        position: position.de,
        profile: profile.de,
        routeInfo: routeInfo.de,
        actions: {
            close: "Schließen",
        },
        showElevationMap: showElevationMap.de,
        statusBar: statusBar.de,
    },
};

export const messages = new LocalizedStrings(m);
