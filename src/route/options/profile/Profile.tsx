import { useAppDispatch, useAppSelector } from "../../../state/hooks";
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel } from "@mui/material";
import { messages } from "../../../localization/localization";
import { Profile as ProfileType, profiles } from "../../../routing/routeAPI";
import { selectProfiles, toggleProfile } from "../../routeSlice";
import { profileColors } from "../../profileColors";

export function Profile() {
    const selectedProfiles = useAppSelector(selectProfiles);
    const dispatch = useAppDispatch();
    const isOnlyOneSelected = selectedProfiles.length === 1;

    return (
        <FormControl component="fieldset">
            <FormLabel component="legend">{messages.profile.label}</FormLabel>
            <FormGroup>
                {Object.entries(profiles).map(([key, config]) => {
                    const isSelected = selectedProfiles.includes(key as ProfileType);
                    return (
                        <FormControlLabel
                            key={key}
                            control={
                                <Checkbox
                                    checked={isSelected}
                                    onChange={() => dispatch(toggleProfile(key as ProfileType))}
                                    disabled={isOnlyOneSelected && isSelected}
                                    sx={{
                                        color: profileColors[key],
                                        "&.Mui-checked": { color: profileColors[key] },
                                    }}
                                />
                            }
                            label={config.label}
                        />
                    );
                })}
            </FormGroup>
        </FormControl>
    );
}
