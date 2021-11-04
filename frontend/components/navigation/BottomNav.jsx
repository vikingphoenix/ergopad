import {
  AutoGraphOutlined,
  DashboardOutlined,
  FiberSmartRecordOutlined,
  HomeOutlined,
  MenuOutlined
} from '@mui/icons-material';
import { Drawer, Typography, Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import MuiNextLink from '@components/MuiNextLink';

const drawerLinks = [
  { title: `About`, path: `/about` },
  { title: 'Legal', path: '/legal' },
  { title: 'Contact', path: '/contact' },
  { title: 'Documentation', path: '/documentation' },
  { title: 'Tutorials', path: '/guides' },
  { title: 'FAQ', path: '/faq' },
  { title: 'Legal', path: '/legal' },
];

const bottomNavLinks = [
  {
    label: 'Token',
    link: '/token',
    icon: <FiberSmartRecordOutlined />,
  },
  {
    label: 'Staking',
    link: '/staking',
    icon: <AutoGraphOutlined />,
  },
  {
    label: 'Home',
    link: '/',
    icon: <HomeOutlined />,
  },
  {
    label: 'Dashboard',
    link: '/dashboard',
    icon: <DashboardOutlined />,
  },
];

const root = { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1 };

const BottomNav = () => {
  const router = useRouter();
  const [state, setState] = useState({
    left: false,
  });
  const [value, setValue] = useState(router.pathname);
  
  const handleChange = (_, newValue) => {
    setValue(newValue);
    router.push(newValue);
  };

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <Box
      sx={{ width: 250, marginTop: `auto`, marginBottom: `auto` }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      {drawerLinks.map(({ title, path }, i) => (
        <Typography
          key={`${title}${i}`}
          sx={{
            ml: 5,
            my: 2,
          }}
        >
          <MuiNextLink sx={{ color: "common.white" }} href={path}>
            {title}
          </MuiNextLink>
        </Typography>
      ))}
    </Box>
  );

  return (
    <>
    <BottomNavigation showLabels value={value} sx={root} onChange={handleChange}>
      {bottomNavLinks.map((link, i) => (
          <BottomNavigationAction
            key={`${i}_${link.label}`}
            label={link.label}
            value={link.link}
            icon={link.icon}
          />
      ))}
      <BottomNavigationAction
          onClick={toggleDrawer("left", true)}
          key='more'
          label='More'
          value=''
          icon={<MenuOutlined />}
        />
    </BottomNavigation> 

    <Drawer
        anchor="left"
        open={state.left}
        onClose={toggleDrawer("left", false)}
        sx={{
          ".MuiDrawer-paper": {
            
          },
        }}
      >
        {list("left")}
      </Drawer>
  </>
  );
};

export default BottomNav;
