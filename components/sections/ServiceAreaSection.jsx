import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Section } from '@/components/layout/Section';
import { SERVICE_AREAS } from '@/lib/constants';

export const ServiceAreaSection = () => {
  return (
    <Section id="service-area" title="Service Area" contentSx={{ maxWidth: '40rem' }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Based in Derry, NH. Most work is in southern New Hampshire and the Merrimack Valley, with
        on-site visits common - you do not need to come to the shop. Many customers do not have
        formal drawings; photos, rough sketches, or a plain description are a fine starting point.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {SERVICE_AREAS.map((area) => (
          <Box component="li" key={area} sx={{ mb: 0.75 }}>
            <Typography variant="body1">{area}</Typography>
          </Box>
        ))}
      </Box>
    </Section>
  );
};
