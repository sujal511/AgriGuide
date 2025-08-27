import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Droplet, Leaf, Wrench, Database, Edit, Plus, Trash2
} from 'lucide-react';

const BasicResources = () => {
  const [resourceData, setResourceData] = useState({
    waterStorage: {
      current: 15000,
      capacity: 20000,
      unit: 'L'
    },
    seedInventory: [
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
    ]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      // Fetch data from your API endpoint with authentication
      const response = await axios.get('http://localhost:8000/api/farm-resources/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      // If you get data from the API, use it
      if (response.data) {
        setResourceData(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching farm resources:', err);
      // Keep using default data if API fails
      setError('Could not fetch resource data. Using local data instead.');
      setLoading(false);
    }
  };

  // Calculate percentage for water storage
  const waterPercentage = (resourceData.waterStorage.current / resourceData.waterStorage.capacity) * 100;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Farm Resources</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Water Storage */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-blue-800">
              <Droplet className="h-4 w-4 inline mr-1" />
              Water Storage
            </h3>
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
          </div>

          <div className="mt-2 space-y-2">
            {resourceData.seedInventory.map((seed, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-green-600">{seed.name}</span>
                <span className="text-green-600">{seed.quantity}{seed.unit}</span>
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
          </div>

          <div className="mt-2 space-y-2">
            {resourceData.fertilizerStock.map((fertilizer, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-purple-600">{fertilizer.name}</span>
                <span className="text-purple-600">{fertilizer.quantity}{fertilizer.unit}</span>
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
          </div>

          <div className="mt-2 space-y-2">
            {resourceData.equipmentStatus.map((equipment, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-orange-600">{equipment.name}</span>
                <span className="text-orange-600">{equipment.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicResources; 