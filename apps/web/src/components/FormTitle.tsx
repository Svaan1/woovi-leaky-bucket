import { Typography } from "@mui/material";

interface FormTitleProps {
  title: string;
  subtitle?: string;
}

export const FormTitle = ({ title, subtitle }: FormTitleProps) => (
  <>
    <Typography variant="h1" textAlign="center" mb={0.5} color="text.primary">
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant="subtitle1"
        textAlign="center"
        color="text.secondary"
      >
        {subtitle}
      </Typography>
    )}
  </>
);
