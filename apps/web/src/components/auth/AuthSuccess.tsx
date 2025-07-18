import { Box, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface AuthSuccessProps {
  message: string;
}

export const AuthSuccess = ({ message }: AuthSuccessProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      p={2}
      mb={2}
      bgcolor="rgba(76, 175, 80, 0.1)"
      borderRadius={1}
    >
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40 }} />
      <Typography variant="body1" color="success.main">
        {message}
      </Typography>
    </Box>
  );
};
