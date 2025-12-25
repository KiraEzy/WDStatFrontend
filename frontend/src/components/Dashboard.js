import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import apiService from '../services/api';
import '../utils/chartConfig';
import './Dashboard.css';

const Dashboard = () => {
  const [metricsCountData, setMetricsCountData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });

  // Country code to full name mapping
  const countryNames = {
    'CAN': 'Canada',
    'USA': 'United States',
    'GER': 'Germany',
    'SOV': 'Soviet Union',
    'UK': 'United Kingdom',
    'JAP': 'Japan',
    'ITA': 'Italy',
    'FRA': 'France',
    'UNKNOWN': 'Unknown'
  };

  // Fetch metrics count data
  useEffect(() => {
    fetchMetricsCount();
  }, [dateFilter.startDate, dateFilter.endDate]);

  const fetchMetricsCount = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await apiService.getMetricsCount(
        dateFilter.startDate || undefined,
        dateFilter.endDate || undefined
      );

      if (data.success) {
        setMetricsCountData(data.data || []);
        setSummary(data.summary || null);
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Failed to fetch metrics count:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load metrics data. ';
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage += 'Network error - this is usually a CORS issue. Please check that the Lambda Function URL has CORS enabled.';
      } else if (err.response) {
        errorMessage += `Server returned error: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
        errorMessage += 'No response received from server. Please check the Function URL.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
      // Set empty data on error
      setMetricsCountData([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
  };

  // Prepare data for bar chart (counts by country)
  const barChartData = {
    labels: metricsCountData.map(item => countryNames[item.WDM_playing_as] || item.WDM_playing_as),
    datasets: [
      {
        label: 'Number of Records',
        data: metricsCountData.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for pie chart (distribution by country)
  const pieChartData = {
    labels: metricsCountData.map(item => countryNames[item.WDM_playing_as] || item.WDM_playing_as),
    datasets: [
      {
        data: metricsCountData.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
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
        text: 'World Domination Metrics by Country',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Distribution by Country',
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
        <p>Loading world domination metrics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>WDStat - World Domination Metrics</h1>

      {/* Date Filter Section */}
      <div className="filter-section">
        <h3>Filter by Date Range</h3>
        <div className="filter-controls">
          <div className="filter-input-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={dateFilter.startDate}
              onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="filter-input-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={dateFilter.endDate}
              onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
            />
          </div>
          <button onClick={clearFilters} className="clear-filter-btn">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <p className="error-message">{error}</p>
        </div>
      )}

      {/* Summary Statistics */}
      {summary && (
        <div className="stats-summary">
          <div className="stat-card">
            <h3>Total Records</h3>
            <p className="stat-number">{summary.total_records || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Countries</h3>
            <p className="stat-number">{summary.total_countries || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Average per Country</h3>
            <p className="stat-number">
              {summary.total_countries > 0 
                ? (summary.total_records / summary.total_countries).toFixed(1)
                : 0}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      {metricsCountData.length > 0 ? (
        <div className="charts-container">
          <div className="chart-wrapper">
            <Bar data={barChartData} options={barChartOptions} />
          </div>

          <div className="chart-wrapper">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      ) : (
        !isLoading && (
          <div className="no-data">
            <p>No data available. Try adjusting your date filters.</p>
          </div>
        )
      )}

      {/* Data Table */}
      {metricsCountData.length > 0 && (
        <div className="data-table-section">
          <h3>Counts by Country</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Country Code</th>
                <th>Country Name</th>
                <th>Record Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {metricsCountData.map((item, index) => {
                const percentage = summary?.total_records > 0
                  ? ((item.count / summary.total_records) * 100).toFixed(1)
                  : 0;
                return (
                  <tr key={index}>
                    <td>{item.WDM_playing_as}</td>
                    <td>{countryNames[item.WDM_playing_as] || 'Unknown'}</td>
                    <td>{item.count}</td>
                    <td>{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
