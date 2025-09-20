import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Stack,
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import { nanoid } from 'nanoid';
import Log from '../logger';

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

const ShortenerPage = () => {
  const [urls, setUrls] = useState(Array(5).fill().map(() => ({
    longUrl: '',
    shortcode: '',
    validity: 30, // default 30 minutes
    created: null,
    expiry: null,
    shortUrl: ''
  })));
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [shortenedUrls, setShortenedUrls] = useState([]);

  // Validate all inputs
  const validate = () => {
    const newErrors = {};
    let isValid = true;
    
    urls.forEach((url, index) => {
      // Skip empty URLs (they're optional)
      if (!url.longUrl) return;
      
      // Validate URL format
      if (!URL_REGEX.test(url.longUrl)) {
        newErrors[`url-${index}`] = 'Please enter a valid URL';
        isValid = false;
      }
      
      // Validate validity period
      if (url.validity && (isNaN(url.validity) || url.validity <= 0)) {
        newErrors[`validity-${index}`] = 'Validity must be a positive number';
        isValid = false;
      }
      
      // Validate shortcode if provided
      if (url.shortcode && (url.shortcode.length < 4 || url.shortcode.length > 8 || !/^[a-zA-Z0-9]+$/.test(url.shortcode))) {
        newErrors[`shortcode-${index}`] = 'Shortcode must be 4-8 alphanumeric characters';
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle input changes
  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value };
    setUrls(newUrls);
    
    // Clear error for this field if it exists
    if (errors[`${field}-${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${field}-${index}`];
      setErrors(newErrors);
    }
  };

  // Generate shortened URLs
  const shortenUrls = () => {
    if (!validate()) {
      Log('frontend', 'warn', 'component', 'URL shortening validation failed');
      return;
    }
    
    // Log the operation start
    Log('frontend', 'info', 'component', 'Starting URL shortening process');
    
    const currentTime = new Date();
    const newShortenedUrls = [];
    
    urls.forEach(url => {
      // Skip empty URLs
      if (!url.longUrl) return;
      
      // Generate shortcode if not provided
      const shortcode = url.shortcode || nanoid(6);
      
      // Calculate expiry time
      const expiryTime = new Date(currentTime);
      expiryTime.setMinutes(expiryTime.getMinutes() + parseInt(url.validity || 30));
      
      const shortenedUrl = {
        originalUrl: url.longUrl,
        shortcode: shortcode,
        shortUrl: `${window.location.origin}/${shortcode}`,
        createdAt: currentTime.toISOString(),
        expiresAt: expiryTime.toISOString(),
        clicks: 0,
        clickDetails: []
      };
      
      newShortenedUrls.push(shortenedUrl);
      
      // Log each successful shortening
      Log('frontend', 'info', 'component', `URL shortened: ${url.longUrl} to ${shortcode}`);
    });
    
    // Store in localStorage
    const existingUrls = JSON.parse(localStorage.getItem('shortenedUrls')) || [];
    const updatedUrls = [...existingUrls, ...newShortenedUrls];
    localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls));
    
    setShortenedUrls(newShortenedUrls);
    setSuccess(true);
    
    // Reset form
    setUrls(Array(5).fill().map(() => ({
      longUrl: '',
      shortcode: '',
      validity: 30,
      created: null,
      expiry: null,
      shortUrl: ''
    })));
    
    // Log completion
    Log('frontend', 'info', 'component', `Created ${newShortenedUrls.length} shortened URLs`);
  };

  // Handle URL submission
  const handleSubmit = (e) => {
    e.preventDefault();
    shortenUrls();
  };

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        URL Shortener
      </Typography>
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccess(false)}
        >
          URLs shortened successfully!
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Enter up to 5 URLs to shorten
          </Typography>
          
          {urls.map((url, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={`URL ${index + 1}`}
                  variant="outlined"
                  value={url.longUrl}
                  onChange={(e) => handleChange(index, 'longUrl', e.target.value)}
                  error={!!errors[`url-${index}`]}
                  helperText={errors[`url-${index}`] || ''}
                  placeholder="https://example.com"
                />
              </Grid>
              <Grid item xs={4} md={2}>
                <TextField
                  fullWidth
                  label="Validity (min)"
                  variant="outlined"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={url.validity}
                  onChange={(e) => handleChange(index, 'validity', e.target.value)}
                  error={!!errors[`validity-${index}`]}
                  helperText={errors[`validity-${index}`] || ''}
                />
              </Grid>
              <Grid item xs={8} md={4}>
                <TextField
                  fullWidth
                  label="Custom Shortcode (optional)"
                  variant="outlined"
                  value={url.shortcode}
                  onChange={(e) => handleChange(index, 'shortcode', e.target.value)}
                  error={!!errors[`shortcode-${index}`]}
                  helperText={errors[`shortcode-${index}`] || '4-8 alphanumeric chars'}
                  placeholder="abc123"
                />
              </Grid>
            </Grid>
          ))}
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ mt: 2 }}
            fullWidth
          >
            Shorten URLs
          </Button>
        </form>
      </Paper>
      
      {shortenedUrls.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Your Shortened URLs
          </Typography>
          
          <Stack spacing={2}>
            {shortenedUrls.map((url, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Original URL
                      </Typography>
                      <Typography variant="body1" noWrap>
                        {url.originalUrl}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider>
                        <Chip label="Shortened To" />
                      </Divider>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Short URL
                      </Typography>
                      <Typography 
                        variant="body1" 
                        component="a" 
                        href={url.shortUrl}
                        target="_blank"
                        sx={{ color: 'primary.main', textDecoration: 'none' }}
                      >
                        {url.shortUrl}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Expires
                      </Typography>
                      <Typography variant="body1">
                        {new Date(url.expiresAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </div>
  );
};

export default ShortenerPage;
