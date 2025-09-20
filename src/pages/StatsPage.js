import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Link,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BarChartIcon from '@mui/icons-material/BarChart';
import Log from '../logger';

const StatsPage = () => {
  const [urls, setUrls] = useState([]);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    Log('frontend', 'info', 'page', 'Statistics page viewed');
    
    const loadData = () => {
      try {
        const storedUrls = JSON.parse(localStorage.getItem('shortenedUrls')) || [];
        
        if (storedUrls.length === 0) {
          setNoData(true);
          Log('frontend', 'info', 'page', 'No shortened URLs found in storage');
        } else {
          setUrls(storedUrls);
          Log('frontend', 'info', 'page', `Loaded ${storedUrls.length} shortened URLs from storage`);
        }
      } catch (error) {
        Log('frontend', 'error', 'page', `Error loading URLs: ${error.message}`);
        setNoData(true);
      }
    };
    
    loadData();
  }, []);

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        URL Statistics
      </Typography>
      
      {noData ? (
        <Alert severity="info">
          No shortened URLs found. Create some URLs first!
        </Alert>
      ) : (
        <>
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h3">{urls.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Active URLs</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h3">
                      {urls.reduce((sum, url) => sum + url.clicks, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Clicks</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h3">
                      {urls.length > 0 
                        ? Math.round(urls.reduce((sum, url) => sum + url.clicks, 0) / urls.length) 
                        : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Average Clicks per URL</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Typography variant="h6" gutterBottom>
            <LinkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            All URLs
          </Typography>
          
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Short URL</TableCell>
                  <TableCell>Original URL</TableCell>
                  <TableCell align="center">Clicks</TableCell>
                  <TableCell align="right">Created</TableCell>
                  <TableCell align="right">Expires</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {urls.map((url, index) => (
                  <React.Fragment key={index}>
                    <TableRow hover>
                      <TableCell>
                        <Link 
                          href={url.shortUrl} 
                          target="_blank" 
                          underline="hover"
                          onClick={() => Log('frontend', 'info', 'page', `Short URL clicked from statistics: ${url.shortcode}`)}
                        >
                          {url.shortUrl}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography noWrap title={url.originalUrl}>
                          {url.originalUrl}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{url.clicks}</TableCell>
                      <TableCell align="right">{formatDate(url.createdAt)}</TableCell>
                      <TableCell align="right">
                        {isExpired(url.expiresAt) ? (
                          <Chip size="small" label="Expired" color="error" />
                        ) : (
                          formatDate(url.expiresAt)
                        )}
                      </TableCell>
                    </TableRow>
                    {url.clicks > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ py: 0 }}>
                          <Accordion disableGutters>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="body2">
                                <AccessTimeIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                Click Details
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Source</TableCell>
                                    <TableCell>Location</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {(url.clickDetails || []).map((click, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>{formatDate(click.timestamp)}</TableCell>
                                      <TableCell>{click.source || 'Direct'}</TableCell>
                                      <TableCell>{click.location || 'Unknown'}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </AccordionDetails>
                          </Accordion>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {urls.length === 0 && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                No active shortened URLs found.
              </Alert>
            </Box>
          )}
        </>
      )}
    </div>
  );
};

export default StatsPage;
