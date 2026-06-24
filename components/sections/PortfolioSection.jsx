'use client';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { CardGrid } from '@/components/layout/CardGrid';
import { Section } from '@/components/layout/Section';
import { PortfolioCategoryCard } from '@/components/portfolio/PortfolioCategoryCard';
import { PortfolioExplorer } from '@/components/portfolio/PortfolioExplorer';
import { useStore } from '@/components/StoreProvider';
import { PORTFOLIO_CATEGORY_SLUGS } from '@/lib/constants';
import { sendGaEvent, trackCtaClick } from '@/services/client/analyticsClientService';

const readDeepLinkParams = () => {
  if (typeof window === 'undefined') {
    return { category: null, job: null };
  }

  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const job = params.get('job');

  if (category && PORTFOLIO_CATEGORY_SLUGS.includes(category)) {
    return { category, job };
  }

  return { category: null, job: null };
};

export const PortfolioSection = observer(() => {
  const store = useStore();
  const { portfolio } = store;

  useEffect(() => {
    portfolio.loadCategories();
  }, [portfolio]);

  useEffect(() => {
    if (!portfolio.hasLoadedCategories || portfolio.explorerOpen) {
      return;
    }

    const { category, job } = readDeepLinkParams();

    if (!category) {
      return;
    }

    const openFromDeepLink = async () => {
      await portfolio.openCategory(category);

      if (job) {
        await portfolio.openItem(job);
      }
    };

    openFromDeepLink();
  }, [portfolio, portfolio.hasLoadedCategories, portfolio.explorerOpen]);

  const handleCategoryClick = (category) => {
    trackCtaClick('/#portfolio', { cta: 'portfolio_category', category: category.slug });
    sendGaEvent('portfolio_category_click', { category: category.slug });
    portfolio.openCategory(category.slug);
  };

  return (
    <Section id="portfolio" title="Portfolio" containerMaxWidth="lg">
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      Examples of previous work, repairs, prototypes, tooling, and fixtures.
      </Typography>

      {portfolio.isLoadingCategories && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {portfolio.errorMessage && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {portfolio.errorMessage}
        </Alert>
      )}

      {!portfolio.isLoadingCategories && portfolio.categories.length > 0 ? (
        <CardGrid>
          {portfolio.categories.map((category) => (
            <PortfolioCategoryCard
              key={category.slug}
              category={category}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </CardGrid>
      ) : null}

      <PortfolioExplorer />
    </Section>
  );
});
