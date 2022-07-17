import LocalizedStrings from "react-localization";
import startPoint from "../route/startPoint/localization";
import calculateRoute from "../route/calculateRoute/localization";
import download from "../route/download/localization";

const m = {
    en: {
        download: download.en,
        calculateRoute: calculateRoute.en,
        startPoint: startPoint.en,
    },
    de: {
        download: download.de,
        calculateRoute: calculateRoute.de,
        startPoint: startPoint.de,
    },
};

export const messages = new LocalizedStrings(m);
