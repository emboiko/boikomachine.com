import Box from '@mui/material/Box';

export const CardGrid = ({ children, columns = 3 }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        width: '100%',
        gridTemplateColumns: {
          xs: '1fr',
          sm: columns === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
          md: `repeat(${columns}, minmax(0, 1fr))`,
        },
        gap: { xs: 2.5, md: 3 },
      }}
    >
      {children}
    </Box>
  );
};
