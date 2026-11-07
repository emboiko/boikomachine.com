import Stack from '@mui/material/Stack';
import { GoogleBusinessProfileLink } from '@/components/layout/GoogleBusinessProfileLink';

export const FooterSocialLinks = () => {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      justifyContent="center"
      aria-label="Social links"
    >
      <GoogleBusinessProfileLink />
    </Stack>
  );
};
