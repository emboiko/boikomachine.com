'use client';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PortfolioCardImage } from '@/components/portfolio/PortfolioCardImage';
import { PortfolioYouTubeEmbed } from '@/components/portfolio/PortfolioYouTubeEmbed';
import { useStore } from '@/components/StoreProvider';
import { sendGaEvent, trackPortfolioView } from '@/services/client/analyticsClientService';

export const PortfolioJobDetail = observer(() => {
  const store = useStore();
  const { portfolio } = store;
  const item = portfolio.selectedItem;

  useEffect(() => {
    if (!item) {
      return;
    }

    trackPortfolioView(`/#portfolio?category=${item.category}&job=${item.slug}`, {
      slug: item.slug,
      category: item.category,
    });
    sendGaEvent('portfolio_view', { item_slug: item.slug, category: item.category });
  }, [item?.slug, item?.category]);

  if (portfolio.isLoadingItemDetail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!item) {
    return (
      <Alert severity="warning">This project could not be loaded. It may have been removed.</Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        {item.material ? (
          <Typography variant="overline" color="text.secondary">
            {item.material}
          </Typography>
        ) : null}
        <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1 }}>
          {item.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
          {item.description}
        </Typography>
      </Box>

      {item.images.length > 0 ? (
        <Stack spacing={2}>
          {item.images.map((image) => (
            <Box key={image.id}>
              <PortfolioCardImage
                src={image.url}
                alt={image.alt || item.title}
                sizes="(max-width: 960px) 100vw, 900px"
              />
              {image.caption ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {image.caption}
                </Typography>
              ) : null}
            </Box>
          ))}
        </Stack>
      ) : null}

      {item.youtubeUrl ? (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Video
          </Typography>
          <PortfolioYouTubeEmbed url={item.youtubeUrl} title={item.title} />
        </Box>
      ) : null}

      {item.model3d ? (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            3D model
          </Typography>
          <Link href={item.model3d.url} target="_blank" rel="noopener noreferrer">
            Download {item.model3d.originalName}
          </Link>
        </Box>
      ) : null}
    </Stack>
  );
});
