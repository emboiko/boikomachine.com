'use client';

import { useState } from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import { PORTFOLIO_IMAGE_FALLBACK } from '@/lib/constants';

const isSvgSource = (source) => {
  return typeof source === 'string' && source.toLowerCase().endsWith('.svg');
};

export const PortfolioCardImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(src || PORTFOLIO_IMAGE_FALLBACK);
  const useUnoptimized = isSvgSource(imageSrc);

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
        src={imageSrc}
        alt={alt}
        fill
        unoptimized={useUnoptimized}
        sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        onError={() => {
          if (imageSrc !== PORTFOLIO_IMAGE_FALLBACK) {
            setImageSrc(PORTFOLIO_IMAGE_FALLBACK);
          }
        }}
      />
    </Box>
  );
};
