import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export const Section = ({
  id,
  title,
  children,
  sx,
  contentSx,
  centerContent = false,
  containerMaxWidth = 'md',
}) => {
  return (
    <Box
      component="section"
      id={id}
      aria-labelledby={title ? `${id}-heading` : undefined}
      sx={{
        py: { xs: 5, md: 8 },
        width: '100%',
        ...sx,
      }}
    >
      <Container
        maxWidth={containerMaxWidth}
        sx={{
          px: { xs: 2.5, sm: 3 },
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            width: '100%',
            minWidth: 0,
            mx: centerContent ? 'auto' : undefined,
            textAlign: centerContent ? { xs: 'left', md: 'center' } : 'left',
            ...contentSx,
          }}
        >
          {title ? (
            <Box
              component="h2"
              id={`${id}-heading`}
              sx={{
                m: 0,
                mb: { xs: 3, md: 4 },
                typography: 'h2',
              }}
            >
              {title}
            </Box>
          ) : null}
          {children}
        </Box>
      </Container>
    </Box>
  );
};
