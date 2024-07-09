import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Box, Typography, Divider, Button } from '@mui/material';

function App() {
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
      // Optionally show a success message or update UI
    } catch (error) {
      console.error('Error sending email:', error);
      // Handle error (e.g., show a message to the user)
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Progress
      </Typography>
      <Divider sx={{ marginBottom: 2 }} />
      <Button variant="contained" onClick={handleSendEmail} sx={{ marginBottom: 2 }}>
        Send Email
      </Button>
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

export default App;
