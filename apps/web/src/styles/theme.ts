import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(3, 214, 157)",
      contrastText: "#fff",
    },
  },
  typography: {
    fontFamily: "Nunito",
    h1: {
      fontSize: "28px",
      fontWeight: 600,
      lineHeight: 1.167,
    },
    h5: {
      fontSize: "1.28571rem",
      fontWeight: 400,
      lineHeight: 1.334,
    },
    body1: {
      fontSize: "0.857143rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.43
    }
  },
});

export default theme;
