import { Snackbar, Alert } from "@mui/material";

interface AuthSuccessProps {
  success: boolean;
  children: React.ReactNode
}

export const AuthSuccess = ({ success, children}: AuthSuccessProps) => {
  return (
    <Snackbar 
      open={success} 
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert severity="success" elevation={6} variant="filled">
          {children}
      </Alert>
    </Snackbar>
  );
};
