import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../state/store";
import { Profile } from "../../../routing/routeAPI";

interface ProfileState {
    value: Profile | "";
}

const initialState: ProfileState = {
    value: "",
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<Profile>) => {
            state.value = action.payload;
        },
    },
});

export const { setProfile } = profileSlice.actions;

export const selectProfile = (state: RootState) => state.profile.value;

export default profileSlice.reducer;
