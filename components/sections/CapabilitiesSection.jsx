import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Section } from '@/components/layout/Section';
import { CAPABILITIES } from '@/lib/constants';

export const CapabilitiesSection = () => {
  return (
    <Section id="capabilities" title="Capabilities" contentSx={{ maxWidth: '40rem' }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manual equipment with careful attention to fit and finish. Equipment includes a Bridgeport
        mill, DoAll 13 lathe, and Harig surface grinder.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {CAPABILITIES.map((capability) => (
          <Box component="li" key={capability} sx={{ mb: 0.75 }}>
            <Typography variant="body1">{capability}</Typography>
          </Box>
        ))}
      </Box>
    </Section>
  );
};
