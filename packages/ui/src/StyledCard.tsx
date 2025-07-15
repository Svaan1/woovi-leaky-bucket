import { styled } from "@mui/material/styles"
import { Card, CardProps } from "@mui/material";

export const StyledCard = styled(Card)<CardProps>(({ theme }) => ({
    borderRadius: 12,
}));