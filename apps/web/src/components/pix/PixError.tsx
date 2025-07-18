import { ErrorOutline } from "@mui/icons-material";
import { Alert, Fade } from "@mui/material";

interface PixErrorProps {
  error: string;
}

export const PixError = ({ error }: PixErrorProps) => {
  return (
    <Fade in>
      <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorOutline />}>
        {error}
      </Alert>
    </Fade>
  );
};
