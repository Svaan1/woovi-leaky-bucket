import { styled } from "@mui/material/styles";

import { TextField, TextFieldProps } from "@mui/material";

export const StyledTextField = styled(TextField)<TextFieldProps>(
  ({ theme }) => ({
    borderRadius: 4,
  }),
);
