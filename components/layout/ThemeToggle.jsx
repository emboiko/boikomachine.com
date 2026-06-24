'use client';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

export const ThemeToggle = () => {
  const { colorScheme, setMode } = useColorScheme();
  const isReady = Boolean(colorScheme);
  const isDark = colorScheme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  const button = (
    <IconButton
      aria-label={isReady ? label : 'Theme toggle'}
      aria-hidden={!isReady}
      disabled={!isReady}
      onClick={() => {
        if (isDark) {
          setMode('light');
        } else {
          setMode('dark');
        }
      }}
      color="inherit"
      size="large"
      tabIndex={isReady ? 0 : -1}
      sx={
        isReady
          ? undefined
          : {
              pointerEvents: 'none',
              visibility: 'hidden',
            }
      }
    >
      {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
    </IconButton>
  );

  if (!isReady) {
    return button;
  }

  return <Tooltip title={label}>{button}</Tooltip>;
};
