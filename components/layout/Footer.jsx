import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { BUSINESS } from '@/lib/constants';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        width: '100%',
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          px: { xs: 2.5, sm: 3 },
          width: '100%',
          boxSizing: 'border-box',
          textAlign: { xs: 'left', md: 'center' },
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {BUSINESS.name} · {BUSINESS.location}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <Link href={BUSINESS.phoneHref} color="inherit" underline="hover">
            {BUSINESS.phone}
          </Link>
          {' · '}
          <Link href={BUSINESS.emailHref} color="inherit" underline="hover">
            {BUSINESS.email}
          </Link>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          © {currentYear} {BUSINESS.name}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};
