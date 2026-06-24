import Box from '@mui/material/Box';

export const CardGrid = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        width: '100%',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
        },
        gap: { xs: 2.5, md: 3 },
      }}
    >
      {children}
    </Box>
  );
};
