import { AppBar, Container, Toolbar, flexbox, useTheme, useMediaQuery, Box, IconButton, Button } from '@mui/material';
import { styled } from '@mui/system';
import Home from '@mui/icons-material/Home';
import MuiNextLink from '@components/MuiNextLink';
import Navbar from './Navbar';
// import SideDrawer from './SideDrawer';
// import HideOnScroll from './HideOnScroll';
// import Fab from '@mui/material/Fab';
// import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
// import BackToTop from './BackToTop';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export const navLinks = [
  { title: `Home`, path: `/` },
  { title: `About`, path: `/about` },
  { title: `Token Info`, path: `/token` },
  { title: `Staking`, path: `/staking` },
  { title: `Dashboard`, path: `/dashboard` },
];

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static' color='transparent' sx={{ boxShadow: 'none', p: 0 }}>
          <Toolbar disableGutters={true}>
              <MuiNextLink activeClassName='active' href='/' sx={{ pr: '2rem' }}>
                <IconButton>
					<svg width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
						<linearGradient id="b" x2="32" y1="8" y2="8" gradientUnits="userSpaceOnUse">
							<stop stopColor="#3ABAB4" offset=".2813"/>
							<stop stopColor="#7F9CF5" offset="1"/>
						</linearGradient>
						<polygon points="27.3 4.7 16 0 4.7 4.7 0 16 7.8 16 10.2 10.2 16 7.8 21.8 10.2 24.2 16 32 16" fill="url(#b)"/>
						<linearGradient id="a" x2="32" y1="24" y2="24" gradientUnits="userSpaceOnUse">
							<stop stopColor="#3ABAB4" offset=".2864"/>
							<stop stopColor="#3ABAB4" stopOpacity="0" offset="1"/>
						</linearGradient>
						<polygon points="24.2 16 21.8 21.8 16 24.2 10.2 21.8 7.8 16 0 16 4.7 27.3 16 32 27.3 27.3 32 16" fill="url(#a)"/>
					</svg>
                </IconButton>
              </MuiNextLink>

              <Navbar navLinks={navLinks} />

              <Button
                variant="contained"
                sx={{
                  color: '#fff',
                  fontSize: '1rem',
                  px: '1.2rem',
                  textTransform: 'none',
                  backgroundColor: '#3ABAB4',
                  '&:hover': {
                    backgroundColor: '#4BD0C9',
                    boxShadow: 'none',
                  },
                  '&:active': {
                    backgroundColor: '#3ABAB496',
                  },
                }}
              >
                Connect Wallet
              </Button>
              {/* {!isMobile && <SideDrawer navLinks={navLinks} />} */}
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
};

export default Header;
