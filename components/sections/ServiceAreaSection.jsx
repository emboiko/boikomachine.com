import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Section } from '@/components/layout/Section';
import { SERVICE_AREAS } from '@/lib/constants';

export const ServiceAreaSection = () => {
  return (
    <Section id="service-area" title="Service Area" contentSx={{ maxWidth: '40rem' }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      Based in Derry, New Hampshire, most work comes from southern New Hampshire and the Merrimack Valley, but distance is rarely a limitation. Many projects can be discussed remotely, and shipped parts, consultation, and on-site visits are all common when practical.

Formal drawings are helpful, but they are not required. Photos, rough sketches, broken parts, and plain descriptions are often enough to start a conversation.

      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {SERVICE_AREAS.map((area) => (
          <Box component="li" key={area} sx={{ mb: 0.75 }}>
            <Typography variant="body1">{area}</Typography>
          </Box>
        ))}
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      Not every project is the right fit, but we're always happy to review photos, sketches, and ideas to see what's practical.
      </Typography>
    </Section>
  );
};
