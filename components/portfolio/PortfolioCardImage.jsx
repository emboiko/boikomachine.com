'use client';

import Image from 'next/image';
import Box from '@mui/material/Box';

const PortfolioImagePlaceholder = () => {
  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: '4 / 3',
        flexShrink: 0,
        backgroundColor: 'action.hover',
      }}
    />
  );
};

export const PortfolioCardImage = ({
  src,
  alt,
  sizes = '(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw',
}) => {
  if (!src) {
    return <PortfolioImagePlaceholder />;
  }

  const useUnoptimized = src.startsWith('/api/');

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4 / 3',
        flexShrink: 0,
        backgroundColor: 'action.hover',
        overflow: 'hidden',
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized={useUnoptimized}
        sizes={sizes}
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />
    </Box>
  );
};
