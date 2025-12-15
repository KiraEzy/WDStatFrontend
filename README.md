# WDStat - Serverless Data Visualization

A modern serverless data visualization application built with React, AWS Lambda, and DynamoDB for workforce data analytics.

## 🏗️ Architecture Overview

- **Frontend**: React application with Chart.js for data visualization, hosted on GitHub Pages
- **Backend**: Node.js 20.x AWS Lambda functions using AWS SDK v3
- **Database**: Amazon DynamoDB (NoSQL)
- **Communication**: REST API calls from frontend to Lambda Function URLs

## 📁 Project Structure

```
WDStat/
├── frontend/                 # React application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.js # Main dashboard with charts
│   │   │   └── Dashboard.css
│   │   ├── services/        # API service layer
│   │   │   └── api.js       # Axios configuration & API calls
│   │   ├── utils/           # Utility functions
│   │   │   └── chartConfig.js # Chart.js configuration
│   │   └── App.js           # Main React app
│   └── package.json
├── backend/                 # AWS Lambda functions
│   ├── functions/           # Lambda handlers
│   │   └── attendance-search.js # Attendance data API
│   ├── lib/                 # Shared backend utilities
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- AWS CLI (for deployment)
- AWS Account with appropriate permissions

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API endpoint:**
   Create a `.env` file in the `frontend` directory:
   ```env
   REACT_APP_API_BASE_URL=https://your-lambda-function-url.amazonaws.com
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure AWS Environment:**
   Set up your AWS credentials and region:
   ```bash
   aws configure
   ```

3. **Deploy Lambda Functions:**
   - Create Lambda functions in AWS Console or use AWS SAM
   - Set environment variables:
     - `ATTENDANCE_TABLE`: Your DynamoDB table name
     - `AWS_REGION`: Your AWS region

## 🔧 Development

### Frontend Development

- **Adding new charts:** Use `react-chartjs-2` components in the `components/` directory
- **API calls:** Add new methods to `src/services/api.js`
- **Styling:** Use CSS modules or styled-components for component styling

### Backend Development

- **Lambda handlers:** Follow the pattern in `backend/functions/attendance-search.js`
- **CORS:** All responses include proper CORS headers
- **Error handling:** Use try/catch blocks and return appropriate HTTP status codes

### Database Schema

Example DynamoDB item structure for attendance data:
```json
{
  "date": "2024-01-01",
  "employeeId": "EMP001",
  "department": "Engineering",
  "status": "present",
  "timestamp": "2024-01-01T09:00:00Z"
}
```

## 📊 Available Endpoints

### GET /attendance/search
Search attendance records with optional filters.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `employeeId` (optional): Filter by specific employee
- `department` (optional): Filter by department

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 50,
  "message": "Attendance data retrieved successfully"
}
```

## 🚀 Deployment

### Frontend Deployment (GitHub Pages)

1. **Build the application:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to GitHub Pages:**
   - Push to GitHub repository
   - Enable GitHub Pages in repository settings
   - Select `gh-pages` branch or GitHub Actions for automated deployment

### Backend Deployment (AWS Lambda)

1. **Package the function:**
   ```bash
   cd backend
   zip -r function.zip .
   ```

2. **Deploy via AWS Console:**
   - Upload the ZIP file to Lambda
   - Configure environment variables
   - Set up Function URL with CORS enabled

3. **Alternative: AWS SAM**
   ```bash
   # Create template.yaml and use SAM CLI
   sam deploy --guided
   ```

## 🔒 Security Considerations

- **Environment Variables:** Never commit `.env` files containing sensitive data
- **AWS Credentials:** Use IAM roles with minimal required permissions
- **CORS:** Configure appropriate origins for production
- **Input Validation:** Validate all API inputs on the backend

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
Add unit tests for Lambda functions using Jest or similar frameworks.

## 📈 Performance Optimization

- **Chart.js:** Only register required chart components to minimize bundle size
- **API Calls:** Implement caching and pagination for large datasets
- **Lambda:** Use appropriate memory allocation and timeout settings
- **DynamoDB:** Use Query instead of Scan operations when possible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
- Check the [Issues](../../issues) page
- Review the [Project Documentation](./docs/)
- Contact the development team

---

Built with ❤️ using React, AWS Lambda, and DynamoDB
