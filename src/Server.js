import express from 'express';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';
import cron from 'node-cron';
import cors from 'cors';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const app = express();
const port = 8081;

let connection;

async function createConnection() {
  connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'percient'
  });
}

const generateChartImage = async (chartConfig) => {
  const width = 350;
  const height = 350;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  return await chartJSNodeCanvas.renderToDataURL(chartConfig);
};

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

app.get('/api/progress', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT id, revenue, revenue_growth, active_customers, year FROM progress');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
        user: 'naveenkonda.dev@gmail.com',
        pass: 'zfhd ezpu jvss mvdi'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let mailOptions = {
      from: 'naveenkonda.dev@gmail.com',
      to: 'naveen.konda@percient.com',
      cc: 'naveen.konda@percient.com',
      subject: 'Revenue Data',
      html: tableContent
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
        user: 'naveenkonda.dev@gmail.com',
        pass: 'zfhd ezpu jvss mvdi'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let mailOptions = {
      from: 'naveenkonda.dev@gmail.com',
      to: 'naveen.konda@percient.com',
      cc: 'naveen.konda@percient.com',
      subject: 'Revenue Data (Daily)',
      html: `${tableContent}`
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('Daily email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending daily email:', error);
  }
};

cron.schedule('25 10 * * *', () => {
  console.log('Running cron job at 11:00 AM');
  sendEmailDaily();
});

app.post('/api/sendDailyEmail', async (req, res) => {
  try {
    await sendEmailDaily();
    res.status(200).json({ message: 'Daily email sent successfully' });
  } catch (error) {
    console.error('Error sending daily email:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
