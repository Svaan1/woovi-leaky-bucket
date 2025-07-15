import { Typography } from "@mui/material";

interface PageTitleProps {
    title: string;
    subtitle: string;
}

const PageTitle = ({ title, subtitle }: PageTitleProps) => (
    <>
        <Typography variant="h2" textAlign="center" mb={1} color="text.primary">
            {title}
        </Typography>
        <Typography variant="subtitle1" textAlign="center" mb={4} color="text.secondary">
            {subtitle}
        </Typography>
    </>
);

export default PageTitle;
