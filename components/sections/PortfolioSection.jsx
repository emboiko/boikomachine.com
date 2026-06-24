'use client';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { CardGrid } from '@/components/layout/CardGrid';
import { Section } from '@/components/layout/Section';
import { PortfolioCardImage } from '@/components/portfolio/PortfolioCardImage';
import { useStore } from '@/components/StoreProvider';
import { trackPortfolioView, sendGaEvent } from '@/services/client/analyticsClientService';

export const PortfolioSection = observer(() => {
  const store = useStore();
  const { portfolio } = store;

  useEffect(() => {
    portfolio.loadItems();
  }, [portfolio]);

  const handleCardClick = (item) => {
    trackPortfolioView('/#portfolio', { slug: item.slug, category: item.category });
    sendGaEvent('portfolio_card_click', { item_slug: item.slug });
  };

  return (
    <Section id="portfolio" title="Portfolio" containerMaxWidth="lg">
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '40rem' }}>
        Representative work shown below. Photos are placeholders until a consistent photo library is
        available. Real project photos will replace these over time.
      </Typography>

      {portfolio.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {portfolio.errorMessage && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {portfolio.errorMessage}
        </Alert>
      )}

      {!portfolio.isLoading && portfolio.items.length > 0 && (
        <CardGrid>
          {portfolio.items.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleCardClick(item)}
              sx={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <PortfolioCardImage src={item.imageUrl} alt={item.title} />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="overline" color="text.secondary">
                  {item.category}
                </Typography>
                <Typography variant="h3" sx={{ fontSize: '1.125rem', mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </CardGrid>
      )}
    </Section>
  );
});
