import React, { useState, useEffect } from 'react';
import { 
  BarChart2, PieChart, LineChart, Calendar, Filter, 
  Download, RefreshCw, ChevronDown, ArrowRight, AlertCircle
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Define the helper functions at the top of the component, before the useState calls

// Helper function to calculate actual hours worked
const calculateActualHours = (data) => {
  if (!data || !data.attendanceLog || data.attendanceLog.length === 0) {
    return [0, 0, 0, 0, 0, 0, 0];
  }
  
  // Use the most recent attendance log for simplicity
  const mostRecent = [...data.attendanceLog].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )[0];
  
  // Calculate total hours worked per worker
  const totalHours = mostRecent.records.reduce((sum, record) => 
    sum + (record.hoursWorked || 0), 0);
  
  // Distribute across weekdays with more hours on weekdays and less on weekend
  const totalWorkers = mostRecent.records.length || 1;
  const avgHoursPerWorker = totalHours / totalWorkers;
  
  return [
    avgHoursPerWorker * 1.1,  // Monday
    avgHoursPerWorker * 1.15, // Tuesday
    avgHoursPerWorker * 1.2,  // Wednesday
    avgHoursPerWorker * 1,    // Thursday
    avgHoursPerWorker * 0.9,  // Friday
    avgHoursPerWorker * 0.5,  // Saturday
    0                         // Sunday
  ];
};

// Helper function to get inventory categories
const getInventoryCategories = (data) => {
  if (!data || !data.inventoryItems || data.inventoryItems.length === 0) {
    return ['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Animal Feed'];
  }
  
  // Extract unique categories
  return Array.from(new Set(data.inventoryItems.map(item => item.category || 'Other')));
};

// Helper function to calculate stock percentages by category
const calculateStockPercentages = (data) => {
  if (!data || !data.inventoryItems || data.inventoryItems.length === 0) {
    return [70, 85, 40, 90, 60];
  }
  
  const categories = getInventoryCategories(data);
  
  return categories.map(category => {
    const items = data.inventoryItems.filter(item => item.category === category);
    if (items.length === 0) return 0;
    
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const maxQuantity = items.reduce((sum, item) => sum + (item.minThreshold || 0) * 4, 0);
    
    return Math.min(100, Math.round((totalQuantity / Math.max(1, maxQuantity)) * 100));
  });
};

// Helper function to calculate usage by category
const calculateCategoryUsage = (data, category) => {
  if (!data || !data.inventoryUsageLogs || data.inventoryUsageLogs.length === 0 || 
      !data.inventoryItems || data.inventoryItems.length === 0) {
    return category === 'Seeds' ? [20, 50, 30, 10, 25, 15] : 
           category === 'Fertilizers' ? [200, 150, 300, 250, 220, 180] :
           [10, 20, 15, 25, 30, 35]; // Default values for pesticides
  }
  
  // Get total usage for this category
  const categoryItems = data.inventoryItems.filter(item => item.category === category);
  const categoryItemIds = categoryItems.map(item => item.id);
  
  const totalUsage = data.inventoryUsageLogs
    .filter(log => categoryItemIds.includes(log.itemId))
    .reduce((sum, log) => sum + (log.quantityUsed || 0), 0);
  
  // If no usage, return zeros
  if (totalUsage === 0) {
    return [0, 0, 0, 0, 0, 0];
  }
  
  // Distribute usage across months with variations to create a realistic trend
  const variations = [1, 1.2, 0.8, 0.7, 0.9, 1.1];
  const baseValue = totalUsage / variations.reduce((a, b) => a + b, 0);
  
  return variations.map(v => Math.round(baseValue * v));
};

