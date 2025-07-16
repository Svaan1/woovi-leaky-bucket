import { Box, Typography } from "@mui/material";
import { StyledLink } from "@woovi-playground/ui";

interface AuthFooterProps {
  text: string;
  linkText: string;
  linkHref: string;
}

export const AuthFooter = ({ text, linkText, linkHref }: AuthFooterProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 4,
        gap: 1,
      }}
    >
      <Typography variant="body2">{text}</Typography>
      <StyledLink href={linkHref}>
        <Typography variant="body2">
          {linkText}
        </Typography>
      </StyledLink>
    </Box>
  );
};
