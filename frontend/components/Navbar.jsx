import { useMediaQuery, Stack, Toolbar, useTheme } from '@mui/material';
import MuiNextLink from './MuiNextLink';
import ErgoDashLogo from './stylistic/ErgoDash';

const Navbar = ({ navLinks }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    
      <Stack direction='row' spacing={4} sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, height: '5rem', py: 'auto' }}>
        {!isMobile && (
          <>
            {navLinks.map(({ title, path }, i) => (
              <MuiNextLink
                key={`${title}${i}`}
                href={path}
                variant='button'
                sx={{
                  color: 'rgb(215, 215, 218)',
                  '&:hover': {
                    color: 'white',
                  },
                  textTransform: 'none',
                  fontWeight: '500',
                  fontSize: '1rem',
                  px: '0.5rem'
                }}
                underline='none'
              >
                {title}
              </MuiNextLink>
            ))}
          </>
        )}
      </Stack>

  );
};

export default Navbar;
