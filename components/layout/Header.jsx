'use client';

import { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { AdminNavLink } from '@/components/layout/AdminNavLink';
import { useStore } from '@/components/StoreProvider';
import { BUSINESS } from '@/lib/constants';
import { trackCtaClick, sendGaEvent } from '@/services/client/analyticsClientService';

const NAV_ITEMS = [
  { label: 'Services', href: '#services' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Service Area', href: '#service-area' },
  { label: 'Contact', href: '#contact' },
];

const handleNavClick = (href, label) => {
  trackCtaClick(href, { cta: 'nav', label });
  sendGaEvent('cta_click', { cta_type: 'nav', label });
};

const scrollToSection = (href) => {
  if (typeof window === 'undefined') {
    return;
  }

  const element = document.querySelector(href);

  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const Header = observer(() => {
  const store = useStore();
  const pendingScrollHref = useRef(null);

  const navigateTo = (href, label) => {
    handleNavClick(href, label);

    if (store.ui.mobileNavOpen) {
      pendingScrollHref.current = href;
      store.ui.closeMobileNav();
      return;
    }

    scrollToSection(href);
  };

  const handleDrawerExited = () => {
    if (!pendingScrollHref.current) {
      return;
    }

    const href = pendingScrollHref.current;
    pendingScrollHref.current = null;
    scrollToSection(href);
  };

  const navList = (
    <List sx={{ width: 260 }}>
      {NAV_ITEMS.map((item) => (
        <ListItem key={item.href} disablePadding>
          <ListItemButton onClick={() => navigateTo(item.href, item.label)}>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
      <ListItem disablePadding>
        <ListItemButton
          component="a"
          href={BUSINESS.phoneHref}
          onClick={() => {
            store.ui.closeMobileNav();
          }}
        >
          <ListItemText primary="Call" secondary={BUSINESS.phone} />
        </ListItemButton>
      </ListItem>
    </List>
  );

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            px: { xs: 2.5, sm: 3 },
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Toolbar disableGutters sx={{ minHeight: 64, gap: 1 }}>
            <Typography
              component="a"
              href="#top"
              variant="h6"
              sx={{
                flexGrow: 1,
                minWidth: 0,
                fontWeight: 700,
                color: 'text.primary',
                textDecoration: 'none',
                fontSize: { xs: '0.95rem', sm: '1.125rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {BUSINESS.name}
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
              {NAV_ITEMS.map((item) => (
                <Button key={item.href} color="inherit" onClick={() => navigateTo(item.href, item.label)}>
                  {item.label}
                </Button>
              ))}
              <ThemeToggle />
              <AdminNavLink />
              <Button variant="contained" href={BUSINESS.phoneHref} sx={{ ml: 0.5 }}>
                Call
              </Button>
            </Box>

            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <ThemeToggle />
              <AdminNavLink />
              <IconButton
                edge="end"
                aria-label="Open navigation menu"
                onClick={() => store.ui.toggleMobileNav()}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={store.ui.mobileNavOpen}
        onClose={() => store.ui.closeMobileNav()}
        sx={{ display: { md: 'none' } }}
        SlideProps={{ onExited: handleDrawerExited }}
      >
        {navList}
      </Drawer>
    </>
  );
});
