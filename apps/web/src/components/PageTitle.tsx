import { Typography } from "@mui/material";

interface PageTitleProps {
    title: string;
    subtitle?: string;
}

export const PageTitle = ({ title, subtitle }: PageTitleProps) => (
    <>
        <Typography variant="h2" textAlign="center" mb={3} color="text.primary">
            {title}
        </Typography>
        {subtitle && (
            <Typography variant="subtitle1" textAlign="center" mb={2} color="text.secondary">
                {subtitle}
            </Typography>
        )}
    </>
);
