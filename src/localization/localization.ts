import LocalizedStrings from "react-localization";
import startPoint from "../route/startPoint/localization";
import calculateRoute from "../route/calculateRoute/localization";
import download from "../route/download/localization";
import length from "../route/options/length/localization";
import options from "../route/options/localization";

const m = {
    en: {
        download: download.en,
        calculateRoute: calculateRoute.en,
        startPoint: startPoint.en,
        length: length.en,
        options: options.en,
    },
    de: {
        download: download.de,
        calculateRoute: calculateRoute.de,
        startPoint: startPoint.de,
        length: length.de,
        options: options.de,
    },
};

export const messages = new LocalizedStrings(m);
