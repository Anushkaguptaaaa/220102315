import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Paper,
  Container,
  Alert
} from '@mui/material';
import Log from '../logger';

const RedirectPage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectToOriginalUrl = async () => {
      try {
        Log('frontend', 'info', 'route', `Attempting to redirect from shortcode: ${shortCode}`);
        
        const urls = JSON.parse(localStorage.getItem('shortenedUrls')) || [];
        
        const urlData = urls.find(url => url.shortcode === shortCode);
        
        if (!urlData) {
          Log('frontend', 'error', 'route', `Shortcode not found: ${shortCode}`);
          setError('The shortened URL you are trying to access does not exist.');
          setIsLoading(false);
          return;
        }
        
        if (new Date(urlData.expiresAt) < new Date()) {
          Log('frontend', 'warn', 'route', `Expired shortcode accessed: ${shortCode}`);
          setError('This shortened URL has expired.');
          setIsLoading(false);
          return;
        }
        
        const clickDetails = {
          timestamp: new Date().toISOString(),
          source: document.referrer || 'Direct',
          location: 'Local'
        };
        
        urlData.clicks += 1;
        urlData.clickDetails = [...(urlData.clickDetails || []), clickDetails];
        
        const updatedUrls = urls.map(url => 
          url.shortcode === shortCode ? urlData : url
        );
        localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls));
        
        Log('frontend', 'info', 'route', `Redirecting to: ${urlData.originalUrl}`);
        
        window.location.href = urlData.originalUrl.startsWith('http') 
          ? urlData.originalUrl 
          : `http://${urlData.originalUrl}`;
        
      } catch (error) {
        Log('frontend', 'error', 'route', `Redirect error: ${error.message}`);
        setError('An error occurred while processing your request.');
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      redirectToOriginalUrl();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [shortCode, navigate]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Redirect Error
          </Typography>
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
          <Typography variant="body1">
            Please check the URL or return to the <a href="/">homepage</a>.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {isLoading && <CircularProgress size={60} />}
        <Typography variant="h6" sx={{ mt: 3 }}>
          Redirecting...
        </Typography>
      </Box>
    </Container>
  );
};

export default RedirectPage;
