'use client';

import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { CardGrid } from '@/components/layout/CardGrid';
import { PortfolioCardImage } from '@/components/portfolio/PortfolioCardImage';
import { useStore } from '@/components/StoreProvider';
import { getPortfolioCategoryLabel } from '@/lib/portfolio/categories';
import { getPortfolioWorkStatusLabel } from '@/lib/portfolio/workStatus';
import { sendGaEvent, trackPortfolioView } from '@/services/client/analyticsClientService';

export const PortfolioCategoryGallery = observer(() => {
  const store = useStore();
  const { portfolio } = store;
  const categoryLabel = portfolio.explorerCategory
    ? getPortfolioCategoryLabel(portfolio.explorerCategory)
    : 'this category';

  if (portfolio.isLoadingCategoryItems) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (portfolio.categoryItems.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          No projects in {categoryLabel} yet. Check back as new work is added, or reach out if you
          have a similar job in mind.
        </Typography>
        <Button component="a" href="#contact" variant="contained" onClick={() => portfolio.closeExplorer()}>
          Contact us
        </Button>
      </Box>
    );
  }

  const handleItemClick = (item) => {
    trackPortfolioView(`/#portfolio?category=${item.category}`, {
      slug: item.slug,
      category: item.category,
    });
    sendGaEvent('portfolio_card_click', { item_slug: item.slug, category: item.category });
    portfolio.openItem(item.slug);
  };

  return (
    <CardGrid>
      {portfolio.categoryItems.map((item) => {
        const statusLabel = getPortfolioWorkStatusLabel(item.workStatus);

        return (
          <Card
            key={item.id}
            onClick={() => handleItemClick(item)}
            sx={{
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <PortfolioCardImage src={item.coverUrl} alt={item.title} />
            <CardContent sx={{ flexGrow: 1 }}>
              {statusLabel ? (
                <Typography variant="overline" color="text.secondary">
                  {statusLabel}
                </Typography>
              ) : null}
              <Typography variant="h3" sx={{ fontSize: '1.125rem', mb: 1 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </CardGrid>
  );
});
