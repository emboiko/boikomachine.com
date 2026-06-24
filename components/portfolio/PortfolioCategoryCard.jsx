'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { PortfolioCardImage } from '@/components/portfolio/PortfolioCardImage';

export const PortfolioCategoryCard = ({ category, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <PortfolioCardImage src={category.coverUrl} alt={category.label} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h3" sx={{ fontSize: '1.125rem', mb: 1 }}>
          {category.label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {category.description}
        </Typography>
      </CardContent>
    </Card>
  );
};
