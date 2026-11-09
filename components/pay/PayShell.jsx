import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

export const PayShell = ({ children }) => {
  return (
    <Box>
      <Header />
      <Container component="main" maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        {children}
      </Container>
      <Footer />
    </Box>
  )
}
