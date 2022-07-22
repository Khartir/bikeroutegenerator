import { TextField } from "@mui/material";
import { messages } from "../../../localization/localization";
import { useAppDispatch, useAppSelector } from "../../../state/hooks";
import { selectLength, setLength } from "./lengthSlice";

export const Length = () => {
    const length = useAppSelector(selectLength);
    const dispatch = useAppDispatch();
    return (
        <TextField
            variant="filled"
            fullWidth
            type="number"
            label={messages.length.label}
            value={length}
            size="small"
            onChange={(e) => dispatch(setLength(parseInt(e.target.value)))}
        />
    );
};
