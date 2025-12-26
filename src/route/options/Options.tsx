import { Length } from "./length/Length";
import { Button } from "../../leaflet/Button";
import { messages } from "../../localization/localization";
import Settings from "@mui/icons-material/Settings";
import { Profile } from "./profile/Profile";
import {IconButton, styled, Dialog, DialogTitle, DialogContent, FormControlLabel, Switch, TextField, Checkbox, FormControl, FormLabel, FormGroup} from "@mui/material";
import {Close} from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { selectOptionsState, selectStepThroughMode, selectBrouterUrl, selectEnabledShapes, toggleOptions, toggleStepThroughMode, setBrouterUrl, toggleShape, RouteShape } from "../routeSlice";

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

const ALL_SHAPES: RouteShape[] = ["circle", "ellipse", "triangle_tip"];

export default function Options() {
    const open = useAppSelector(selectOptionsState);
    const stepThroughMode = useAppSelector(selectStepThroughMode);
    const brouterUrl = useAppSelector(selectBrouterUrl);
    const enabledShapes = useAppSelector(selectEnabledShapes);
    const dispatch = useAppDispatch();
    const handleOpen = () => dispatch(toggleOptions(true));
    const handleClose = () => dispatch(toggleOptions(false));
    const handleToggleStepThroughMode = () => dispatch(toggleStepThroughMode());
    const handleShapeToggle = (shape: RouteShape) => () => dispatch(toggleShape(shape));
    const handleBrouterUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setBrouterUrl(event.target.value));
    };
    const isShapeEnabled = (shape: RouteShape) => enabledShapes.includes(shape);
    const isOnlyOneEnabled = enabledShapes.length === 1;

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
                                        checked={stepThroughMode}
                                        onChange={handleToggleStepThroughMode}
                                    />
                                }
                                label={messages.options.stepThroughMode}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">{messages.options.shapeSelection}</FormLabel>
                                <FormGroup>
                                    {ALL_SHAPES.map((shape) => (
                                        <FormControlLabel
                                            key={shape}
                                            control={
                                                <Checkbox
                                                    checked={isShapeEnabled(shape)}
                                                    onChange={handleShapeToggle(shape)}
                                                    disabled={isOnlyOneEnabled && isShapeEnabled(shape)}
                                                />
                                            }
                                            label={messages.options.shapes[shape]}
                                        />
                                    ))}
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={messages.options.brouterUrl}
                                value={brouterUrl}
                                onChange={handleBrouterUrlChange}
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
            </BootstrapDialog>
        </div>
    );
}
