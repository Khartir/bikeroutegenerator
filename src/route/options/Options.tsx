import { useState } from "react";
import Stack from "@mui/material/Stack";
import Modal from "@mui/material/Modal";
import { Length } from "./length/Length";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import Settings from "@mui/icons-material/Settings";
import { Profile } from "./profile/Profile";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};

export default function Options() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div>
            <Button label={messages.options.label} onClick={handleOpen}>
                <Settings />
            </Button>
            <Modal open={open} onClose={handleClose}>
                <Stack sx={style} spacing={2}>
                    <Length />
                    <Profile />
                </Stack>
            </Modal>
        </div>
    );
}
