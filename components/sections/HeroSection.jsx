import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Section } from '@/components/layout/Section';
import { BUSINESS } from '@/lib/constants';

export const HeroSection = () => {
  return (
    <Section
      id="top"
      centerContent
      sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 5, md: 8 } }}
      contentSx={{ maxWidth: '40rem' }}
    >
      <Stack spacing={3} alignItems={{ xs: 'stretch', md: 'center' }}>
        <Typography component="h1" variant="h1">
          {BUSINESS.name}
        </Typography>
        <Typography
          variant="h3"
          color="text.secondary"
          sx={{ fontWeight: 500, fontSize: { xs: '1.125rem', md: '1.25rem' } }}
        >
          Precision machining and tooling in southern New Hampshire. Small jobs welcome - from a
          single bushing to prototype runs.
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: '100%', maxWidth: '28rem' }}
        >
          <Button variant="contained" size="large" href={BUSINESS.phoneHref} fullWidth>
            Call {BUSINESS.phone}
          </Button>
          <Button variant="outlined" size="large" href="#contact" fullWidth>
            Request a Quote
          </Button>
        </Stack>
      </Stack>
      <Box sx={{ mt: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Serving {BUSINESS.location} and the greater Merrimack Valley. On-site visits are common.
        </Typography>
      </Box>
    </Section>
  );
};
