import { Box, Typography } from "@mui/material";
import { WooviIcon } from "./WooviIcon";

const Header = () => (
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
        <Typography variant="h1" color="text.primary">
            Woovi
        </Typography>
    </Box>
);

export default Header;
