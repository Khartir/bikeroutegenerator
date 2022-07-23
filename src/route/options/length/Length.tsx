import { TextField } from "@mui/material";
import { messages } from "../../../localization/localization";
import { useAppDispatch, useAppSelector } from "../../../state/hooks";
import { selectDesiredLength, setDesiredLength } from "../../routeSlice";

export const Length = () => {
    const length = useAppSelector(selectDesiredLength);
    const dispatch = useAppDispatch();
    return (
        <TextField
            variant="filled"
            fullWidth
            type="number"
            label={messages.length.label}
            value={length}
            size="small"
            onChange={(e) => dispatch(setDesiredLength(parseInt(e.target.value)))}
        />
    );
};
