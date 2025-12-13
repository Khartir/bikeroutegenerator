import { Length } from "./length/Length";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import Settings from "@mui/icons-material/Settings";
import { Profile } from "./profile/Profile";
import {IconButton, styled, Dialog, DialogTitle, DialogContent, FormControlLabel, Switch} from "@mui/material";
import {Close} from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { selectOptionsState, selectShowIntermediateSteps, toggleOptions, toggleShowIntermediateSteps } from "../routeSlice";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
}));

interface DialogTitleProps {
    id: string;
    children?: React.ReactNode;
    onClose: () => void;
}

const BootstrapDialogTitle = ({ children, onClose }: DialogTitleProps) => {
    return (
        <DialogTitle sx={{ m: 0, p: 2 }}>
            {children}
            <IconButton
                aria-label={messages.actions.close}
                onClick={onClose}
                sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <Close />
            </IconButton>
        </DialogTitle>
    );
};

export default function Options() {
    const open = useAppSelector(selectOptionsState);
    const showIntermediateSteps = useAppSelector(selectShowIntermediateSteps);
    const dispatch = useAppDispatch();
    const handleOpen = () => dispatch(toggleOptions(true));
    const handleClose = () => dispatch(toggleOptions(false));
    const handleToggleIntermediateSteps = () => dispatch(toggleShowIntermediateSteps());

    return (
        <div>
            <Button label={messages.options.title} onClick={handleOpen}>
                <Settings />
            </Button>
            <BootstrapDialog onClose={handleClose} aria-labelledby="options-dialog-title" open={open}>
                <BootstrapDialogTitle id="options-dialog-title" onClose={handleClose}>
                    {messages.options.title}
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Length />
                        </Grid>
                        <Grid item xs={12}>
                            <Profile />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showIntermediateSteps}
                                        onChange={handleToggleIntermediateSteps}
                                    />
                                }
                                label={messages.options.showIntermediateSteps}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
            </BootstrapDialog>
        </div>
    );
}
