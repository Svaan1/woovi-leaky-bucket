import { styled } from "@mui/material/styles";
import { Button, ButtonProps, CircularProgress } from "@mui/material";
import React from "react";

interface ExtendedButtonProps extends ButtonProps {
  loading?: boolean;
}

export const StyledButton = styled(
  ({ loading, children, ...props }: ExtendedButtonProps) => (
    <Button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <CircularProgress size={24} color="inherit" sx={{ mr: children ? 1 : 0 }} />
      ) : null}
      {children}
    </Button>
  )
)(({ theme }) => ({
  textTransform: "inherit",
  fontSize: "0.75rem",
  lineHeight: "1.75",
  marginTop:"8px",
  borderRadius: 4,
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
  },
}));
