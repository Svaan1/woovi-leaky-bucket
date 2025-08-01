import { styled } from "@mui/material/styles";

import { Container, ContainerProps } from "@mui/system";

export const StyledContainer = styled(Container)<ContainerProps>(
  ({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100vh",
    p: 2,
  }),
);
