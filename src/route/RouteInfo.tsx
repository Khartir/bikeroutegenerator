import styled from "@emotion/styled";
import { Grid, Typography } from "@mui/material";
import { messages } from "../localization/localization";
import { useAppSelector } from "../state/hooks";
import { selectInfo } from "./position/boundsSlice";

const Item = styled(Grid)({
    textAlign: "center",
});

const Wrapper = styled(Grid)({
    height: "3em",
});

export function RouteInfo() {
    const { distance, elevation } = useAppSelector(selectInfo);
    return (
        <Wrapper spacing={2} container alignItems="center" justifyItems="center">
            <Item item xs={6}>
                <Typography>
                    {messages.routeInfo.distance}: {(distance / 1000).toFixed(2)} km
                </Typography>
            </Item>
            <Item item xs={6}>
                <Typography>
                    {" "}
                    {messages.routeInfo.elevation}: {elevation.toFixed(2)} m
                </Typography>
            </Item>
        </Wrapper>
    );
}

export const localization = {
    en: {
        distance: "Distance",
        elevation: "Elevation",
    },
    de: {
        distance: "Länge",
        elevation: "Höhenmeter",
    },
};