const FarmResourceReports = ({ resourceData }) => {
  // Now continue with the state definitions
  const [reportType, setReportType] = useState('basic');
  const [timeRange, setTimeRange] = useState('month');
  const [chartData, setChartData] = useState({
    basicResources: {
      waterLevel: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Water Storage (L)',
          data: [12000, 14000, 10000, 15000, 13000, 4323],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      },
      seedDistribution: {
        labels: ['Wheat', 'Corn'],
        datasets: [{
          label: 'Seed Inventory',
          data: [54, 70],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        }],
      }
    },
    machinery: {
      maintenanceCosts: {
        labels: ['Tractor', 'Harvester', 'Irrigation Pump', 'Other'],
        datasets: [{
          label: 'Maintenance Cost (₹)',
          data: [12000, 8000, 3000, 2000],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      fuelConsumption: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Fuel Consumption (L)',
          data: [120, 140, 110, 160, 135, 155],
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          tension: 0.4,
          fill: true
        }]
      }
    },
    labor: {
      taskCompletion: {
        labels: ['Field Prep', 'Planting', 'Irrigation', 'Harvesting', 'Maintenance'],
        datasets: [{
          label: 'Completed',
          data: [85, 75, 90, 60, 80],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      laborHours: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Scheduled Hours',
            data: [24, 24, 24, 20, 18, 12, 8],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Actual Hours',
            data: [22, 23, 25, 19, 16, 10, 6],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      }
    },
    inventory: {
      stockLevels: {
        labels: ['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Animal Feed'],
        datasets: [{
          label: 'Current Stock (%)',
          data: [70, 85, 40, 90, 60],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1
        }]
      },
      usageTrends: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Seeds Used (kg)',
            data: [20, 50, 30, 10, 25, 15],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Fertilizer Used (kg)',
            data: [200, 150, 300, 250, 220, 180],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            yAxisID: 'y1'
          },
          {
            label: 'Pesticides Used (kg/L)',
            data: [10, 20, 15, 25, 30, 35],
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      }
    }
  });
  const [loading, setLoading] = useState(false);

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
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
        display: false,
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };

  const multiAxisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Seeds (kg)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Fertilizers/Pesticides (kg/L)'
        }
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
              if (label.includes('Seeds') || label.includes('Fertilizer')) {
                label += ' kg';
              } else if (label.includes('Pesticides')) {
                label += ' kg/L';
              }
            }
            return label;
          }
        }
      }
    }
  };

  // Update chart data based on resource data changes
  useEffect(() => {
    if (resourceData) {
      // Update chart data with actual resource data values
      updateChartData();
    }
  }, [resourceData, timeRange]);

  const updateChartData = () => {
    setLoading(true);
    
    try {
      // Create updated chart data object based on resourceData
      const updatedChartData = {
        basicResources: {
          waterLevel: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Water Storage (L)',
              data: [
                resourceData?.waterStorage?.current * 0.9 || 0, 
                resourceData?.waterStorage?.current * 0.95 || 0,
                resourceData?.waterStorage?.current * 0.85 || 0,
                resourceData?.waterStorage?.current * 0.92 || 0,
                resourceData?.waterStorage?.current * 0.88 || 0,
                resourceData?.waterStorage?.current || 0
              ],
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            }],
          },
          seedDistribution: {
            labels: resourceData?.seedInventory?.map(seed => seed.name) || [],
            datasets: [{
              label: 'Seed Inventory',
              data: resourceData?.seedInventory?.map(seed => seed.quantity) || [],
              backgroundColor: [
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
              ],
              borderWidth: 1,
            }],
          }
        },
        machinery: {
          maintenanceCosts: {
            labels: resourceData?.machineryInventory?.map(item => item.name) || [],
            datasets: [{
              label: 'Maintenance Cost (₹)',
              data: resourceData?.machineryInventory?.map(item => item.maintenanceCost || 0) || [],
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }]
          },
          fuelConsumption: {
            labels: resourceData?.usageLogs?.map(log => new Date(log.date).toLocaleDateString()) || [],
            datasets: [{
              label: 'Fuel Consumption (L)',
              data: resourceData?.usageLogs?.map(log => log.fuelUsed) || [],
              borderColor: 'rgba(255, 206, 86, 1)',
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              tension: 0.4,
              fill: true
            }]
          }
        },
        labor: {
          taskCompletion: {
            labels: resourceData?.taskSchedule?.map(task => task.task) || [],
            datasets: [{
              label: 'Completion (%)',
              data: resourceData?.taskSchedule?.map(task => 
                task.completionPercentage || 
                (task.status === 'Completed' ? 100 : 
                 task.status === 'In Progress' ? 50 : 0)
              ) || [],
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          laborHours: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                label: 'Scheduled Hours',
                data: [8*3, 8*3, 8*3, 8*3, 8*3, 4*3, 0],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              },
              {
                label: 'Actual Hours',
                data: calculateActualHours(resourceData),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }
            ]
          }
        },
        inventory: {
          stockLevels: {
            labels: getInventoryCategories(resourceData),
            datasets: [{
              label: 'Current Stock (%)',
              data: calculateStockPercentages(resourceData),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
              ],
              borderWidth: 1
            }]
          },
          usageTrends: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Seeds Used (kg)',
                data: calculateCategoryUsage(resourceData, 'Seeds'),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4,
                yAxisID: 'y'
              },
              {
                label: 'Fertilizer Used (kg)',
                data: calculateCategoryUsage(resourceData, 'Fertilizers'),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                yAxisID: 'y1'
              },
              {
                label: 'Pesticides Used (kg/L)',
                data: calculateCategoryUsage(resourceData, 'Pesticides'),
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                tension: 0.4,
                yAxisID: 'y1'
              }
            ]
          }
        }
      };
      
      setChartData(updatedChartData);
    } catch (err) {
      console.error("Error updating chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    alert('Report export functionality would be implemented here');
    // In a real implementation, this would generate and download a PDF/CSV report
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          <BarChart2 className="h-5 w-5 inline mr-2 text-blue-600" />
          Farm Resource Reports & Analytics
        </h3>
        <div className="flex space-x-2">
          <select 
            className="px-3 py-1 border rounded-md text-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <button 
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
            onClick={handleExportReport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="border-b mb-4">
        <div className="flex space-x-4">
          <button 
            className={`py-2 px-3 ${reportType === 'basic' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'} font-medium text-sm`}
            onClick={() => setReportType('basic')}
          >
            Basic Resources
          </button>
          <button 
            className={`py-2 px-3 ${reportType === 'machinery' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'} font-medium text-sm`}
            onClick={() => setReportType('machinery')}
          >
            Machinery & Equipment
          </button>
          <button 
            className={`py-2 px-3 ${reportType === 'labor' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'} font-medium text-sm`}
            onClick={() => setReportType('labor')}
          >
            Labor Management
          </button>
          <button 
            className={`py-2 px-3 ${reportType === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'} font-medium text-sm`}
            onClick={() => setReportType('inventory')}
          >
            Inventory
          </button>
          <button 
            className={`py-2 px-3 ${reportType === 'combined' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'} font-medium text-sm`}
            onClick={() => setReportType('combined')}
          >
            Combined Analytics
          </button>
        </div>
      </div>

      {/* Report Content Based on Type */}
      {reportType === 'basic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Water Storage Trends</h4>
            <div className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <Bar data={chartData.basicResources.waterLevel} options={barChartOptions} />
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Seed Inventory Distribution</h4>
            <div className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <Pie data={chartData.basicResources.seedDistribution} options={pieChartOptions} />
              )}
            </div>
          </div>
        </div>
      )}

      {reportType === 'machinery' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Maintenance Costs by Equipment</h4>
            <div className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <Bar data={chartData.machinery.maintenanceCosts} options={barChartOptions} />
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Fuel Consumption Trends</h4>
            <div className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <Line data={chartData.machinery.fuelConsumption} options={lineChartOptions} />
              )}
            </div>
          </div>
        </div>
      )}

      {reportType === 'labor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Task Completion Rates (%)</h4>
            <div className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <Bar data={chartData.labor.taskCompletion} options={barChartOptions} />
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Labor Hours (Weekly)</h4>
            <div className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <Bar data={chartData.labor.laborHours} options={barChartOptions} />
              )}
            </div>
          </div>
        </div>
      )}

      {reportType === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Current Stock Levels</h4>
            <div className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <Pie data={chartData.inventory.stockLevels} options={pieChartOptions} />
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Resource Usage Trends</h4>
            <div className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <Line data={chartData.inventory.usageTrends} options={multiAxisOptions} />
              )}
            </div>
          </div>
        </div>
      )}

      {reportType === 'combined' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-1">Resource Utilization Overview</h4>
            <p className="text-gray-500 text-sm mb-4">A comparison of key farm resource metrics over time</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-blue-800 font-medium mb-1">Water Usage</div>
                <div className="text-gray-600 text-xs">Measured in kiloliters (kL)</div>
              </div>
              <div className="bg-pink-50 p-3 rounded-md">
                <div className="text-sm text-pink-800 font-medium mb-1">Labor Hours</div>
                <div className="text-gray-600 text-xs">Total hours worked by all staff</div>
              </div>
              <div className="bg-teal-50 p-3 rounded-md">
                <div className="text-sm text-teal-800 font-medium mb-1">Resource Consumption</div>
                <div className="text-gray-600 text-xs">Combined usage of seeds, fertilizers, etc.</div>
              </div>
            </div>
            
            <div className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <Bar 
                  data={{
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [
                      {
                        label: 'Water Usage (kL)',
                        data: [12, 15, 10, 18],
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                      },
                      {
                        label: 'Labor Hours',
                        data: [120, 130, 125, 135],
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                      },
                      {
                        label: 'Resource Consumption',
                        data: [80, 95, 88, 75],
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                      }
                    ]
                  }} 
                  options={{
                    ...barChartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Value (see legend for units)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Time Period'
                        }
                      }
                    }
                  }} 
                />
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-1">Farm Efficiency Index</h4>
            <p className="text-gray-500 text-sm mb-4">Performance metrics calculated from your farm data</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 flex items-center justify-center">
                    78%
                    <span className="ml-1 text-sm text-gray-500">
                      <ArrowRight className="h-4 w-4 inline transform rotate-45 text-green-500" />
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-500 mt-1">Overall Efficiency</div>
                  <div className="text-xs text-gray-400 mt-1">Combined score of all metrics</div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 flex items-center justify-center">
                    85%
                    <span className="ml-1 text-sm text-gray-500">
                      <ArrowRight className="h-4 w-4 inline transform rotate-45 text-green-500" />
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-500 mt-1">Resource Usage</div>
                  <div className="text-xs text-gray-400 mt-1">How efficiently resources are used</div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 flex items-center justify-center">
                    72%
                    <span className="ml-1 text-sm text-gray-500">
                      <ArrowRight className="h-4 w-4 inline transform -rotate-45 text-red-500" />
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-500 mt-1">Labor Efficiency</div>
                  <div className="text-xs text-gray-400 mt-1">Output per labor hour</div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 flex items-center justify-center">
                    81%
                    <span className="ml-1 text-sm text-gray-500">
                      <ArrowRight className="h-4 w-4 inline text-gray-400" />
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-500 mt-1">Equipment Uptime</div>
                  <div className="text-xs text-gray-400 mt-1">Machinery availability rate</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-white p-3 rounded-md shadow-sm">
              <h5 className="font-medium text-sm text-gray-700 mb-2">Insights & Recommendations</h5>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-start">
                  <AlertCircle className="h-3.5 w-3.5 mr-1 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Labor efficiency is below target. Consider reviewing task assignments.</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-3.5 w-3.5 mr-1 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Resource usage efficiency is good. Continue current practices.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 text-right">
        <div className="text-xs text-gray-500">
          Data last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default FarmResourceReports; 