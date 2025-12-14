import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import apiService from '../services/api';
import '../utils/chartConfig';
import './Dashboard.css';

const Dashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch attendance data on component mount
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Example API call - adjust parameters as needed
        const data = await apiService.searchAttendance({
          date: '2024-01-01', // Replace with dynamic date selection
          department: 'all'
        });

        setAttendanceData(data.data || []);
      } catch (err) {
        console.error('Failed to fetch attendance data:', err);
        setError('Failed to load attendance data. Please try again.');
        // For demo purposes, set mock data if API fails
        setMockData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Mock data for demonstration when API is not available
  const setMockData = () => {
    const mockData = [
      { department: 'Engineering', present: 45, absent: 5 },
      { department: 'Marketing', present: 32, absent: 8 },
      { department: 'Sales', present: 28, absent: 12 },
      { department: 'HR', present: 15, absent: 3 },
      { department: 'Finance', present: 22, absent: 6 }
    ];
    setAttendanceData(mockData);
  };

  // Prepare data for bar chart (attendance by department)
  const barChartData = {
    labels: attendanceData.map(item => item.department),
    datasets: [
      {
        label: 'Present',
        data: attendanceData.map(item => item.present),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Absent',
        data: attendanceData.map(item => item.absent),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for pie chart (total attendance distribution)
  const totalPresent = attendanceData.reduce((sum, item) => sum + item.present, 0);
  const totalAbsent = attendanceData.reduce((sum, item) => sum + item.absent, 0);

  const pieChartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [totalPresent, totalAbsent],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Attendance by Department',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Overall Attendance Distribution',
        font: {
          size: 16,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <h2>WDStat Dashboard</h2>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>WDStat Dashboard</h2>
        <p className="error-message">{error}</p>
        <p className="demo-notice">Currently showing demo data for visualization purposes.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>WDStat - Workforce Data Statistics</h1>

      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <p className="stat-number">{totalPresent + totalAbsent}</p>
        </div>
        <div className="stat-card">
          <h3>Present Today</h3>
          <p className="stat-number">{totalPresent}</p>
        </div>
        <div className="stat-card">
          <h3>Absent Today</h3>
          <p className="stat-number">{totalAbsent}</p>
        </div>
        <div className="stat-card">
          <h3>Attendance Rate</h3>
          <p className="stat-number">
            {((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <Bar data={barChartData} options={barChartOptions} />
        </div>

        <div className="chart-wrapper">
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
