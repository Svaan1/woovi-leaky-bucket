import React from "react";

import { SxProps, Theme } from "@mui/material";
import { StyledTextField } from "@woovi-playground/ui";

const nameInputSx = (isNameValid: boolean): SxProps<Theme> => ({
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: isNameValid ? "rgb(3, 214, 157)" : "red",
    },
  },
});

const validateName = (name: string) => {
  return name.trim().length >= 2;
};

interface NameFieldProps {
  name: string;
  setName: (name: string) => void;
  isNameValid: boolean;
  setIsNameValid: (isValid: boolean) => void;
}

export const NameField: React.FC<NameFieldProps> = ({
  name,
  setName,
  isNameValid,
  setIsNameValid,
}) => {
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setName(newName);
    setIsNameValid(validateName(newName));
  };

  return (
    <StyledTextField
      label="Nome"
      type="text"
      fullWidth
      value={name}
      onChange={handleNameChange}
      sx={nameInputSx(isNameValid)}
    />
  );
};
