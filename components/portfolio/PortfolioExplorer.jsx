'use client';

import { observer } from 'mobx-react-lite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PortfolioCategoryGallery } from '@/components/portfolio/PortfolioCategoryGallery';
import { PortfolioJobDetail } from '@/components/portfolio/PortfolioJobDetail';
import { useStore } from '@/components/StoreProvider';
import { getPortfolioCategoryLabel } from '@/lib/portfolio/categories';

export const PortfolioExplorer = observer(() => {
  const store = useStore();
  const { portfolio } = store;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClose = () => {
    if (portfolio.explorerView === 'detail') {
      portfolio.navigateBack();
      return;
    }

    portfolio.closeExplorer();
  };

  const handleBack = () => {
    portfolio.navigateBack();
  };

  let title = 'Portfolio';

  if (portfolio.explorerCategory) {
    title = getPortfolioCategoryLabel(portfolio.explorerCategory);
  }

  if (portfolio.explorerView === 'detail' && portfolio.selectedItem) {
    title = portfolio.selectedItem.title;
  }

  return (
    <Dialog
      open={portfolio.explorerOpen}
      onClose={handleClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      aria-labelledby="portfolio-explorer-title"
      TransitionProps={{
        onExited: () => {
          portfolio.finishCloseExplorer();
        },
      }}
    >
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {portfolio.explorerView === 'detail' ? (
            <IconButton edge="start" aria-label="Back to gallery" onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
          ) : null}
          <Typography
            id="portfolio-explorer-title"
            variant="h6"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
          <IconButton edge="end" aria-label="Close portfolio" onClick={() => portfolio.closeExplorer()}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        {portfolio.explorerView === 'gallery' ? <PortfolioCategoryGallery /> : <PortfolioJobDetail />}
      </Box>
    </Dialog>
  );
});
