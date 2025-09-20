import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ShortenerPage from './pages/ShortenerPage';
import StatsPage from './pages/StatsPage';
import RedirectPage from './pages/RedirectPage';
import Log from './logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const location = useLocation();
  
  React.useEffect(() => {
    Log('frontend', 'info', 'component', 'URL Shortener application started');
  }, []);
  
  const isRedirectPath = location.pathname.match(/^\/[a-zA-Z0-9]{4,8}$/);
  
  if (isRedirectPath) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/:shortCode" element={<RedirectPage />} />
        </Routes>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
        </Toolbar>
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <Tabs 
            value={location.pathname} 
            centered
            onChange={(e, newValue) => {
              Log('frontend', 'info', 'component', `Navigated to ${newValue}`);
            }}
          >
            <Tab label="Shorten URL" value="/" component="a" href="/" />
            <Tab label="Statistics" value="/stats" component="a" href="/stats" />
          </Tabs>
        </Box>
      </AppBar>
      <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<ShortenerPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

export default App;
