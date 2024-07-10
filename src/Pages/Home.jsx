import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Box, Typography, Button } from '@mui/material';

function Home() {
  const [progresss, setProgresss] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/progress');
      setProgresss(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSendEmail = async () => {
    try {
      await axios.post('http://localhost:8081/api/sendEmail');
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <Box>
    <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1}>
    <Typography variant="h5" gutterBottom>
      Revenue data 
      </Typography>
      <Button variant="contained" onClick={handleSendEmail} sx={{ marginLeft: 2, marginBottom: 2 }}>
        Send Email
      </Button>
    </Box>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'black' }}>
            <TableCell sx={{ color: 'white' }}>ID</TableCell>
            <TableCell sx={{ color: 'white' }}>Revenue</TableCell>
            <TableCell sx={{ color: 'white' }}>Growth</TableCell>
            <TableCell sx={{ color: 'white' }}>Active Customers</TableCell>
            <TableCell sx={{ color: 'white' }}>Financial Year</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>
          {progresss.map((progress) => (
            <TableRow key={progress.id}>
              <TableCell>{progress.id}</TableCell>
              <TableCell>{progress.revenue}</TableCell>
              <TableCell>{progress.revenue_growth}</TableCell>
              <TableCell>{progress.active_customers}</TableCell>
              <TableCell>{progress.year}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default Home;