import { useState } from "react";
import { Length } from "./length/Length";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import Settings from "@mui/icons-material/Settings";
import { Profile } from "./profile/Profile";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { selectOptionsState, toggleOptions } from "../routeSlice";

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
                <CloseIcon />
            </IconButton>
        </DialogTitle>
    );
};

export default function Options() {
    const open = useAppSelector(selectOptionsState);
    const dispatch = useAppDispatch();
    const handleOpen = () => dispatch(toggleOptions(true));
    const handleClose = () => dispatch(toggleOptions(false));

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
                    </Grid>
                </DialogContent>
            </BootstrapDialog>
        </div>
    );
}
