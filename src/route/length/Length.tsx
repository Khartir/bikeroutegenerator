import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { selectLength, setLength } from "./lengthSlice";

export const Length = () => {
    const length = useAppSelector(selectLength);
    const dispatch = useAppDispatch();
    return <input type="number" value={length} onChange={(e) => dispatch(setLength(parseInt(e.target.value)))} />;
};
