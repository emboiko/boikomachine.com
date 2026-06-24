import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { CardGrid } from '@/components/layout/CardGrid';
import { Section } from '@/components/layout/Section';
import { SERVICES } from '@/lib/constants';

const SERVICE_DESCRIPTIONS = {
  'Custom Machining & Repair':
    'Bridgeport milling, lathe work, and repair for worn or damaged parts.',
  'Precision Prototypes':
    'One-off and low-volume prototypes to prove out your design before production.',
  'Tools, Jigs & Fixtures':
    'Custom workholding and shop aids built to make your job repeatable.',
};

export const ServicesSection = () => {
  return (
    <Section id="services" title="Services">
      <CardGrid>
        {SERVICES.map((service) => (
          <Paper
            key={service}
            sx={{
              p: 3,
              height: '100%',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h3" sx={{ fontSize: '1.125rem', mb: 1 }}>
              {service}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {SERVICE_DESCRIPTIONS[service]}
            </Typography>
          </Paper>
        ))}
      </CardGrid>
    </Section>
  );
};
