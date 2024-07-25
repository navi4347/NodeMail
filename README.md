# Revenue Data Management System

This project is a Revenue Data Management System built using Node.js, React, and various other libraries. It includes functionalities for sending automated and manual emails with revenue data.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)

## Installation

Follow these steps to install the required dependencies:

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install backend dependencies:
    ```sh
    npm install axios express nodemailer node-cron mysql2 cors
    ```

3. Install frontend dependencies:
    ```sh
    npm install @mui/icons-material @mui/material @emotion/react @emotion/styled chart.js chartjs-node-canvas
    ```

## Usage

1. Start the development server:
    ```sh
    npm run dev
    ```

2. Navigate to the `src` directory and start the server:
    ```sh
    cd src
    node server.js
    ```

## Configuration

### Email Configuration

To configure email sending functionality:

1. Manual Email Sending

    Add a "Send Email" button in your frontend to trigger manual email sending.

2. Automatic Email Sending

    Change the time for automatic email sending in `server.js` at line 309:
    ```js
    cron.schedule('49 18 * * *', () => {
    console.log('Running cron job at 60:49 PM');
    sendEmailDaily();
    });
    ```

3. Update email send and to address information in `server.js` at line 294:
    ```js
    let mailOptions = {
      from: 'naveenkonda.dev@gmail.com',
      to: 'aakash@percient.com',
      cc: 'naveen.konda@percient.com',
      subject: 'Revenue Data (Daily)',
      html: `${tableContent}`
    };
    ```

### Database Configuration

Ensure your MySQL database is configured correctly and accessible. Update the connection details in your project configuration file.

### Chart Configuration

Utilize `chart.js` and `chartjs-node-canvas` to render charts based on the data.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
