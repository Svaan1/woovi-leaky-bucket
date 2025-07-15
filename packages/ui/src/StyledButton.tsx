import { styled } from "@mui/material/styles"

import { Button, ButtonProps } from "@mui/material";

export const StyledButton = styled(Button)<ButtonProps>(({ theme }) => ({
    textTransform: 'inherit',
    minHeight: '35px',
    height: '1.5vw',
    borderRadius: 4,
    boxShadow: 'none',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        boxShadow: 'none',
    },
}));