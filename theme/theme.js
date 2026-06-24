import { createTheme } from '@mui/material/styles';
import { Source_Sans_3 } from 'next/font/google';

export const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const sharedTypography = {
  fontFamily: sourceSans.style.fontFamily,
  h1: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.35,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
};

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#4a6278',
        },
        background: {
          default: '#fafafa',
          paper: '#ffffff',
        },
        text: {
          primary: '#1a1a1a',
          secondary: '#4a4a4a',
        },
        divider: '#e0e0e0',
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#8fa8be',
        },
        background: {
          default: '#1e1e1e',
          paper: '#2a2a2a',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#b8b8b8',
        },
        divider: '#3a3a3a',
      },
    },
  },
  typography: sharedTypography,
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme: muiTheme }) => ({
          border: '1px solid',
          borderColor: muiTheme.vars.palette.divider,
        }),
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme: muiTheme }) => ({
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: muiTheme.vars.palette.divider,
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          width: '100%',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          width: '100%',
          boxSizing: 'border-box',
        },
      },
    },
  },
});

export default theme;
