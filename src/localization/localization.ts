import LocalizedStrings from "react-localization";
import startPoint from "../route/startPoint/localization";
import calculateRoute from "../route/calculateRoute/localization";
import download from "../route/download/localization";
import length from "../route/length/localization";

const m = {
    en: {
        download: download.en,
        calculateRoute: calculateRoute.en,
        startPoint: startPoint.en,
        length: length.en,
    },
    de: {
        download: download.de,
        calculateRoute: calculateRoute.de,
        startPoint: startPoint.de,
        length: length.de,
    },
};

export const messages = new LocalizedStrings(m);
