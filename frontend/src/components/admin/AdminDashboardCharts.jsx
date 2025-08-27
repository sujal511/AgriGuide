import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  PolarAreaController,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut, PolarArea, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PolarAreaController,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboardCharts = ({ dashboardStats, users, loans, crops }) => {
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
  };

  // User activity chart data with gradient
  const userActivityData = {
    labels: ['New Users', 'Active Users', 'Inactive Users'],
    datasets: [
      {
        label: 'User Statistics',
        data: [
          dashboardStats.newUsersCount || Math.floor(dashboardStats.usersCount * 0.2),
          dashboardStats.activeUsersCount || Math.floor(dashboardStats.usersCount * 0.7),
          dashboardStats.inactiveUsersCount || Math.floor(dashboardStats.usersCount * 0.1),
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 92, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 92, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  // Resource distribution chart data with enhanced colors
  const resourceDistributionData = {
    labels: ['Crops', 'Technologies', 'Schemes', 'Loans'],
    datasets: [
      {
        label: 'Resource Count',
        data: [
          dashboardStats.cropsCount || 51,
          dashboardStats.technologiesCount || 46,
          dashboardStats.schemesCount || 44,
          dashboardStats.loansCount || 89,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  // Loan status distribution chart data
  const loanStatusData = {
    labels: ['Approved', 'Pending', 'Rejected', 'Repaid'],
    datasets: [
      {
        label: 'Loan Status',
        data: [
          loans?.filter(loan => loan.status === 'Approved')?.length || Math.floor(dashboardStats.loansCount * 0.4),
          loans?.filter(loan => loan.status === 'Pending')?.length || Math.floor(dashboardStats.loansCount * 0.3),
          loans?.filter(loan => loan.status === 'Rejected')?.length || Math.floor(dashboardStats.loansCount * 0.1),
          loans?.filter(loan => loan.status === 'Repaid')?.length || Math.floor(dashboardStats.loansCount * 0.2),
        ],
        backgroundColor: [
          'rgba(75, 192, 92, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 92, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  // User registration trend (mock data if not available)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const last6Months = months.slice(currentMonth - 5 >= 0 ? currentMonth - 5 : (currentMonth - 5 + 12), currentMonth + 1);
  
  const userRegistrationData = {
    labels: last6Months,
    datasets: [
      {
        label: 'New User Registrations',
        data: dashboardStats.userRegistrationTrend || 
          [5, 8, 12, 15, 10, 2], // Mock data
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  // NEW: Top Crop Recommendations
  const topCropRecommendationsData = {
    labels: ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize'],
    datasets: [
      {
        label: 'Recommendation Score',
        data: [85, 78, 65, 60, 55],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  // NEW: Scheme Popularity by Region
  const schemePopularityData = {
    labels: ['PM-KISAN', 'Soil Health Card', 'Crop Insurance', 'KUSUM', 'E-NAM'],
    datasets: [
      {
        label: 'User Engagement',
        data: [80, 65, 75, 55, 60],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // NEW: User Engagement Metrics
  const userEngagementData = {
    labels: ['App Visits', 'Resource Downloads', 'Scheme Applications', 'Loan Inquiries', 'Recommendations Used', 'Profile Updates'],
    datasets: [
      {
        label: 'Last Month',
        data: [85, 65, 70, 60, 75, 45],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };

  // NEW: Monthly Crop Yield Comparison
  const cropYieldComparisonData = {
    labels: months,
    datasets: [
      {
        label: 'This Year',
        data: [30, 35, 40, 50, 60, 65, 70, 65, 60, 55, 45, 40],
        backgroundColor: 'rgba(75, 192, 92, 0.5)',
        borderColor: 'rgba(75, 192, 92, 1)',
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: 'Last Year',
        data: [25, 30, 35, 45, 55, 60, 65, 60, 55, 50, 40, 35],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // NEW: Seasonal Crop Performance
  const seasonalCropPerformanceData = {
    labels: ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize'],
    datasets: [
      {
        label: 'Summer',
        data: [65, 40, 85, 75, 60],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Monsoon',
        data: [85, 30, 60, 80, 75],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Winter',
        data: [40, 85, 30, 65, 70],
        backgroundColor: 'rgba(75, 192, 92, 0.7)',
        borderColor: 'rgba(75, 192, 92, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {/* User Activity Chart */}
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">User Activity</h3>
        <div className="h-64">
          <Doughnut 
            data={userActivityData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'User Activity Distribution',
                  display: true,
                }
              },
              cutout: '65%',
            }} 
          />
        </div>
      </div>

      {/* Resource Distribution Chart */}
      <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-md border border-green-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Resource Distribution</h3>
        <div className="h-64">
          <Bar 
            data={resourceDistributionData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Resource Count by Category',
                  display: true,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                  title: {
                    display: true,
                    text: 'Count'
                  }
                },
                x: {
                  grid: {
                    display: false,
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Loan Status Chart */}
      <div className="bg-gradient-to-br from-white to-yellow-50 p-6 rounded-xl shadow-md border border-yellow-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Loan Status</h3>
        <div className="h-64">
          <Pie 
            data={loanStatusData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Loan Applications by Status',
                  display: true,
                }
              }
            }} 
          />
        </div>
      </div>

      {/* User Registration Trend */}
      <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-md border border-purple-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">User Registration Trend</h3>
        <div className="h-64">
          <Line 
            data={userRegistrationData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'New User Registrations (Last 6 Months)',
                  display: true,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                  title: {
                    display: true,
                    text: 'Number of Users'
                  }
                },
                x: {
                  grid: {
                    display: false,
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* NEW: Top Crop Recommendations */}
      <div className="bg-gradient-to-br from-white to-red-50 p-6 rounded-xl shadow-md border border-red-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Crop Recommendations</h3>
        <div className="h-64">
          <PolarArea 
            data={topCropRecommendationsData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Most Recommended Crops',
                  display: true,
                }
              },
              scales: {
                r: {
                  ticks: {
                    backdropColor: 'transparent',
                    color: 'rgba(0, 0, 0, 0.7)',
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* NEW: Scheme Popularity */}
      <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-md border border-orange-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Scheme Popularity</h3>
        <div className="h-64">
          <Bar 
            data={schemePopularityData} 
            options={{
              ...chartOptions,
              indexAxis: 'y',
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'User Engagement with Government Schemes',
                  display: true,
                }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                  title: {
                    display: true,
                    text: 'Engagement Score'
                  }
                },
                y: {
                  grid: {
                    display: false,
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* NEW: User Engagement Metrics */}
      <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-md border border-indigo-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">User Engagement Metrics</h3>
        <div className="h-64">
          <Radar 
            data={userEngagementData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Platform Engagement Analysis',
                  display: true,
                }
              },
              scales: {
                r: {
                  angleLines: {
                    color: 'rgba(0, 0, 0, 0.1)',
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                  },
                  pointLabels: {
                    font: {
                      size: 10,
                    }
                  },
                  ticks: {
                    backdropColor: 'transparent',
                    color: 'rgba(0, 0, 0, 0.7)',
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* NEW: Seasonal Crop Performance */}
      <div className="bg-gradient-to-br from-white to-amber-50 p-6 rounded-xl shadow-md border border-amber-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Seasonal Crop Performance</h3>
        <div className="h-64">
          <Bar 
            data={seasonalCropPerformanceData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Success Rate by Season (%)',
                  display: true,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                  title: {
                    display: true,
                    text: 'Success Rate (%)'
                  }
                },
                x: {
                  grid: {
                    display: false,
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardCharts; 