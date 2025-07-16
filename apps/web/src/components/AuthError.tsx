import { Typography } from "@mui/material";

interface AuthErrorProps {
  error: string;
}

export const AuthError = ({ error }: AuthErrorProps) => {
  return (
    <Typography color="error" variant="body2">
      {error}
    </Typography>
  );
};
