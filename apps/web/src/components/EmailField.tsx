import React from "react";

import { SxProps, Theme } from "@mui/material";
import { StyledTextField } from "@woovi-playground/ui";

const emailInputSx = (isEmailValid: boolean): SxProps<Theme> => ({
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: isEmailValid ? "rgb(3, 214, 157)" : "red",
    },
  },
});

const validateEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

interface EmailFieldProps {
  email: string;
  setEmail: (email: string) => void;
  isEmailValid: boolean;
  setIsEmailValid: (isValid: boolean) => void;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  email,
  setEmail,
  isEmailValid,
  setIsEmailValid,
}) => {
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  return (
    <StyledTextField
      label="Email"
      type="email"
      fullWidth
      value={email}
      onChange={handleEmailChange}
      sx={emailInputSx(isEmailValid)}
    />
  );
};
