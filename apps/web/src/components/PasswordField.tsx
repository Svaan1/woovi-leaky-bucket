import React from "react";

import { SxProps, Theme } from "@mui/material";
import { StyledTextField } from "@woovi-playground/ui";

const passwordInputSx = (isPasswordValid: boolean): SxProps<Theme> => ({
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: isPasswordValid ? "rgb(3, 214, 157)" : "red",
    },
  },
});

const validatePassword = (password: string) => {
  // Password must be at least 6 characters long
  return password.length >= 6;
};

interface PasswordFieldProps {
  password: string;
  setPassword: (password: string) => void;
  isPasswordValid?: boolean;
  setIsPasswordValid?: (isValid: boolean) => void;
  label?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ 
  password, 
  setPassword, 
  isPasswordValid,
  setIsPasswordValid,
  label = "Senha" 
}) => {
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    if (setIsPasswordValid) {
      setIsPasswordValid(validatePassword(newPassword));
    }
  };

  return (
    <StyledTextField
      label={label}
      type="password"
      fullWidth
      value={password}
      onChange={handlePasswordChange}
      sx={isPasswordValid !== undefined ? passwordInputSx(isPasswordValid) : undefined}
    />
  );
};
