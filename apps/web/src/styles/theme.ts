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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'inherit',
          borderRadius: 8,
          paddingTop: 12,
          paddingBottom: 12,
          fontSize: '16px',
          fontWeight: 600,
        },
        containedPrimary: {
            '&:hover': {
                backgroundColor: 'rgb(2, 179, 131)',
            },
            '&:disabled': {
                backgroundColor: 'rgba(3, 214, 157, 0.5)',
            },
        }
      },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                },
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12,
            }
        }
    }
  },
});

export default theme;
