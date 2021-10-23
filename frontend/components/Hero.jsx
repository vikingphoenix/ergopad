import { Grid, Typography, Button, Box }  from '@mui/material';

const Hero = ({ title, subtitle }) => {
  return (
    <Grid container spacing={2} sx={{ pt: 10 }}>
      <Grid item xs={12} sm={7} sx={{ mb: 8 }}>
        <Typography variant='h1'>{title}</Typography>
        <Typography
          variant='subtitle1'
        >
          {subtitle}
        </Typography>
        <Typography
          variant='subtitle1'
        >
          Follow our announcement channels to receive updates and be the first to invest in the ErgoPad token IDO and new projects:
        </Typography>

        <Box sx={{ textAlign: 'center', mb: '3rem' }}>
          <a href="http://t.me/ergopad" target="_blank">
            <Button 
              variant="contained"
              sx={{
                color: '#fff',
                fontSize: '1rem',
                py: '0.6rem',
                px: '1.2rem',
                mr: '1.7rem',
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
              Telegram
            </Button>
          </a>

          <a href="https://discord.gg/ZpCqFCjT4g" target="_blank">
            <Button 
              variant="contained"
              sx={{
                color: '#fff',
                fontSize: '1rem',
                py: '0.6rem',
                px: '1.2rem',
                textTransform: 'none',
                backgroundColor: '#9f7aea',
                '&:hover': {
                  backgroundColor: '#B886F9',
                  boxShadow: 'none',
                },
                '&:active': {
                  backgroundColor: '#A88CE3',
                },

              }}
            >
              Discord
            </Button>
          </a>
        </Box>

      </Grid>
      <Grid item xs={12} sm={5}></Grid>
    </Grid>
  );
};

export default Hero;
