import { useAppDispatch, useAppSelector } from "../../../state/hooks";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { messages } from "../../../localization/localization";
import { Profile as ProfileType, profiles } from "../../../routing/routeAPI";
import { selectProfile, setProfile } from "../../routeSlice";

export function Profile() {
    const profile = useAppSelector(selectProfile);
    const dispatch = useAppDispatch();

    return (
        <FormControl fullWidth>
            <InputLabel id="profile-select-label">{messages.profile.label}</InputLabel>
            <Select
                labelId="profile-select-label"
                id="profile-select"
                value={profile}
                label="Age"
                onChange={(event: SelectChangeEvent) => {
                    dispatch(setProfile(event.target.value as ProfileType));
                }}
            >
                {Object.keys(profiles).map((profile) => (
                    <MenuItem value={profile} key={profile}>
                        {messages.profile[profile as ProfileType]}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
