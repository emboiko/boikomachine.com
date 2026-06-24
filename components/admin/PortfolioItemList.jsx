'use client';

import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { PortfolioCardImage } from '@/components/portfolio/PortfolioCardImage';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import { getPortfolioCategoryLabel } from '@/lib/portfolio/categories';

export const PortfolioItemList = ({ items }) => {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredItems = useMemo(() => {
    if (categoryFilter === 'all') {
      return items;
    }

    return items.filter((item) => item.category === categoryFilter);
  }, [categoryFilter, items]);

  if (items.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No portfolio projects yet. Create the first one to populate the public site.
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      <FormControl sx={{ maxWidth: 280 }}>
        <InputLabel id="portfolio-filter-label">Filter by category</InputLabel>
        <Select
          labelId="portfolio-filter-label"
          label="Filter by category"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <MenuItem value="all">All categories</MenuItem>
          {PORTFOLIO_CATEGORIES.map((category) => (
            <MenuItem key={category.slug} value={category.slug}>
              {category.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filteredItems.length === 0 ? (
        <Alert severity="info">No projects in this category yet.</Alert>
      ) : (
        <Stack spacing={2}>
          {filteredItems.map((item) => (
            <Card key={item.id} variant="outlined">
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  <Box sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}>
                    <PortfolioCardImage src={item.coverUrl} alt={item.title} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="overline" color="text.secondary">
                      {getPortfolioCategoryLabel(item.category)}
                    </Typography>
                    <Typography variant="h3" sx={{ fontSize: '1.125rem', mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.images.length} photo{item.images.length === 1 ? '' : 's'}
                    </Typography>
                  </Box>
                  <Button component={Link} href={`/admin/portfolio/${item.id}`} variant="outlined">
                    Edit
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
