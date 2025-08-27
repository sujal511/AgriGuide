import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Droplet, Leaf, Wrench, Database, Plus, Edit, Trash2, Save, X, RefreshCw,
  ChevronRight, ArrowLeft, ArrowRight, AlertCircle, Calendar, Clock, Users, 
  Truck, CheckSquare, DollarSign, Package, AlertTriangle, BarChart2, ShoppingBag
} from 'lucide-react';
import FarmResourceReports from './FarmResourceReports';

const FarmResourceManagement = () => {
  // Main state for resource data
  const [resourceData, setResourceData] = useState({
    waterStorage: {
      current: 15000,
      capacity: 20000,
      unit: 'L'
    },
    seedInventory: [
      { name: 'Rice', quantity: 61, unit: 'kg' },
      { name: 'Wheat', quantity: 54, unit: 'kg' },
      { name: 'Corn', quantity: 70, unit: 'kg' }
    ],
    fertilizerStock: [
      { name: 'NPK', quantity: 200, unit: 'kg' },
      { name: 'Urea', quantity: 150, unit: 'kg' }
    ],
    equipmentStatus: [
      { name: 'Tractor', status: 'Available' },
      { name: 'Irrigation System', status: 'Active' }
    ],
    // New state for machinery and equipment management
    machineryInventory: [
      { name: 'Tractor - John Deere', condition: 'Good', lastMaintenance: '2023-10-15', nextMaintenance: '2024-01-15' },
      { name: 'Harvester', condition: 'Needs Repair', lastMaintenance: '2023-08-20', nextMaintenance: '2023-11-20' },
      { name: 'Irrigation Pump', condition: 'Excellent', lastMaintenance: '2023-11-01', nextMaintenance: '2024-02-01' }
    ],
    usageLogs: [
      { equipment: 'Tractor - John Deere', user: 'Rahul', date: '2023-11-10', purpose: 'Field preparation', fuelUsed: 25 },
      { equipment: 'Harvester', user: 'Amit', date: '2023-11-05', purpose: 'Rice harvesting', fuelUsed: 40 }
    ],
    // New state for labor management
    laborRoster: [
      { name: 'Rahul Kumar', role: 'Field Manager', contactNumber: '9876543210', skills: ['Tractor Operation', 'Irrigation'] },
      { name: 'Amit Singh', role: 'Harvester Operator', contactNumber: '8765432109', skills: ['Harvester Operation', 'Basic Repairs'] },
      { name: 'Priya Verma', role: 'Field Worker', contactNumber: '7654321098', skills: ['Sowing', 'Crop Monitoring'] }
    ],
    taskSchedule: [
      { task: 'Field preparation - North', assignedTo: 'Rahul Kumar', date: '2023-11-15', status: 'Pending' },
      { task: 'Irrigation maintenance', assignedTo: 'Amit Singh', date: '2023-11-14', status: 'Completed' },
      { task: 'Seed sowing - East field', assignedTo: 'Priya Verma', date: '2023-11-16', status: 'Pending' }
    ],
    attendanceLog: [
      { date: '2023-11-10', records: [
        { name: 'Rahul Kumar', hoursWorked: 8, overtimeHours: 1 },
        { name: 'Amit Singh', hoursWorked: 8, overtimeHours: 0 },
        { name: 'Priya Verma', hoursWorked: 7, overtimeHours: 0 }
      ]}
    ],
    // New state for inventory management
    inventoryItems: [
      { 
        id: '1',
        name: 'Hybrid Rice Seeds', 
        category: 'Seeds', 
        quantity: 85, 
        unit: 'kg', 
        minThreshold: 20,
        supplier: 'AgriSeeds Ltd', 
        purchaseDate: '2023-10-05', 
        expiryDate: '2024-10-05', 
        storageLocation: 'Seed Shed A' 
      },
      { 
        id: '2',
        name: 'NPK Complex', 
        category: 'Fertilizers', 
        quantity: 120, 
        unit: 'kg', 
        minThreshold: 30,
        supplier: 'Fertilizer Corp', 
        purchaseDate: '2023-09-15', 
        expiryDate: '2024-09-15', 
        storageLocation: 'Chemical Store B' 
      },
      { 
        id: '3',
        name: 'Insecticide A', 
        category: 'Pesticides', 
        quantity: 15, 
        unit: 'L', 
        minThreshold: 5,
        supplier: 'AgProtect Inc', 
        purchaseDate: '2023-08-20', 
        expiryDate: '2023-12-20', 
        storageLocation: 'Chemical Store A' 
      },
      { 
        id: '4',
        name: 'Poultry Feed', 
        category: 'Animal Feed', 
        quantity: 200, 
        unit: 'kg', 
        minThreshold: 50,
        supplier: 'FeedMaster Co', 
        purchaseDate: '2023-11-01', 
        expiryDate: '2024-02-01', 
        storageLocation: 'Feed Storage C' 
      },
      { 
        id: '5',
        name: 'Pruning Shears', 
        category: 'Tools & Equipment', 
        quantity: 8, 
        unit: 'pcs', 
        minThreshold: 2,
        supplier: 'FarmTools Inc', 
        purchaseDate: '2023-07-10', 
        expiryDate: null, 
        storageLocation: 'Tool Shed B' 
      }
    ],
    inventoryUsageLogs: [
      {
        id: '1',
        itemId: '1',
        itemName: 'Hybrid Rice Seeds',
        dateOfUse: '2023-11-05',
        quantityUsed: 15,
        unit: 'kg',
        usedBy: 'Rahul Kumar',
        purpose: 'Rice planting - South field'
      },
      {
        id: '2',
        itemId: '2',
        itemName: 'NPK Complex',
        dateOfUse: '2023-11-07',
        quantityUsed: 30,
        unit: 'kg',
        usedBy: 'Priya Verma',
        purpose: 'Fertilization - East field'
      },
      {
        id: '3',
        itemId: '3',
        itemName: 'Insecticide A',
        dateOfUse: '2023-11-10',
        quantityUsed: 5,
        unit: 'L',
        usedBy: 'Amit Singh',
        purpose: 'Pest control - North field'
      }
    ]
  });

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeResource, setActiveResource] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [tempItem, setTempItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'machinery', 'labor', 'inventory'
  const [inventoryFilter, setInventoryFilter] = useState('all'); // Filter for inventory items: 'all', 'seeds', 'fertilizers', etc.
  const [reportType, setReportType] = useState('expiry'); // Type of report to display: 'expiry', 'usage', 'stock'
  const [reportPeriod, setReportPeriod] = useState('month'); // Period for report: 'day', 'week', 'month'

  // Fetch resource data from API
  useEffect(() => {
    fetchResourceData();
  }, []);

  const fetchResourceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      try {
      // Fetch data from your API endpoint with authentication
      const response = await axios.get('http://localhost:8000/api/farm-resources/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      // If you get data from the API, use it
      if (response.data) {
          console.log('API Data received:', response.data);
          // Make sure all required arrays exist in the data
          const processedData = {
            ...resourceData, // Keep default structure
            ...response.data, // Overlay with API data
            // Ensure essential arrays exist
            inventoryItems: response.data.inventoryItems || [],
            inventoryUsageLogs: response.data.inventoryUsageLogs || []
          };
          setResourceData(processedData);
        }
      } catch (apiErr) {
        console.error('API request failed:', apiErr);
        setError('API request failed. Using development data instead.');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching farm resources:', err);
      // Keep using default data if API fails
      setError('Could not fetch resource data. Using local data instead.');
      setLoading(false);
    }
  };

  // Update resource data to API
  const saveResourceData = async (data = resourceData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Saving data to backend:', data);

      // Post data to your API endpoint with authentication
      try {
        const response = await axios.post('http://localhost:8000/api/farm-resources/', data, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
        
        console.log('Backend response:', response.data);
        
        // If the backend returns updated data, use it
        if (response.data) {
          // Merge the response data with existing state to ensure we have all needed fields
          setResourceData({
            ...data,
            ...response.data
          });
        }
      
      setSuccessMessage('Resource data saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
      } catch (apiErr) {
        console.error('API save error:', apiErr);
        
        // Check if it's a connection error vs data validation error
        if (apiErr.response && apiErr.response.data) {
          setError(`Backend error: ${JSON.stringify(apiErr.response.data)}`);
        } else {
          setError('Connection to backend failed. Changes saved locally only.');
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error saving farm resources:', err);
      setError('Failed to save resource data. Please try again.');
      setLoading(false);
    }
  };

  // Open sidebar to add new item
  const handleAddItem = (resourceType) => {
    setActiveResource(resourceType);
    setEditMode(false);
    
    // Create empty template based on resource type
    switch (resourceType) {
      case 'seedInventory':
        setTempItem({ name: '', quantity: 0, unit: 'kg' });
        break;
      case 'fertilizerStock':
        setTempItem({ name: '', quantity: 0, unit: 'kg' });
        break;
      case 'equipmentStatus':
        setTempItem({ name: '', status: 'Available' });
        break;
      case 'waterStorage':
        setTempItem({ ...resourceData.waterStorage });
        break;
      case 'machineryInventory':
        setTempItem({ 
          name: '', 
          condition: 'Good', 
          lastMaintenance: new Date().toISOString().split('T')[0], 
          nextMaintenance: new Date().toISOString().split('T')[0],
          maintenanceCost: 0 // Add this line to include maintenance cost
        });
        break;
      case 'usageLogs':
        setTempItem({ 
          equipment: '', 
          user: '', 
          date: new Date().toISOString().split('T')[0], 
          purpose: '', 
          fuelUsed: 0 
        });
        break;
      case 'laborRoster':
        setTempItem({ 
          name: '', 
          role: '', 
          contactNumber: '', 
          skills: [] 
        });
        break;
      case 'taskSchedule':
        setTempItem({ 
          task: '', 
          assignedTo: '', 
          date: new Date().toISOString().split('T')[0], 
          status: 'Pending',
          completionPercentage: 0 // Add this line to track completion percentage
        });
        break;
      case 'attendanceLog':
        // For attendance, we'll create a new day's record with all workers
        const today = new Date().toISOString().split('T')[0];
        // Check if we already have today's attendance
        const existingLog = resourceData.attendanceLog.find(log => 
          new Date(log.date).toISOString().split('T')[0] === today
        );
        
        if (existingLog) {
          setTempItem({ ...existingLog });
        } else {
          // Create a new attendance log with all workers
          setTempItem({ 
            date: today, 
            records: resourceData.laborRoster.map(worker => ({
              name: worker.name,
              hoursWorked: 8,
              overtimeHours: 0
            }))
          });
        }
        break;
      case 'inventoryItems':
        setTempItem({
          id: Date.now().toString(),
          name: '',
          category: 'Seeds',
          quantity: 0,
          unit: 'kg',
          minThreshold: 0,
          supplier: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          expiryDate: '', // Will be filled in by user if applicable
          storageLocation: ''
        });
        break;
      case 'inventoryUsageLogs':
        // Create a usage log template
        setTempItem({
          id: Date.now().toString(),
          itemId: '',
          itemName: '',
          dateOfUse: new Date().toISOString().split('T')[0],
          quantityUsed: 0,
          unit: 'kg',
          usedBy: '',
          purpose: ''
        });
        break;
      default:
        setTempItem(null);
    }
    
    setSidebarOpen(true);
  };

  // Open sidebar to edit existing item
  const handleEditItem = (resourceType, item, index) => {
    setActiveResource(resourceType);
    setEditMode(true);
    
    // Make a deep copy of the item to avoid reference issues
    const itemCopy = { ...item, index };
    
    // Ensure skills array exists for laborRoster items
    if (resourceType === 'laborRoster' && !Array.isArray(itemCopy.skills)) {
      itemCopy.skills = [];
      console.log('Initialized missing skills array for labor roster item');
    }
    
    setTempItem(itemCopy);
    setSidebarOpen(true);
  };

  // Delete an item from a resource category
  const handleDeleteItem = async (resourceType, index) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    const newResourceData = { ...resourceData };
    
    newResourceData[resourceType].splice(index, 1);
    setResourceData(newResourceData);
    
    try {
      await saveResourceData(newResourceData);
    } catch (err) {
      setError('Failed to delete item. Please try again.');
    }
  };

  // Handle input changes in the sidebar form
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === 'skillsInput') {
      // Special handling for skills input
      const skillsArray = value.split(',').map(skill => skill.trim()).filter(Boolean);
      setTempItem({
        ...tempItem,
        skills: skillsArray
      });
      return;
    }
    
    if (type === 'number') {
      setTempItem({
        ...tempItem,
        [name]: parseFloat(value)
      });
    } else {
      setTempItem({
        ...tempItem,
        [name]: value
      });
    }
  };

  // Save the changes (add new or update existing)
  const handleSaveItem = async () => {
    const newResourceData = { ...resourceData };

    // Ensure arrays exist
    if (!newResourceData.inventoryItems) newResourceData.inventoryItems = [];
    if (!newResourceData.inventoryUsageLogs) newResourceData.inventoryUsageLogs = [];
    
    console.log('Saving item for resource type:', activeResource);
    console.log('Temp item data:', tempItem);
    console.log('Edit mode:', editMode);
    
    // Handle special case for water storage
    if (activeResource === 'waterStorage') {
      newResourceData.waterStorage = { ...tempItem };
    } 
    // Handle inventory usage logs specially to update inventory quantities
    else if (activeResource === 'inventoryUsageLogs') {
      let itemToAdd = { ...tempItem };
      delete itemToAdd.index; // Remove index if present
      
      // For new usage logs, update the inventory quantity 
      if (!editMode) {
        // Find the inventory item
        const inventoryIndex = newResourceData.inventoryItems.findIndex(item => item && item.id === itemToAdd.itemId);
        
        if (inventoryIndex !== -1) {
          // Reduce the inventory quantity by the amount used
          const currentItem = newResourceData.inventoryItems[inventoryIndex];
          const newQuantity = Math.max(0, currentItem.quantity - itemToAdd.quantityUsed);
          
          // Update the inventory item with new quantity
          newResourceData.inventoryItems[inventoryIndex] = {
            ...currentItem,
            quantity: newQuantity
          };
          
          // Add item name to the usage log
          itemToAdd.itemName = currentItem.name;
          itemToAdd.unit = currentItem.unit;
          
          // Add the usage log
          newResourceData.inventoryUsageLogs.push(itemToAdd);
        }
      }
      // For editing existing usage logs
      else {
        const oldRecord = newResourceData.inventoryUsageLogs[tempItem.index];
        
        // Find the inventory item
        const inventoryIndex = newResourceData.inventoryItems.findIndex(item => 
          item && oldRecord && item.id === oldRecord.itemId
        );
        
        if (inventoryIndex !== -1) {
          // Calculate the difference in quantity used
          const quantityDifference = tempItem.quantityUsed - oldRecord.quantityUsed;
          
          // If the item ID changed, need to update both old and new inventory items
          if (oldRecord.itemId !== tempItem.itemId) {
            // Add back the quantity to the old item
            const oldItem = newResourceData.inventoryItems[inventoryIndex];
            newResourceData.inventoryItems[inventoryIndex] = {
              ...oldItem,
              quantity: oldItem.quantity + oldRecord.quantityUsed
            };
            
            // Reduce from new item
            const newInventoryIndex = newResourceData.inventoryItems.findIndex(item => item && item.id === tempItem.itemId);
            if (newInventoryIndex !== -1) {
              const newItem = newResourceData.inventoryItems[newInventoryIndex];
              newResourceData.inventoryItems[newInventoryIndex] = {
                ...newItem,
                quantity: Math.max(0, newItem.quantity - tempItem.quantityUsed)
              };
              
              // Update item name
              itemToAdd.itemName = newItem.name;
              itemToAdd.unit = newItem.unit;
            }
          } 
          // If only quantity changed
          else if (quantityDifference !== 0) {
            const currentItem = newResourceData.inventoryItems[inventoryIndex];
            newResourceData.inventoryItems[inventoryIndex] = {
              ...currentItem,
              quantity: Math.max(0, currentItem.quantity - quantityDifference)
            };
            
            // Keep the same item name
            itemToAdd.itemName = oldRecord.itemName;
            itemToAdd.unit = oldRecord.unit || currentItem.unit;
          }
          
          // Update the usage log
          newResourceData.inventoryUsageLogs[tempItem.index] = itemToAdd;
          delete newResourceData.inventoryUsageLogs[tempItem.index].index;
        }
      }
    }
    // Handle inventory items specially
    else if (activeResource === 'inventoryItems') {
      if (editMode) {
        // Update existing item
        newResourceData.inventoryItems[tempItem.index] = { ...tempItem };
        // Remove the index property which was added for tracking
        delete newResourceData.inventoryItems[tempItem.index].index;
        console.log('Updated inventory item at index:', tempItem.index);
      } else {
        // Add new item
        const itemToAdd = { ...tempItem };
        delete itemToAdd.index; // Remove index if present
        
        // Ensure ID is unique and exists
        if (!itemToAdd.id) {
          itemToAdd.id = Date.now().toString();
        }
        
        newResourceData.inventoryItems.push(itemToAdd);
        console.log('Added new inventory item:', itemToAdd);
      }
    }
    // Handle other array resources (seeds, fertilizers, equipment, etc.)
    else {
      if (editMode) {
        // Update existing item
        newResourceData[activeResource][tempItem.index] = { ...tempItem };
        // Remove the index property which was added for tracking
        delete newResourceData[activeResource][tempItem.index].index;
      } else {
        // Add new item
        const itemToAdd = { ...tempItem };
        delete itemToAdd.index; // Remove index if present
        newResourceData[activeResource].push(itemToAdd);
      }
    }
    
    // Update state and close sidebar
    setResourceData(newResourceData);
    setSidebarOpen(false);
    setTempItem(null);
    
    try {
      // Important: Make sure we're actually saving to the backend
      console.log('Saving to backend:', newResourceData);
      await saveResourceData(newResourceData);
    } catch (err) {
      console.error('Error in handleSaveItem:', err);
      setError('Failed to save changes. Please try again.');
    }
  };

  // Calculate percentage for water storage
  const waterPercentage = (resourceData.waterStorage.current / resourceData.waterStorage.capacity) * 100;

  // Add this helper function before the return statement in the component
  // Find the most recent attendance log
  const getMostRecentAttendanceLog = () => {
    if (!resourceData.attendanceLog || resourceData.attendanceLog.length === 0) {
      return null;
    }
    
    // Sort attendance logs by date (newest first)
    const sortedLogs = [...resourceData.attendanceLog].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    return sortedLogs[0];
  };

  // Get most recent log for display
  const mostRecentAttendanceLog = getMostRecentAttendanceLog();

  return (
    <div className="relative">
      {/* Main content */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Farm Resources</h2>
          <div className="flex items-center gap-2">
            {/* Add an explicit toggle sidebar button */}
            <button 
              onClick={() => {
                setActiveResource('waterStorage');
                setEditMode(false);
                setTempItem(resourceData.waterStorage);
                setSidebarOpen(!sidebarOpen);
              }}
              className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-md flex items-center gap-1"
              title="Toggle sidebar"
            >
              <ChevronRight className="h-5 w-5" />
              <span>Toggle Sidebar</span>
            </button>
            <button 
              onClick={fetchResourceData}
              className="text-gray-500 hover:text-gray-700"
              title="Refresh data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status messages */}
        {loading && (
          <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-center text-blue-700">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading resource data...
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md mb-4 flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 p-3 rounded-md mb-4 flex items-center text-green-700">
            <Save className="h-4 w-4 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="h-5 w-5 inline mr-2" />
              Basic Resources
            </button>
            <button
              onClick={() => {
                console.log('Switching to machinery tab');
                console.log('Current resourceData:', resourceData);
                console.log('Current machineryInventory:', resourceData.machineryInventory);
                console.log('Current usageLogs:', resourceData.usageLogs);
                setActiveTab('machinery');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'machinery'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Truck className="h-5 w-5 inline mr-2" />
              Machinery & Equipment
            </button>
            <button
              onClick={() => {
                console.log('Switching to labor tab');
                console.log('Current resourceData:', resourceData);
                console.log('Current laborRoster:', resourceData.laborRoster);
                console.log('Current taskSchedule:', resourceData.taskSchedule);
                console.log('Current attendanceLog:', resourceData.attendanceLog);
                setActiveTab('labor');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'labor'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              Labor Management
            </button>
            <button
              onClick={() => {
                console.log('Switching to inventory tab');
                console.log('Current resourceData:', resourceData);
                console.log('Current inventoryItems:', resourceData.inventoryItems);
                console.log('Current inventoryUsageLogs:', resourceData.inventoryUsageLogs);
                setActiveTab('inventory');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingBag className="h-5 w-5 inline mr-2" />
              Inventory Management
            </button>
            <button
              onClick={() => {
                console.log('Switching to reports tab');
                setActiveTab('reports');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart2 className="h-5 w-5 inline mr-2" />
              Reports & Analytics
            </button>
          </nav>
        </div>

        {/* Basic Resources Tab Content */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Water Storage */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-blue-800">
                  <Droplet className="h-4 w-4 inline mr-1" />
                  Water Storage
                </h3>
                <button 
                  onClick={() => handleAddItem('waterStorage')} 
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="Edit water storage"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-600">{waterPercentage.toFixed(0)}% Full</span>
                  <span className="text-blue-600">
                    {resourceData.waterStorage.current.toLocaleString()}/{resourceData.waterStorage.capacity.toLocaleString()} {resourceData.waterStorage.unit}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${waterPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Seed Inventory */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-green-800">
                  <Database className="h-4 w-4 inline mr-1" />
                  Seed Inventory
                </h3>
                <button 
                  onClick={() => handleAddItem('seedInventory')} 
                  className="p-1 text-green-600 hover:text-green-800"
                  title="Add seeds"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {resourceData.seedInventory.map((seed, index) => (
                  <div key={index} className="flex justify-between text-sm group">
                    <span className="text-green-600">{seed.name}</span>
                    <div className="flex items-center">
                      <span className="text-green-600">{seed.quantity}{seed.unit}</span>
                      <div className="flex ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditItem('seedInventory', seed, index)}
                          className="text-green-600 hover:text-green-800 mr-1"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem('seedInventory', index)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fertilizer Stock */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-purple-800">
                  <Leaf className="h-4 w-4 inline mr-1" />
                  Fertilizer Stock
                </h3>
                <button 
                  onClick={() => handleAddItem('fertilizerStock')} 
                  className="p-1 text-purple-600 hover:text-purple-800"
                  title="Add fertilizer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {resourceData.fertilizerStock.map((fertilizer, index) => (
                  <div key={index} className="flex justify-between text-sm group">
                    <span className="text-purple-600">{fertilizer.name}</span>
                    <div className="flex items-center">
                      <span className="text-purple-600">{fertilizer.quantity}{fertilizer.unit}</span>
                      <div className="flex ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditItem('fertilizerStock', fertilizer, index)}
                          className="text-purple-600 hover:text-purple-800 mr-1"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem('fertilizerStock', index)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Status */}
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-orange-800">
                  <Wrench className="h-4 w-4 inline mr-1" />
                  Equipment Status
                </h3>
                <button 
                  onClick={() => handleAddItem('equipmentStatus')} 
                  className="p-1 text-orange-600 hover:text-orange-800"
                  title="Add equipment"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {resourceData.equipmentStatus.map((equipment, index) => (
                  <div key={index} className="flex justify-between text-sm group">
                    <span className="text-orange-600">{equipment.name}</span>
                    <div className="flex items-center">
                      <span className="text-orange-600">{equipment.status}</span>
                      <div className="flex ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditItem('equipmentStatus', equipment, index)}
                          className="text-orange-600 hover:text-orange-800 mr-1"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem('equipmentStatus', index)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Machinery & Equipment Management Tab Content */}
        {activeTab === 'machinery' && (
          <div className="space-y-8">
            {console.log('Rendering machinery tab with:', {
              machineryInventory: resourceData.machineryInventory,
              usageLogs: resourceData.usageLogs
            })}
            
            {/* Ensure arrays exist for rendering */}
            {resourceData.machineryInventory && Array.isArray(resourceData.machineryInventory) ? (
              /* Machinery Inventory Section */
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800">
                    <Truck className="h-5 w-5 inline mr-2 text-blue-600" />
                    Machinery & Equipment Inventory
                  </h3>
                  <button 
                    onClick={() => handleAddItem('machineryInventory')} 
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md flex items-center"
                    title="Add new machinery/equipment"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Add Item</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Equipment
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Condition
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Maintenance
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Next Maintenance
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resourceData.machineryInventory.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                              item.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                              item.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.condition}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.lastMaintenance).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.nextMaintenance).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEditItem('machineryInventory', item, index)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('machineryInventory', index)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">Error: Machinery inventory data is not available or not properly formatted.</p>
              </div>
            )}

            {/* Usage Logs Section */}
            {resourceData.usageLogs && Array.isArray(resourceData.usageLogs) ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800">
                    <Truck className="h-5 w-5 inline mr-2 text-green-600" />
                    Equipment Usage & Fuel Logs
                  </h3>
                  <button 
                    onClick={() => handleAddItem('usageLogs')} 
                    className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md flex items-center"
                    title="Add new usage log"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Add Log</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Equipment
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Operator
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fuel Used (L)
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resourceData.usageLogs.map((log, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.equipment}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.purpose}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.fuelUsed}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEditItem('usageLogs', log, index)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('usageLogs', index)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">Error: Equipment usage logs data is not available or not properly formatted.</p>
              </div>
            )}
          </div>
        )}

        {/* Labor Management Tab Content */}
        {activeTab === 'labor' && (
          <div className="space-y-8">
            {console.log('Rendering labor tab with:', {
              laborRoster: resourceData.laborRoster,
              taskSchedule: resourceData.taskSchedule,
              attendanceLog: resourceData.attendanceLog
            })}
            
            {/* Ensure arrays exist for rendering */}
            {resourceData.laborRoster && Array.isArray(resourceData.laborRoster) ? (
              /* Labor Roster Section */
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800">
                    <Users className="h-5 w-5 inline mr-2 text-purple-600" />
                    Labor Roster
                  </h3>
                  <button 
                    onClick={() => handleAddItem('laborRoster')} 
                    className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md flex items-center"
                    title="Add new worker"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Add Worker</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Skills
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resourceData.laborRoster.map((worker, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {worker.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {worker.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {worker.contactNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {worker.skills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEditItem('laborRoster', worker, index)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('laborRoster', index)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">Error: Labor roster data is not available or not properly formatted.</p>
              </div>
            )}
            
            {/* Task Schedule Section */}
            {resourceData.taskSchedule && Array.isArray(resourceData.taskSchedule) ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800">
                    <Calendar className="h-5 w-5 inline mr-2 text-green-600" />
                    Task Schedule
                  </h3>
                  <button 
                    onClick={() => handleAddItem('taskSchedule')} 
                    className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md flex items-center"
                    title="Add new task"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Add Task</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Task
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resourceData.taskSchedule.map((task, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {task.task}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.assignedTo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(task.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEditItem('taskSchedule', task, index)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('taskSchedule', index)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">Error: Task schedule data is not available or not properly formatted.</p>
              </div>
            )}
            
            {/* Attendance Log Section */}
            {resourceData.attendanceLog && Array.isArray(resourceData.attendanceLog) ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800">
                    <Clock className="h-5 w-5 inline mr-2 text-blue-600" />
                    Attendance & Work Hours
                  </h3>
                  <div className="flex space-x-2">
                    <input 
                      type="date" 
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                    <button 
                      onClick={() => handleAddItem('attendanceLog')} 
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md flex items-center"
                      title="Add attendance record"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Log Attendance</span>
                    </button>
                  </div>
                </div>
                
                {resourceData.attendanceLog.length > 0 && (
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Latest Attendance: {mostRecentAttendanceLog ? new Date(mostRecentAttendanceLog.date).toLocaleDateString() : 'No records'}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Worker
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Regular Hours
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Overtime Hours
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Hours
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {mostRecentAttendanceLog && mostRecentAttendanceLog.records.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {record.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.hoursWorked}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.overtimeHours}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.hoursWorked + record.overtimeHours}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-700">Attendance History</h4>
                    <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      View Calendar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resourceData.attendanceLog.map((log, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-3 hover:shadow-md transition-shadow bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">{new Date(log.date).toLocaleDateString()}</span>
                          <span className="text-xs text-gray-500">
                            {log.records.length} workers
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Total Hours:</span>
                            <span className="font-medium">{log.records.reduce((total, record) => total + record.hoursWorked + record.overtimeHours, 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Regular:</span>
                            <span>{log.records.reduce((total, record) => total + record.hoursWorked, 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overtime:</span>
                            <span>{log.records.reduce((total, record) => total + record.overtimeHours, 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">Error: Attendance log data is not available or not properly formatted.</p>
              </div>
            )}
          </div>
        )}

        {/* Inventory Management Tab Content */}
        {activeTab === 'inventory' && (
          <div className="space-y-8">
            {/* Inventory Alerts Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">
                  <AlertTriangle className="h-5 w-5 inline mr-2 text-red-600" />
                  Inventory Alerts
                </h3>
      </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Low Stock Alerts */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-800 mb-3">Low Stock Items</h4>
                    {resourceData?.inventoryItems && resourceData.inventoryItems.filter(item => item && item.quantity <= (item.minThreshold || 0)).length > 0 ? (
                      <div className="space-y-2">
                        {resourceData.inventoryItems
                          .filter(item => item && item.quantity <= (item.minThreshold || 0))
                          .map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                              <div>
                                <span className="font-medium text-sm text-gray-800">{item.name}</span>
                                <div className="text-xs text-gray-500">Category: {item.category}</div>
                  </div>
                              <div className="text-right">
                                <span className="text-orange-600 font-bold text-sm">{item.quantity} {item.unit}</span>
                                <div className="text-xs text-gray-500">Min: {item.minThreshold} {item.unit}</div>
                  </div>
                  </div>
                          ))}
                </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No items below threshold</div>
                    )}
                  </div>
                  
                  {/* Expiring Soon Alerts */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-3">Expiring Soon</h4>
                    {resourceData?.inventoryItems && resourceData.inventoryItems
                      .filter(item => 
                        item && item.expiryDate && 
                        new Date(item.expiryDate) > new Date() && 
                        new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      ).length > 0 ? (
                      <div className="space-y-2">
                        {resourceData.inventoryItems
                          .filter(item => 
                            item && item.expiryDate && 
                            new Date(item.expiryDate) > new Date() && 
                            new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          )
                          .map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                              <div>
                                <span className="font-medium text-sm text-gray-800">{item.name}</span>
                                <div className="text-xs text-gray-500">Category: {item.category}</div>
                  </div>
                              <div className="text-right">
                                <span className="text-red-600 font-bold text-sm">
                                  {Math.ceil((new Date(item.expiryDate) - new Date()) / (24 * 60 * 60 * 1000))} days left
                                </span>
                                <div className="text-xs text-gray-500">
                                  Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </div>
                </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No items expiring soon</div>
                    )}
                  </div>
                </div>
              </div>
                  </div>
                  
            {/* Inventory Items Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">
                  <ShoppingBag className="h-5 w-5 inline mr-2 text-amber-600" />
                  Inventory Items
                </h3>
                <div className="flex items-center space-x-2">
                  <div>
                    <select
                      value={inventoryFilter}
                      onChange={(e) => setInventoryFilter(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="Seeds">Seeds</option>
                      <option value="Fertilizers">Fertilizers</option>
                      <option value="Pesticides">Pesticides</option>
                      <option value="Animal Feed">Animal Feed</option>
                    
                    </select>
                  </div>
                  <button 
                    onClick={() => handleAddItem('inventoryItems')} 
                    className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-md flex items-center"
                    title="Add new inventory item"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Add Item</span>
                  </button>
                </div>
                  </div>
                  
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Storage Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resourceData?.inventoryItems ? 
                      resourceData.inventoryItems
                      .filter(item => item && (inventoryFilter === 'all' || item.category === inventoryFilter))
                      .map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`font-medium ${item.quantity <= (item.minThreshold || 0) ? 'text-red-600' : 'text-green-600'}`}>
                              {item.quantity} {item.unit}
                            </span>
                            {item.quantity <= (item.minThreshold || 0) && (
                              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                Low
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.supplier}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.expiryDate ? (
                              <span className={
                                new Date(item.expiryDate) < new Date() 
                                  ? 'text-red-600 font-medium' 
                                  : new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                    ? 'text-orange-600 font-medium'
                                    : 'text-gray-500'
                              }>
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.storageLocation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEditItem('inventoryItems', item, index)}
                                className="text-amber-600 hover:text-amber-900"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('inventoryItems', index)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                  </div>
                          </td>
                        </tr>
                      ))
                    : <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No inventory items available</td></tr>}
                  </tbody>
                </table>
                </div>
                  </div>
                  
            {/* Usage Logs Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">
                  <Calendar className="h-5 w-5 inline mr-2 text-pink-600" />
                  Usage History
                </h3>
                <button 
                  onClick={() => handleAddItem('inventoryUsageLogs')} 
                  className="p-2 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-md flex items-center"
                  title="Add usage log"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add Usage</span>
                </button>
                  </div>
                  
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Used
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Used By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resourceData?.inventoryUsageLogs ? 
                      resourceData.inventoryUsageLogs.map((log, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log?.dateOfUse ? new Date(log.dateOfUse).toLocaleDateString() : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log?.itemName || ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log?.quantityUsed || 0} {log?.unit || ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log?.usedBy || ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log?.purpose || ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEditItem('inventoryUsageLogs', log, index)}
                                className="text-pink-600 hover:text-pink-900"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('inventoryUsageLogs', index)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                  </div>
                          </td>
                        </tr>
                      ))
                    : <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No usage logs available</td></tr>}
                  </tbody>
                </table>
                  </div>
                </div>
            
            {/* Inventory Reports Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">
                  <BarChart2 className="h-5 w-5 inline mr-2 text-purple-600" />
                  Inventory Reports
                </h3>
                <div className="flex items-center space-x-2">
                    <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="expiry">Expiry Report</option>
                    <option value="usage">Usage Report</option>
                    <option value="stock">Current Stock</option>
                    </select>
                    <select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                    </select>
                  </div>
                  </div>
                  
              <div className="p-4">
                {/* Report Content */}
                {reportType === 'expiry' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Expiry Timeline</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Current Quantity
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Expiry Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Days Remaining
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {resourceData?.inventoryItems ? 
                            resourceData.inventoryItems
                            .filter(item => item && item.expiryDate)
                            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
                            .map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.quantity} {item.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(item.expiryDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={
                                    new Date(item.expiryDate) < new Date() 
                                      ? 'text-red-600 font-medium' 
                                      : new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                        ? 'text-orange-600 font-medium'
                                        : 'text-green-600 font-medium'
                                  }>
                                    {new Date(item.expiryDate) < new Date() 
                                      ? 'Expired' 
                                      : Math.ceil((new Date(item.expiryDate) - new Date()) / (24 * 60 * 60 * 1000)) + ' days'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          : <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No expiring items available</td></tr>}
                        </tbody>
                      </table>
                  </div>
                </div>
              )}

                {reportType === 'usage' && (
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Usage Summary ({reportPeriod === 'day' ? 'Daily' : reportPeriod === 'week' ? 'Weekly' : 'Monthly'})</h4>
                    
                    {/* Calculate usage statistics based on the selected period */}
                    {(() => {
                      // Get date range based on period
                      const now = new Date();
                      let startDate;
                      if (reportPeriod === 'day') {
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      } else if (reportPeriod === 'week') {
                        startDate = new Date(now);
                        startDate.setDate(now.getDate() - 7);
                      } else { // month
                        startDate = new Date(now);
                        startDate.setMonth(now.getMonth() - 1);
                      }
                      
                      // Filter logs based on date range
                      const filteredLogs = resourceData?.inventoryUsageLogs ? resourceData.inventoryUsageLogs.filter(log => 
                        log && log.dateOfUse && new Date(log.dateOfUse) >= startDate && new Date(log.dateOfUse) <= now
                      ) : [];
                      
                      // Group by item and sum quantities
                      const usageByItem = {};
                      filteredLogs.forEach(log => {
                        if (!usageByItem[log.itemId]) {
                          usageByItem[log.itemId] = {
                            itemName: log.itemName,
                            totalUsed: 0,
                            unit: log.unit,
                            usages: []
                          };
                        }
                        usageByItem[log.itemId].totalUsed += log.quantityUsed;
                        usageByItem[log.itemId].usages.push(log);
                      });
                      
                      return (
                        <div className="overflow-x-auto">
                          {Object.keys(usageByItem).length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Used
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Number of Uses
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Average Per Use
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {Object.values(usageByItem).map((usage, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {usage.itemName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {usage.totalUsed} {usage.unit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {usage.usages.length}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {(usage.totalUsed / usage.usages.length).toFixed(2)} {usage.unit}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-center p-4 text-gray-500">
                              No usage data for the selected period
                  </div>
                          )}
                  </div>
                      );
                    })()}
                </div>
              )}

                {reportType === 'stock' && (
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Current Stock by Category</h4>
                    
                    {/* Group items by category */}
                    {(() => {
                      const categories = {};
                      if (resourceData?.inventoryItems) {
                        resourceData.inventoryItems.forEach(item => {
                          if (item && item.category) {
                            if (!categories[item.category]) {
                              categories[item.category] = [];
                            }
                            categories[item.category].push(item);
                          }
                        });
                      }
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.keys(categories).map((category, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                              <h5 className="font-medium text-gray-700 mb-3">{category}</h5>
                              <div className="space-y-2">
                                {categories[category].map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                                    <span className="text-sm text-gray-800">{item.name}</span>
                                    <span className="text-sm font-medium text-gray-700">{item.quantity} {item.unit}</span>
                        </div>
                                ))}
                        </div>
                              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                                <span className="text-sm text-gray-600">Total Items:</span>
                                <span className="text-sm font-medium text-gray-800">{categories[category].length}</span>
                      </div>
                    </div>
                  ))}
                </div>
                      );
                    })()}
            </div>
          )}
            </div>
          </div>
        </div>
        )}

        {/* Reports & Analytics Tab Content */}
        {activeTab === 'reports' && (
          <FarmResourceReports resourceData={resourceData} />
        )}
      </div>

      {/* Sidebar for adding/editing items */}
      {sidebarOpen && (
        <div className="fixed inset-0 overflow-hidden z-10">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                 onClick={() => setSidebarOpen(false)}></div>
            
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-96">
                <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-auto">
                  {/* Sidebar header */}
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        {editMode ? 'Edit' : 'Add'} {activeResource === 'waterStorage' 
                                                  ? 'Water Storage' 
                                                  : activeResource === 'seedInventory' 
                                                  ? 'Seeds'
                                                  : activeResource === 'fertilizerStock'
                                                  ? 'Fertilizer'
                                                  : activeResource === 'equipmentStatus'
                                                  ? 'Equipment'
                                                  : activeResource === 'machineryInventory'
                                                  ? 'Machinery'
                                                  : activeResource === 'usageLogs'
                                                  ? 'Usage Log'
                                                  : activeResource === 'laborRoster'
                                                  ? 'Worker'
                                                  : activeResource === 'taskSchedule'
                                                  ? 'Task'
                                                  : activeResource === 'attendanceLog'
                                                  ? 'Attendance'
                                                  : activeResource === 'inventoryItems'
                                                  ? 'Inventory Item'
                                                  : activeResource === 'inventoryUsageLogs'
                                                  ? 'Inventory Usage'
                                                  : ''}
            </h2>
            <button 
              onClick={() => setSidebarOpen(false)}
                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
                        <span className="sr-only">Close panel</span>
              <X className="h-6 w-6" />
            </button>
                    </div>
          </div>

                  {/* Sidebar content */}
                  <div className="mt-6 relative flex-1 px-4 sm:px-6">
                    <div className="space-y-6">
                      {/* Different form fields based on active resource */}
                      {activeResource === 'waterStorage' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Current Level</label>
                    <input
                      type="number"
                      name="current"
                      value={tempItem.current}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={tempItem.capacity}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                            <input
                              type="text"
                      name="unit"
                      value={tempItem.unit}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                  </div>
                        </>
                      )}

                      {activeResource === 'seedInventory' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Seed Name</label>
                    <input
                      type="text"
                      name="name"
                      value={tempItem.name}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={tempItem.quantity}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                            <input
                              type="text"
                      name="unit"
                      value={tempItem.unit}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                  </div>
                        </>
                      )}
                      
                      {activeResource === 'fertilizerStock' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Fertilizer Name</label>
                    <input
                      type="text"
                      name="name"
                      value={tempItem.name}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={tempItem.quantity}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                            <input
                              type="text"
                      name="unit"
                      value={tempItem.unit}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                  </div>
                        </>
                      )}
                      
                      {activeResource === 'equipmentStatus' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Equipment Name</label>
                    <input
                      type="text"
                      name="name"
                      value={tempItem.name}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={tempItem.status}
                      onChange={handleInputChange}
                              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="Available">Available</option>
                      <option value="In Use">In Use</option>
                      <option value="Maintenance">Maintenance</option>
                              <option value="Out of Order">Out of Order</option>
                    </select>
                  </div>
                        </>
                      )}
                      
                      {activeResource === 'machineryInventory' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Machinery/Equipment Name</label>
                    <input
                      type="text"
                      name="name"
                      value={tempItem.name}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Condition</label>
                    <select
                      name="condition"
                      value={tempItem.condition}
                      onChange={handleInputChange}
                              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Repair">Needs Repair</option>
                    </select>
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Maintenance Date</label>
                    <input
                      type="date"
                      name="lastMaintenance"
                      value={tempItem.lastMaintenance}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Next Maintenance Date</label>
                    <input
                      type="date"
                      name="nextMaintenance"
                              value={tempItem.nextMaintenance || ''}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          {/* Add maintenance cost field */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Maintenance Cost (₹)</label>
                            <input
                              type="number"
                              name="maintenanceCost"
                              value={tempItem.maintenanceCost || 0}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              min="0"
                    />
                  </div>
                        </>
                      )}
                      
                      {activeResource === 'usageLogs' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Equipment</label>
                    <select
                      name="equipment"
                      value={tempItem.equipment}
                      onChange={handleInputChange}
                              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="">Select Equipment</option>
                      {resourceData.machineryInventory.map((item, index) => (
                        <option key={index} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Operator</label>
                    <select
                      name="user"
                      value={tempItem.user}
                      onChange={handleInputChange}
                              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="">Select Operator</option>
                      {resourceData.laborRoster.map((worker, index) => (
                        <option key={index} value={worker.name}>{worker.name}</option>
                      ))}
                    </select>
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={tempItem.date}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Purpose</label>
                    <input
                      type="text"
                      name="purpose"
                      value={tempItem.purpose}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Fuel Used (L)</label>
                    <input
                      type="number"
                      name="fuelUsed"
                      value={tempItem.fuelUsed}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                        </>
                      )}
                      
                      {/* Inventory Items Form */}
                      {activeResource === 'inventoryItems' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                    <input
                      type="text"
                      name="name"
                      value={tempItem.name}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                              name="category"
                              value={tempItem.category}
                              onChange={handleInputChange}
                              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                              <option value="Seeds">Seeds</option>
                              <option value="Fertilizers">Fertilizers</option>
                              <option value="Pesticides">Pesticides</option>
                              <option value="Animal Feed">Animal Feed</option>
                              <option value="Tools & Equipment">Tools & Equipment</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                              type="number"
                              name="quantity"
                              value={tempItem.quantity}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <input
                      type="text"
                              name="unit"
                              value={tempItem.unit}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Minimum Threshold</label>
                    <input
                              type="number"
                              name="minThreshold"
                              value={tempItem.minThreshold}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Supplier</label>
                    <input
                      type="text"
                              name="supplier"
                              value={tempItem.supplier}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                            <input
                              type="date"
                              name="purchaseDate"
                              value={tempItem.purchaseDate}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Expiry Date (if applicable)</label>
                    <input
                      type="date"
                              name="expiryDate"
                              value={tempItem.expiryDate}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Storage Location</label>
                            <input
                              type="text"
                              name="storageLocation"
                              value={tempItem.storageLocation}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                          </div>
                        </>
                      )}
                      
                      {/* Inventory Usage Logs Form */}
                      {activeResource === 'inventoryUsageLogs' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Item</label>
                    <select
                              name="itemId"
                              value={tempItem.itemId}
                      onChange={handleInputChange}
                              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                              <option value="">Select Item</option>
                              {resourceData.inventoryItems.map((item, index) => (
                                <option key={index} value={item.id}>{item.name} ({item.quantity} {item.unit} available)</option>
                              ))}
                    </select>
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Date of Use</label>
                    <input
                      type="date"
                              name="dateOfUse"
                              value={tempItem.dateOfUse}
                      onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity Used</label>
                          <input
                            type="number"
                              name="quantityUsed"
                              value={tempItem.quantityUsed}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Used By</label>
                            <select
                              name="usedBy"
                              value={tempItem.usedBy}
                              onChange={handleInputChange}
                              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                              <option value="">Select Worker</option>
                              {resourceData.laborRoster.map((worker, index) => (
                                <option key={index} value={worker.name}>{worker.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Purpose</label>
                          <input
                              type="text"
                              name="purpose"
                              value={tempItem.purpose}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          />
                        </div>
                        </>
              )}
                      
                      {activeResource === 'laborRoster' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Worker Name</label>
                            <input
                              type="text"
                              name="name"
                              value={tempItem.name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <input
                              type="text"
                              name="role"
                              value={tempItem.role}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                            <input
                              type="text"
                              name="contactNumber"
                              value={tempItem.contactNumber}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                            <input
                              type="text"
                              name="skillsInput"
                              value={tempItem.skills.join(', ')}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              placeholder="e.g., Tractor Operation, Irrigation"
                            />
                          </div>
                        </>
                      )}

                      {activeResource === 'taskSchedule' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Task Description</label>
                            <input
                              type="text"
                              name="task"
                              value={tempItem.task}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              placeholder="e.g., Field preparation - North"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                            <select
                              name="assignedTo"
                              value={tempItem.assignedTo}
                              onChange={handleInputChange}
                              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                              <option value="">Select Worker</option>
                              {resourceData.laborRoster.map((worker, index) => (
                                <option key={index} value={worker.name}>{worker.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                              type="date"
                              name="date"
                              value={tempItem.date}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                              name="status"
                              value={tempItem.status || 'Pending'}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                          {/* Add completion percentage field */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Completion Percentage</label>
                            <input
                              type="number"
                              name="completionPercentage"
                              value={tempItem.completionPercentage || 0}
                              onChange={handleInputChange}
                              min="0"
                              max="100"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">Enter percentage between 0-100</p>
                          </div>
                        </>
                      )}

                      {activeResource === 'attendanceLog' && tempItem && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                              type="date"
                              name="date"
                              value={tempItem.date}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                          </div>
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-700">Worker Records</h3>
                            {tempItem.records.map((record, index) => (
                              <div key={index} className="border border-gray-200 rounded-md p-3">
                                <div className="font-medium text-gray-900 mb-2">{record.name}</div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs text-gray-500">Regular Hours</label>
                                    <input
                                      type="number"
                                      value={record.hoursWorked}
                                      onChange={(e) => {
                                        const newRecords = [...tempItem.records];
                                        newRecords[index] = {
                                          ...record,
                                          hoursWorked: parseInt(e.target.value) || 0
                                        };
                                        setTempItem({
                                          ...tempItem,
                                          records: newRecords
                                        });
                                      }}
                                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500">Overtime Hours</label>
                                    <input
                                      type="number"
                                      value={record.overtimeHours}
                                      onChange={(e) => {
                                        const newRecords = [...tempItem.records];
                                        newRecords[index] = {
                                          ...record,
                                          overtimeHours: parseInt(e.target.value) || 0
                                        };
                                        setTempItem({
                                          ...tempItem,
                                          records: newRecords
                                        });
                                      }}
                                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
            </div>
                  </div>

                  <div className="px-4 py-4 sm:px-6 border-t border-gray-200 mt-auto">
            <div className="flex justify-end space-x-3">
              <button
                        type="button"
                onClick={() => setSidebarOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                        type="button"
                onClick={handleSaveItem}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content ends here */}
    </div>
  );
};

export default FarmResourceManagement; 