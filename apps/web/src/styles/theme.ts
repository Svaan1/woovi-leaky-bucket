import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(3, 214, 157)',
      contrastText: '#fff',
    },
    secondary: {
      main: 'rgb(2, 179, 131)',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Nunito, sans-serif',
    h1: {
      fontSize: '32px',
      fontWeight: 600,
    },
    h2: {
        fontSize: '24px',
        fontWeight: 600,
    },
    subtitle1: {
        fontSize: '16px',
        fontWeight: 400,
    },
  },
});

export default theme;
