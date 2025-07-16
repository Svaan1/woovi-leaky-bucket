import { Typography } from "@mui/material";

interface FormTitleProps {
  title: string;
  subtitle?: string;
}

export const FormTitle = ({ title, subtitle }: FormTitleProps) => (
  <>
    <Typography variant="h2" textAlign="center" mb={3} color="text.primary">
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant="subtitle1"
        textAlign="center"
        mb={2}
        color="text.secondary"
      >
        {subtitle}
      </Typography>
    )}
  </>
);
