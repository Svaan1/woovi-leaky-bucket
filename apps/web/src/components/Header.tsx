import { Box, Typography } from "@mui/material";
import { WooviIcon } from "./WooviIcon";

export const Header = () => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 4,
    }}>
        <WooviIcon sx={{
            width: '120px',
            height: 'auto',
        }} />
    </Box>
);
