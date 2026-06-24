'use client';

import Box from '@mui/material/Box';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { CapabilitiesSection } from '@/components/sections/CapabilitiesSection';
import { PortfolioSection } from '@/components/sections/PortfolioSection';
import { ServiceAreaSection } from '@/components/sections/ServiceAreaSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { AnalyticsBootstrap } from '@/components/AnalyticsBootstrap';

export const LandingPage = () => {
  return (
    <Box>
      <AnalyticsBootstrap />
      <Header />
      <Box component="main">
        <HeroSection />
        <ServicesSection />
        <CapabilitiesSection />
        <PortfolioSection />
        <ServiceAreaSection />
        <ContactSection />
      </Box>
      <Footer />
    </Box>
  );
};
