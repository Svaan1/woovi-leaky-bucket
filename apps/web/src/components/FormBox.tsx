import { Box } from "@mui/material"
import React from "react";


interface FormBoxProps {
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
}

export const FormBox: React.FC<FormBoxProps> = ({ children, onSubmit }) => {
    return (
        <Box 
            component="form"
            onSubmit={onSubmit}
            sx={{
                width: '100%',
                maxWidth: '485px',
                color: 'text.primary',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                boxShadow: 1,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
        }}>
            {children}
        </Box>   
    )
}
