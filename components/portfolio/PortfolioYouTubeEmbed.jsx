'use client';

import Box from '@mui/material/Box';
import { getYouTubeEmbedUrl } from '@/lib/portfolio/youtube';

export const PortfolioYouTubeEmbed = ({ url, title }) => {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: 'action.hover',
      }}
    >
      <Box
        component="iframe"
        src={embedUrl}
        title={title || 'YouTube video'}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 0,
        }}
      />
    </Box>
  );
};
