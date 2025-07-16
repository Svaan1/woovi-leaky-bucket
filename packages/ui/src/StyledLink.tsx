import { styled } from "@mui/material/styles";

import { Link, LinkProps } from "@mui/material";

export const StyledLink = styled(Link)<LinkProps>(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
}));
