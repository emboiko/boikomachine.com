import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import GoogleIcon from '@mui/icons-material/Google';
import { BUSINESS } from '@/lib/constants';

export const GoogleBusinessProfileLink = () => {
  const profileUrl = BUSINESS.googleBusinessProfileUrl?.trim();

  if (!profileUrl) {
    return null;
  }

  return (
    <Tooltip title="Google Business Profile">
      <IconButton
        component="a"
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Google Business Profile"
        size="small"
        color="inherit"
        sx={{ color: 'text.secondary' }}
      >
        <GoogleIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
