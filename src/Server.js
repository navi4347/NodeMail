import express from 'express';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';
import cron from 'node-cron';
import cors from 'cors';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const app = express();
const port = 8081;

let connection;

// Create a database connection
async function createConnection() {
  connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'percient'
  });
}

// Function to generate chart images
const generateChartImage = async (chartConfig) => {
  const width = 350; // Reduced width for side-by-side display
  const height = 350; // Reduced height for side-by-side display
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  return await chartJSNodeCanvas.renderToDataURL(chartConfig);
};

// Function to create bar chart config
const createBarChartConfig = (data) => {
  return {
    type: 'bar',
    data: {
      labels: data.map(item => item.year),
      datasets: [{
        label: 'Revenue',
        data: data.map(item => item.revenue),
        backgroundColor: 'rgb(46, 150, 255)',
        borderColor: 'rgb(46, 150, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
};

// Function to create line chart config
const createLineChartConfig = (data) => {
  return {
    type: 'line',
    data: {
      labels: data.map(item => item.year),
      datasets: [{
        label: 'Active Customers',
        data: data.map(item => item.active_customers),
        backgroundColor: 'rgba(46, 150, 255, 0.2)',
        borderColor: 'rgba(46, 150, 255, 1)',
        borderWidth: 1,
        fill: true,
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
};

// Connect to the database before starting the server
createConnection().then(() => {
  console.log('Connected to the database');
  app.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);
  });
}).catch(err => {
  console.error('Error connecting to the database:', err);
});

app.use(express.json());
app.use(cors());

// Endpoint to fetch progress data
app.get('/api/progress', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT id, revenue, revenue_growth, active_customers, year FROM progress');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to send email
app.post('/api/sendEmail', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT id, revenue, revenue_growth, active_customers, year FROM progress');

    const barChartConfig = createBarChartConfig(rows);
    const lineChartConfig = createLineChartConfig(rows);

    const barChartImage = await generateChartImage(barChartConfig);
    const lineChartImage = await generateChartImage(lineChartConfig);

    let tableContent = `
      <p>Dear recipient,</p>
      <p>Please find the Revenue data below:</p>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #4CAF50;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        tr:hover {
          background-color: #ddd;
        }
        .chart-container {
          display: flex;
          justify-content: space-between;
        }
      </style>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Revenue</th>
            <th>Growth</th>
            <th>Customers</th>
            <th>Financial Year</th>
          </tr>
        </thead>
        <tbody>`;

    // Iterate over rows to add data to the table
    rows.forEach(progress => {
      tableContent += `
        <tr>
          <td>${progress.id}</td>
          <td>${progress.revenue}</td>
          <td>${progress.revenue_growth}</td>
          <td>${progress.active_customers}</td>
          <td>${progress.year}</td>
        </tr>`;
    });

    tableContent += `</tbody></table>
      <div class="chart-container">
        <div>
          <p>Revenue Chart:</p>
          <img src="${barChartImage}" alt="Bar Chart" />
        </div>
        <div>
          <p>Customers Chart:</p>
          <img src="${lineChartImage}" alt="Line Chart" />
        </div>
      </div>
      <p>For more information, <a href="http://www.testdata.com" target="_blank">click here to visit</a>.</p>
      <p>Best regards,</p>
      <p>Company Name</p>`;

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'naveenkonda.dev@gmail.com', // Replace with your Gmail email address
        pass: 'zfhd ezpu jvss mvdi' // Replace with your Gmail app password or account password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let mailOptions = {
      from: 'naveenkonda.dev@gmail.com', // Sender address
      to: 'ramesh@percient.com', // Receiver address
      cc: 'naveen.konda@percient.com', // CC address
      subject: 'Revenue Data', // Subject line
      html: tableContent // HTML content of the email
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to send daily email
const sendEmailDaily = async () => {
  try {
    const [rows] = await connection.execute('SELECT id, revenue, revenue_growth, active_customers, year FROM progress');

    const barChartConfig = createBarChartConfig(rows);
    const lineChartConfig = createLineChartConfig(rows);

    const barChartImage = await generateChartImage(barChartConfig);
    const lineChartImage = await generateChartImage(lineChartConfig);

    let tableContent = `
      <p>Dear recipient,</p>
      <p>Please find the daily Revenue data below:</p>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #4CAF50;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        tr:hover {
          background-color: #ddd;
        }
        .chart-container {
          display: flex;
          justify-content: space-between;
        }
      </style>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Revenue</th>
            <th>Growth</th>
            <th>Customers</th>
            <th>Financial Year</th>
          </tr>
        </thead>
        <tbody>`;

    // Iterate over rows to add data to the table
    rows.forEach(progress => {
      tableContent += `
        <tr>
          <td>${progress.id}</td>
          <td>${progress.revenue}</td>
          <td>${progress.revenue_growth}</td>
          <td>${progress.active_customers}</td>
          <td>${progress.year}</td>
        </tr>`;
    });

    tableContent += `</tbody></table>
      <div class="chart-container">
        <div>
          <p>Revenue Chart:</p>
          <img src="${barChartImage}" alt="Bar Chart" />
        </div>
        <div>
          <p>Customers Chart:</p>
          <img src="${lineChartImage}" alt="Line Chart" />
        </div>
      </div>
      <p>For more information, <a href="http://www.testdata.com" target="_blank">click here to visit</a>.</p>
      <p>Best regards,</p>
      <p>Company Name</p>`;

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'naveenkonda.dev@gmail.com', // Replace with your Gmail email address
        pass: 'zfhd ezpu jvss mvdi' // Replace with your Gmail app password or account password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let mailOptions = {
      from: 'naveenkonda.dev@gmail.com', // Sender address
      to: 'ramesh@percient.com', // Receiver address
      cc: 'naveen.konda@percient.com', // CC address
      subject: 'Revenue Data (Daily)', // Subject line for daily email
      html: `${tableContent}` // HTML content of the email
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('Daily email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending daily email:', error);
  }
};

// Schedule cron job to send daily email at 11:00 AM daily
cron.schedule('25 10 * * *', () => {
  console.log('Running cron job at 11:00 AM');
  sendEmailDaily();
});

// Endpoint to manually trigger sending daily email
app.post('/api/sendDailyEmail', async (req, res) => {
  try {
    await sendEmailDaily();
    res.status(200).json({ message: 'Daily email sent successfully' });
  } catch (error) {
    console.error('Error sending daily email:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
