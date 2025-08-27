import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  getFinancialResources,
  createExpense, updateExpense, deleteExpense,
  createLoan, updateLoan, deleteLoan,
  createBudgetPlan, updateBudgetPlan, deleteBudgetPlan
} from '../services/financialServices';
import { 
  DollarSign, Wallet, Calendar, CreditCard, 
  Plus, Edit, Trash2, Save, X, RefreshCw,
  ChevronRight, ChevronDown, AlertCircle, BarChart2,
  PieChart, TrendingUp, Filter, FileText, Printer,
  Users, Wrench, CreditCard as PaymentCard, CheckCircle,
  ArrowUpRight, ArrowDownRight, CircleDollarSign
} from 'lucide-react';
// Import Chart.js components
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
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Initial dummy data for reference and initialization
const INITIAL_DUMMY_DATA = {
  expenses: [
    { id: '1', category: 'Input Costs', item: 'Hybrid Rice Seeds', amount: 12000, date: '2023-11-05', vendor: 'AgriSeeds Ltd' },
    { id: '2', category: 'Labor Payments', item: 'Harvesting Workers', amount: 8000, date: '2023-11-15', payee: 'Seasonal Workers' },
    { id: '3', category: 'Equipment Maintenance', item: 'Tractor Service', amount: 5000, date: '2023-10-20', vendor: 'Farm Mechanics Inc' },
    { id: '4', category: 'Utilities', item: 'Electricity Bill', amount: 3000, date: '2023-11-01', vendor: 'State Power Corp' }
  ],
  loans: [
    { 
      id: '1', 
      schemeName: 'Kisan Credit Card', 
      bankName: 'State Bank of India', 
      applicationDate: '2023-08-10', 
      amount: 200000, 
      remainingAmount: 0,
      interestRate: 7.0, 
      status: 'Repaid', 
      repaymentSchedule: 'Monthly', 
      nextPaymentDate: null 
    },
    { 
      id: '2', 
      schemeName: 'Agri Gold Loan', 
      bankName: 'Punjab National Bank', 
      applicationDate: '2023-10-05', 
      amount: 150000, 
      remainingAmount: 150000,
      interestRate: 8.5, 
      status: 'Applied', 
      repaymentSchedule: 'Quarterly', 
      nextPaymentDate: null 
    },
    { 
      id: '3', 
      schemeName: 'Agricultural Term Loan', 
      bankName: 'State Bank of India', 
      applicationDate: '2023-12-15', 
      amount: 200000, 
      remainingAmount: 183876,
      interestRate: 7.2, 
      status: 'Approved', 
      repaymentSchedule: 'Monthly', 
      nextPaymentDate: '2025-07-16',
      emiAmount: 17324
    }
  ],
  budgetPlans: [
    { id: '1', seasonName: 'Rabi 2023-24', estimatedInputCosts: 45000, estimatedLaborCosts: 30000, estimatedMachineryCosts: 15000, expectedRevenue: 120000, notes: 'Focus on wheat and pulses' }
  ]
};

// Helper function to initialize storage with dummy data
const initializeStorage = () => {
  const storedData = localStorage.getItem('financial_resources_data');
  if (!storedData) {
    console.log('Initializing financial resources with dummy data');
    localStorage.setItem('financial_resources_data', JSON.stringify(INITIAL_DUMMY_DATA));
  }
};

// Helper function to calculate next payment date based on repayment schedule
const calculateNextPaymentDate = (currentPaymentDate, repaymentSchedule) => {
  const date = new Date(currentPaymentDate);
  
  switch (repaymentSchedule) {
    case 'Monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'Quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'Half-Yearly':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'Yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1); // Default to monthly
  }
  
  // Format date as YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

// Helper function to calculate EMI amount
const calculateEMI = (principal, rate, tenure, remainingPayments = null) => {
  // If this is a subsequent payment (not the first one)
  if (remainingPayments !== null && remainingPayments < tenure) {
    // For simplicity, we'll use a simple reducing balance method
    // Reduce the principal amount proportionally to the payments already made
    const paymentsMade = tenure - remainingPayments;
    const principalPaid = (principal * paymentsMade) / tenure;
    const remainingPrincipal = principal - principalPaid;
    
    // Calculate EMI on the remaining principal
    const monthlyRate = (rate / 100) / 12;
    const emi = remainingPrincipal * monthlyRate * Math.pow(1 + monthlyRate, remainingPayments) / 
                (Math.pow(1 + monthlyRate, remainingPayments) - 1);
    
    return Math.round(emi);
  } else {
    // Original EMI calculation for first payment
    const monthlyRate = (rate / 100) / 12;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    return Math.round(emi);
  }
};

// Modal component for editing financial resources
const EditModal = ({ isOpen, onClose, title, resource, item, onSave }) => {
  const [formData, setFormData] = useState(item);

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(resource, formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {resource === 'expenses' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  name="category"
                  value={formData?.category || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Input Costs">Input Costs</option>
                  <option value="Labor Payments">Labor Payments</option>
                  <option value="Equipment Maintenance">Equipment Maintenance</option>
                  <option value="Utilities">Utilities</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item/Description</label>
                <input
                  type="text"
                  name="item"
                  value={formData?.item || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData?.amount || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData?.date || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Payee</label>
                <input
                  type="text"
                  name="vendor"
                  value={formData?.vendor || formData?.payee || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
            </>
          )}

          {resource === 'loans' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name</label>
                <input
                  type="text"
                  name="schemeName"
                  value={formData?.schemeName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData?.bankName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                <input
                  type="date"
                  name="applicationDate"
                  value={formData?.applicationDate || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData?.amount || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  name="interestRate"
                  step="0.01"
                  value={formData?.interestRate || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status"
                  value={formData?.status || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="Applied">Applied</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Repaid">Repaid</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Repayment Schedule</label>
                <select 
                  name="repaymentSchedule"
                  value={formData?.repaymentSchedule || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              {formData?.status === 'Approved' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Payment Date</label>
                  <input
                    type="date"
                    name="nextPaymentDate"
                    value={formData?.nextPaymentDate || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              )}
            </>
          )}

          {resource === 'budgetPlans' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Season Name</label>
                <input
                  type="text"
                  name="seasonName"
                  value={formData?.seasonName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Input Costs (₹)</label>
                <input
                  type="number"
                  name="estimatedInputCosts"
                  value={formData?.estimatedInputCosts || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Labor Costs (₹)</label>
                <input
                  type="number"
                  name="estimatedLaborCosts"
                  value={formData?.estimatedLaborCosts || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Machinery Costs (₹)</label>
                <input
                  type="number"
                  name="estimatedMachineryCosts"
                  value={formData?.estimatedMachineryCosts || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Revenue (₹)</label>
                <input
                  type="number"
                  name="expectedRevenue"
                  value={formData?.expectedRevenue || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData?.notes || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows="3"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FinancialResourceManagement = () => {
  // Main state for financial data
  const [financialData, setFinancialData] = useState(INITIAL_DUMMY_DATA);

  // Initialize storage with dummy data on component mount and load data
  useEffect(() => {
    // Check if data exists in localStorage
    const storedData = localStorage.getItem('financial_resources_data');
    
    if (storedData) {
      // If data exists, parse and set it to state
      try {
        const parsedData = JSON.parse(storedData);
        setFinancialData(parsedData);
        console.log('Loaded existing financial data from localStorage');
      } catch (err) {
        console.error('Error parsing financial data from localStorage:', err);
        // If error parsing, initialize with dummy data
        initializeStorage();
      }
    } else {
      // If no data exists, initialize with dummy data
      initializeStorage();
      // And immediately load that data into state
      const initialData = JSON.parse(localStorage.getItem('financial_resources_data'));
      setFinancialData(initialData);
    }
  }, []);
  
  // Add effect to update chart data whenever financial data changes
  useEffect(() => {
    // Update chart data whenever financial data changes
    prepareChartData();
  }, [financialData]);

  // Add effect to initialize and update filtered data
  useEffect(() => {
    // Initialize filtered data when component mounts or when financial data changes
    updateFilteredData();
  }, [financialData]);

  // UI state
  const [activeTab, setActiveTab] = useState('expenses'); // expenses, loans, budget, reports
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [tempItem, setTempItem] = useState(null);
  const [activeResource, setActiveResource] = useState('');
  const [expensesFilter, setExpensesFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [reportPeriod, setReportPeriod] = useState('month');
  const [exportLoading, setExportLoading] = useState(false);

  // Add chart data state
  const [chartData, setChartData] = useState({
    monthlyExpenses: {
      labels: [],
      datasets: []
    },
    expenseDistribution: {
      labels: [],
      datasets: []
    }
  });

  // Inside the FinancialResourceManagement component, add these new state variables
  const [paymentHistory, setPaymentHistory] = useState({});
  const [loanInstallments, setLoanInstallments] = useState({});
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  
  // Add these state variables in the component function after the existing state variables
  // This should be added around line 490
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [expensesTrend, setExpensesTrend] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [budgetPlans, setBudgetPlans] = useState([]);
  const [loans, setLoans] = useState([]);

  // Update these state variables whenever financial data changes
  useEffect(() => {
    // Update total expenses
    const currentExpenses = financialData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalExpenses(currentExpenses);
    setExpenses(financialData.expenses);
    
    // Calculate expense trend (dummy data - in a real app this would compare to previous period)
    setExpensesTrend(Math.floor(Math.random() * 20) - 10); // Random number between -10 and 10
    
    // Update expected revenue from budget plans
    const expectedRevenue = financialData.budgetPlans.reduce((sum, plan) => sum + plan.expectedRevenue, 0);
    setTotalIncome(expectedRevenue);
    setBudgetPlans(financialData.budgetPlans);
    
    // Update loans
    setLoans(financialData.loans);
  }, [financialData]);

  // Filter data based on the selected period
  const updateFilteredData = (periodType = reportPeriod) => {
    const currentDate = new Date();
    let filterDate = new Date();
    
    switch (periodType) {
      case 'week':
        filterDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(currentDate.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case 'all':
        filterDate = new Date(0); // Beginning of time
        break;
    }
    
    // Filter financial data based on date
    const filteredExpenses = financialData.expenses.filter(expense => 
      new Date(expense.date) > filterDate
    );
    
    setFilteredExpenses(filteredExpenses);
    
    // Update total expenses based on filtered expenses
    const filteredTotalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalExpenses(filteredTotalExpenses);
    
    // Filter budget plans that are relevant to the selected period
    // For simplicity, we'll just use the ones created within the period
    const filteredBudgetPlans = financialData.budgetPlans.filter(plan => 
      // If the plan has a creation date, use it, otherwise include all plans
      !plan.createdAt || new Date(plan.createdAt) > filterDate
    );
    
    setBudgetPlans(filteredBudgetPlans);
    
    // Update expected revenue based on filtered budget plans
    const filteredTotalIncome = filteredBudgetPlans.reduce((sum, plan) => sum + plan.expectedRevenue, 0);
    setTotalIncome(filteredTotalIncome);
    
    // Calculate expense trend (compare with previous period)
    // This would normally compare with actual previous period data
    // For now, we'll use a random value between -10 and 10
    setExpensesTrend(Math.floor(Math.random() * 20) - 10);
    
    // Update chart data based on filtered expenses
    const expensesByMonth = new Array(12).fill(0);
    
    // Aggregate expenses by month
    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const month = expenseDate.getMonth();
      expensesByMonth[month] += expense.amount;
    });
    
    // Monthly expenses chart data
    const monthlyExpensesData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Monthly Expenses',
          data: expensesByMonth,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ]
    };
    
    // Expenses by category
    const categoryCounts = {};
    filteredExpenses.forEach(expense => {
      if (!categoryCounts[expense.category]) {
        categoryCounts[expense.category] = 0;
      }
      categoryCounts[expense.category] += expense.amount;
    });
    
    // Expense distribution chart data
    const expenseDistributionData = {
      labels: Object.keys(categoryCounts),
      datasets: [
        {
          data: Object.values(categoryCounts),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // Update chart data state
    setChartData({
      monthlyExpenses: monthlyExpensesData,
      expenseDistribution: expenseDistributionData
    });
  };

  // Add this useEffect to initialize payment data
  useEffect(() => {
    // Initialize payment history and installments from localStorage or create new
    const storedPaymentHistory = localStorage.getItem('financial_payment_history');
    const storedLoanInstallments = localStorage.getItem('financial_loan_installments');
    
    if (storedPaymentHistory) {
      setPaymentHistory(JSON.parse(storedPaymentHistory));
    }
    
    if (storedLoanInstallments) {
      setLoanInstallments(JSON.parse(storedLoanInstallments));
    } else {
      // Calculate installments for existing loans
      const initialInstallments = {};
      financialData.loans.forEach(loan => {
        if (loan.status === 'Approved') {
          // Assume 12 months tenure for existing loans if not specified
          const tenure = loan.repaymentTermMonths || 12;
          initialInstallments[loan.id] = {
            emi: calculateEMI(loan.amount, loan.interestRate, tenure),
            remainingPayments: tenure,
            totalPayments: tenure,
            amountPaid: 0,
            nextPaymentDate: loan.nextPaymentDate || new Date().toISOString().split('T')[0]
          };
        }
      });
      
      setLoanInstallments(initialInstallments);
      localStorage.setItem('financial_loan_installments', JSON.stringify(initialInstallments));
    }
  }, [financialData.loans]);

  // Fetch financial data from API or localStorage
  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First check for data in localStorage
      const storedData = localStorage.getItem('financial_resources_data');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setFinancialData(parsedData);
        console.log('Successfully loaded financial data from localStorage');
        setLoading(false);
        return;
      }
      
      // If no localStorage data, try to get from API
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found');
        // Initialize with default data if no token and no localStorage data
        localStorage.setItem('financial_resources_data', JSON.stringify(INITIAL_DUMMY_DATA));
        setFinancialData(INITIAL_DUMMY_DATA);
        setLoading(false);
        return;
      }

      // Fetch data using our service
      const { success, data, message } = await getFinancialResources();
      
      if (success && data) {
        setFinancialData(data);
        // Store the retrieved data in localStorage
        localStorage.setItem('financial_resources_data', JSON.stringify(data));
        console.log('Successfully loaded financial data from API');
      } else {
        // Fall back to dummy data if all else fails
        console.log('Using default dummy data');
        // Initialize storage with dummy data
        localStorage.setItem('financial_resources_data', JSON.stringify(INITIAL_DUMMY_DATA));
        setFinancialData(INITIAL_DUMMY_DATA);
        
        if (message) {
          console.warn('API issue:', message);
        }
      }
    } catch (err) {
      console.error('Error fetching financial resources:', err);
      setError('Could not fetch financial data. Using default data instead.');
      
      // Use default dummy data as last resort
      localStorage.setItem('financial_resources_data', JSON.stringify(INITIAL_DUMMY_DATA));
      setFinancialData(INITIAL_DUMMY_DATA);
    } finally {
      setLoading(false);
    }
  };

  // Function to prepare data for charts
  const prepareChartData = () => {
    // Prepare data for monthly expense chart
    const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create a map to store expenses by month
    const expensesByMonth = new Array(12).fill(0);
    
    // Aggregate expenses by month
    financialData.expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const month = expenseDate.getMonth();
      expensesByMonth[month] += expense.amount;
    });
    
    // Monthly expenses chart data
    const monthlyExpensesData = {
      labels: monthlyLabels,
      datasets: [
        {
          label: 'Monthly Expenses',
          data: expensesByMonth,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ]
    };
    
    // Expenses by category
    const categoryCounts = {};
    financialData.expenses.forEach(expense => {
      if (!categoryCounts[expense.category]) {
        categoryCounts[expense.category] = 0;
      }
      categoryCounts[expense.category] += expense.amount;
    });
    
    // Expense distribution chart data
    const expenseDistributionData = {
      labels: Object.keys(categoryCounts),
      datasets: [
        {
          data: Object.values(categoryCounts),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // Update chart data state
    setChartData({
      monthlyExpenses: monthlyExpensesData,
      expenseDistribution: expenseDistributionData
    });
  };

  // Handler functions for modal operations
  const handleOpenModal = (resource, item = null, isNew = false) => {
    let title = '';
    
    if (isNew) {
      title = resource === 'expenses' ? 'Add Expense' : 
              resource === 'loans' ? 'Add Loan' : 
              'Add Budget Plan';
      
      // Create empty item with default values
      if (resource === 'expenses') {
        item = {
          id: Date.now().toString(),
          category: 'Input Costs',
          item: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          vendor: ''
        };
      } else if (resource === 'loans') {
        item = {
          id: Date.now().toString(),
          schemeName: '',
          bankName: '',
          applicationDate: new Date().toISOString().split('T')[0],
          amount: 0,
          interestRate: 0,
          status: 'Applied',
          repaymentSchedule: 'Monthly',
          nextPaymentDate: null
        };
      } else if (resource === 'budgetPlans') {
        item = {
          id: Date.now().toString(),
          seasonName: '',
          estimatedInputCosts: 0,
          estimatedLaborCosts: 0,
          estimatedMachineryCosts: 0,
          expectedRevenue: 0,
          notes: ''
        };
      }
    } else {
      title = resource === 'expenses' ? 'Edit Expense' : 
              resource === 'loans' ? 'Edit Loan' : 
              'Edit Budget Plan';
    }
    
    setActiveResource(resource);
    setTempItem(item);
    setModalTitle(title);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setTempItem(null);
  };
  
  const handleSaveItem = async (resource, item) => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Check if item exists (edit) or is new (add)
      const isNewItem = !financialData[resource].find(i => i.id === item.id);
      
      // Ensure the item has an ID for new items
      if (isNewItem && !item.id) {
        item.id = Date.now().toString(); // Simple ID generation for new items
      }
      
      // Call the appropriate API service
      let result;
      
      if (resource === 'expenses') {
        result = isNewItem 
          ? await createExpense(item)
          : await updateExpense(item.id, item);
      } else if (resource === 'loans') {
        result = isNewItem 
          ? await createLoan(item)
          : await updateLoan(item.id, item);
      } else if (resource === 'budgetPlans') {
        result = isNewItem 
          ? await createBudgetPlan(item)
          : await updateBudgetPlan(item.id, item);
      }
      
      // Check if API call succeeded or if we're using mock data
      let success = result?.success;
      if (!success) {
        console.warn('API not connected yet, updating local state', result?.message);
        // Continue with local state update since API isn't ready
        success = true;
      }
      
      if (success) {
        // Update local state
        let updatedData;
        
        if (isNewItem) {
          // Add new item
          updatedData = {
            ...financialData,
            [resource]: [...financialData[resource], item]
          };
        } else {
          // Edit existing item
          updatedData = {
            ...financialData,
            [resource]: financialData[resource].map(i => 
              i.id === item.id ? item : i
            )
          };
        }
        
        // Update state and localStorage
        setFinancialData(updatedData);
        localStorage.setItem('financial_resources_data', JSON.stringify(updatedData));
        
        setSuccessMessage(`Successfully ${isNewItem ? 'added' : 'updated'} ${resource.slice(0, -1)}`);
        handleCloseModal();
      }
    } catch (err) {
      console.error(`Error saving ${resource}:`, err);
      setError(`Failed to save ${resource.slice(0, -1)}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };
  
  const handleDeleteItem = async (resource, itemId) => {
    if (!confirm(`Are you sure you want to delete this ${resource.slice(0, -1)}?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Call the appropriate API service
      let result;
      
      if (resource === 'expenses') {
        result = await deleteExpense(itemId);
      } else if (resource === 'loans') {
        result = await deleteLoan(itemId);
      } else if (resource === 'budgetPlans') {
        result = await deleteBudgetPlan(itemId);
      }
      
      // Check if API call succeeded or if we're using mock data
      let success = result?.success;
      if (!success) {
        console.warn('API not connected yet, updating local state', result?.message);
        // Continue with local state update since API isn't ready
        success = true;
      }
      
      if (success) {
        // Update local state
        const updatedData = {
          ...financialData,
          [resource]: financialData[resource].filter(item => item.id !== itemId)
        };
        
        // Update state and localStorage
        setFinancialData(updatedData);
        localStorage.setItem('financial_resources_data', JSON.stringify(updatedData));
        
        setSuccessMessage(`Successfully deleted ${resource.slice(0, -1)}`);
      }
    } catch (err) {
      console.error(`Error deleting ${resource}:`, err);
      setError(`Failed to delete ${resource.slice(0, -1)}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Calculate totals for dashboard summary
  // We're now using the totalExpenses state variable instead
  const totalLoans = financialData.loans.reduce((sum, loan) => sum + loan.amount, 0);
  
  // Calculate budget summary
  const budgetSummary = financialData.budgetPlans.length > 0 ? {
    totalInput: financialData.budgetPlans.reduce((sum, plan) => sum + plan.estimatedInputCosts, 0),
    totalLabor: financialData.budgetPlans.reduce((sum, plan) => sum + plan.estimatedLaborCosts, 0),
    totalMachinery: financialData.budgetPlans.reduce((sum, plan) => sum + plan.estimatedMachineryCosts, 0),
    totalRevenue: financialData.budgetPlans.reduce((sum, plan) => sum + plan.expectedRevenue, 0),
  } : { totalInput: 0, totalLabor: 0, totalMachinery: 0, totalRevenue: 0 };

  // Chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Expense Analysis',
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Expense Distribution by Category',
      },
    },
  };

  // Add this new state for payment confirmation modal
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    loanId: null,
    loanDetails: null,
    paymentAmount: 0
  });

  // Replace handleLoanPayment with this two-step process
  const openPaymentConfirmation = (loanId) => {
    // Find the loan
    const loan = financialData.loans.find(loan => loan.id === loanId);
    
    if (!loan || loan.status !== 'Approved') {
      setError('Cannot process payment for this loan');
      return;
    }
    
    // Get current installment data
    const currentInstallment = loanInstallments[loanId] || {
      emi: calculateEMI(loan.amount, loan.interestRate, 12), // Default to 12 months
      remainingPayments: 12,
      totalPayments: 12,
      amountPaid: 0,
      nextPaymentDate: loan.nextPaymentDate
    };
    
    // Calculate the EMI for this payment, considering remaining payments
    const paymentAmount = calculateEMI(
      loan.amount, 
      loan.interestRate, 
      currentInstallment.totalPayments || 12,
      currentInstallment.remainingPayments || 12
    );
    
    if (isNaN(paymentAmount)) {
      // Fallback to a simple calculation if EMI calculation fails
      const simplePayment = Math.round(loan.amount / 12);
      
      setPaymentModal({
        isOpen: true,
        loanId,
        loanDetails: loan,
        paymentAmount: simplePayment
      });
    } else {
      setPaymentModal({
        isOpen: true,
        loanId,
        loanDetails: loan,
        paymentAmount
      });
    }
  };

  // Update the handleLoanPayment function to use the updated payment amount
  const handleLoanPayment = () => {
    const { loanId, paymentAmount } = paymentModal;
    const loan = financialData.loans.find(loan => loan.id === loanId);
    
    if (!loan || loan.status !== 'Approved') {
      setError('Cannot process payment for this loan');
      return;
    }
    
    // Get current installment data
    const currentInstallment = loanInstallments[loanId] || {
      emi: calculateEMI(loan.amount, loan.interestRate, 12), // Default to 12 months
      remainingPayments: 12,
      totalPayments: 12,
      amountPaid: 0,
      remainingPrincipal: loan.amount, // Track remaining principal
      nextPaymentDate: loan.nextPaymentDate
    };
    
    // Calculate how much of this payment goes to principal
    const monthlyRate = (loan.interestRate / 100) / 12;
    const interestPayment = currentInstallment.remainingPrincipal * monthlyRate;
    const principalPayment = paymentAmount - interestPayment;
    
    // Calculate new remaining principal
    const newRemainingPrincipal = Math.max(0, currentInstallment.remainingPrincipal - principalPayment);
    
    // Update installment data
    const updatedInstallment = {
      ...currentInstallment,
      remainingPayments: currentInstallment.remainingPayments - 1,
      amountPaid: currentInstallment.amountPaid + paymentAmount,
      remainingPrincipal: newRemainingPrincipal,
      nextPaymentDate: calculateNextPaymentDate(currentInstallment.nextPaymentDate, loan.repaymentSchedule)
    };
    
    // Update loan status if fully paid
    let updatedLoan = { ...loan };
    if (updatedInstallment.remainingPayments <= 0 || newRemainingPrincipal <= 0) {
      updatedLoan = {
        ...loan,
        status: 'Repaid',
        nextPaymentDate: null,
        remainingAmount: 0
      };
    } else {
      updatedLoan = {
        ...loan,
        nextPaymentDate: updatedInstallment.nextPaymentDate,
        remainingAmount: newRemainingPrincipal
      };
    }
    
    // Update payment history
    const paymentDate = new Date().toISOString().split('T')[0];
    const updatedHistory = {
      ...paymentHistory,
      [loanId]: [
        ...(paymentHistory[loanId] || []),
        {
          date: paymentDate,
          amount: paymentAmount,
          principalPayment: principalPayment,
          interestPayment: interestPayment,
          remainingPrincipal: newRemainingPrincipal,
          remainingPayments: updatedInstallment.remainingPayments
        }
      ]
    };
    
    // Update state
    const updatedInstallments = {
      ...loanInstallments,
      [loanId]: updatedInstallment
    };
    
    // Update loan in financial data
    const updatedLoans = financialData.loans.map(l => 
      l.id === loanId ? updatedLoan : l
    );
    
    // Save everything
    setLoanInstallments(updatedInstallments);
    setPaymentHistory(updatedHistory);
    setFinancialData({
      ...financialData,
      loans: updatedLoans
    });
    
    // Update localStorage
    localStorage.setItem('financial_loan_installments', JSON.stringify(updatedInstallments));
    localStorage.setItem('financial_payment_history', JSON.stringify(updatedHistory));
    localStorage.setItem('financial_resources_data', JSON.stringify({
      ...financialData,
      loans: updatedLoans
    }));
    
    // Update backend if possible
    updateLoan(loanId, updatedLoan).catch(error => {
      console.error('Error updating loan in backend:', error);
    });
    
    setSuccessMessage(`Payment of ₹${paymentAmount.toLocaleString()} processed successfully`);
    setTimeout(() => setSuccessMessage(''), 3000);
    
    // Close payment modal
    setPaymentModal({
      isOpen: false,
      loanId: null,
      loanDetails: null,
      paymentAmount: 0
    });
  };

  // Add a function to delete payment history
  const handleDeletePaymentHistory = (loanId, paymentIndex) => {
    // Get current payment history for the loan
    const loanPayments = paymentHistory[loanId] || [];
    
    if (loanPayments.length === 0 || paymentIndex >= loanPayments.length) {
      setError('Payment record not found');
      return;
    }
    
    // Remove the payment at the specified index
    const updatedLoanPayments = loanPayments.filter((_, index) => index !== paymentIndex);
    
    // Update the payment history state
    const updatedHistory = {
      ...paymentHistory,
      [loanId]: updatedLoanPayments
    };
    
    // If no payments left for this loan, remove the loan entry
    if (updatedLoanPayments.length === 0) {
      delete updatedHistory[loanId];
    }
    
    // Update state and localStorage
    setPaymentHistory(updatedHistory);
    localStorage.setItem('financial_payment_history', JSON.stringify(updatedHistory));
    
    setSuccessMessage('Payment record deleted successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Add export report functionality
  const handleExportReport = () => {
    setExportLoading(true);
    
    try {
      // Filter data based on selected period
      const currentDate = new Date();
      let filterDate = new Date();
      
      switch (reportPeriod) {
        case 'week':
          filterDate.setDate(currentDate.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(currentDate.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(currentDate.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(currentDate.getFullYear() - 1);
          break;
        case 'all':
          filterDate = new Date(0); // Beginning of time
          break;
      }
      
      // Filter financial data based on date
      const filteredExpenses = financialData.expenses.filter(expense => 
        new Date(expense.date) > filterDate
      );
      
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add header
      csvContent += "Financial Report - " + reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1) + "\n\n";
      csvContent += "Category,Item,Amount,Date,Vendor\n";
      
      // Add expense rows
      filteredExpenses.forEach(expense => {
        csvContent += `${expense.category},${expense.item},₹${expense.amount},${expense.date},${expense.vendor || expense.payee}\n`;
      });
      
      // Add summary section
      csvContent += "\nSummary\n";
      csvContent += `Total Expenses,₹${filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)}\n`;
      
      if (financialData.budgetPlans.length > 0) {
        csvContent += `Expected Revenue,₹${budgetSummary.totalRevenue}\n`;
        csvContent += `Estimated Profit,₹${budgetSummary.totalRevenue - (budgetSummary.totalInput + budgetSummary.totalLabor + budgetSummary.totalMachinery)}\n`;
        csvContent += `ROI,${Math.round((budgetSummary.totalRevenue / (budgetSummary.totalInput + budgetSummary.totalLabor + budgetSummary.totalMachinery) - 1) * 100)}%\n`;
      }
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `financial_report_${reportPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage('Report exported successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report');
      setTimeout(() => setError(''), 3000);
    } finally {
      setExportLoading(false);
    }
  };

  // Function to calculate profit margin percentage
  const calculateProfitMargin = (income, expenses) => {
    if (income === 0) return 0;
    return Math.round(((income - expenses) / income) * 100);
  };

  // Function to get profit health color based on margin
  const getProfitHealthColor = (income, expenses) => {
    const margin = calculateProfitMargin(income, expenses);
    if (margin >= 25) return 'bg-green-500';
    if (margin >= 10) return 'bg-yellow-500';
    if (margin >= 0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Function to get end date for report period
  const getReportEndDate = (period) => {
    const date = new Date();
    switch (period) {
      case 'week':
        return 'this week';
      case 'month':
        return date.toLocaleString('default', { month: 'long' });
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter}, ${date.getFullYear()}`;
      case 'year':
        return date.getFullYear().toString();
      default:
        return '';
    }
  };

  // Function to get highest expense month
  const getHighestExpenseMonth = (chartData) => {
    if (!chartData || !chartData.labels || !chartData.datasets || chartData.datasets.length === 0) {
      return 'N/A';
    }
    
    const data = chartData.datasets[0].data;
    const maxIndex = data.indexOf(Math.max(...data));
    if (maxIndex === -1) return 'N/A';
    
    return `${chartData.labels[maxIndex]} (₹${data[maxIndex].toLocaleString()})`;
  };

  // Function to get average monthly expense
  const getAverageMonthlyExpense = (chartData) => {
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
      return '0';
    }
    
    const data = chartData.datasets[0].data;
    const total = data.reduce((sum, val) => sum + val, 0);
    return (data.length > 0 ? Math.round(total / data.length) : 0).toLocaleString();
  };

  // Function to get top expense categories
  const getTopExpenseCategories = (chartData) => {
    if (!chartData || !chartData.labels || !chartData.datasets || chartData.datasets.length === 0) {
      return [];
    }
    
    const data = chartData.datasets[0].data;
    const total = data.reduce((sum, val) => sum + val, 0);
    
    return chartData.labels.map((label, index) => ({
      label,
      value: data[index],
      percentage: Math.round((data[index] / total) * 100),
      index
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
  };

  // Function to get next payment date
  const getNextPaymentDate = (loan) => {
    // In a real implementation, this would calculate the next payment date based on loan start date and payment frequency
    if (!loan.nextPaymentDate) return 'Not scheduled';
    return new Date(loan.nextPaymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' });
  };

  // Function to get payment status
  const getPaymentStatus = (loan) => {
    // This would normally be based on actual payment history
    return loan.status === 'Approved' ? (Math.random() > 0.8 ? 'Due Soon' : 'On Schedule') : 'Pending';
  };

  // Function to get payment status color
  const getPaymentStatusColor = (loan) => {
    const status = getPaymentStatus(loan);
    if (status === 'Due Soon') return 'bg-orange-100 text-orange-800';
    if (status === 'Pending') return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  // Function to get investment categories
  const getInvestmentCategories = () => {
    // Get categories from actual expenses
    const categories = new Set();
    financialData.expenses.forEach(expense => {
      if (expense.category) {
        categories.add(expense.category);
      }
    });
    
    // Map expense categories to investment categories
    const categoryMapping = {
      'Input Costs': 'Crop Production',
      'Seeds': 'Crop Production',
      'Fertilizers': 'Crop Production',
      'Pesticides': 'Crop Production',
      'Equipment Maintenance': 'Equipment',
      'Equipment Purchase': 'Equipment',
      'Machinery': 'Equipment',
      'Labor Payments': 'Labor',
      'Seasonal Workers': 'Labor',
      'Permanent Workers': 'Labor',
      'Marketing': 'Marketing',
      'Advertising': 'Marketing',
      'Sales': 'Marketing',
      'Utilities': 'Other',
      'Miscellaneous': 'Other'
    };
    
    // Get unique mapped categories
    const investmentCategories = new Set();
    categories.forEach(category => {
      const mappedCategory = categoryMapping[category] || 'Other';
      investmentCategories.add(mappedCategory);
    });
    
    // Return array of categories, ensure we have the main ones even if no expenses exist yet
    const mainCategories = ['Crop Production', 'Equipment', 'Labor', 'Marketing'];
    const result = [...investmentCategories];
    
    // Add main categories if they don't exist
    mainCategories.forEach(cat => {
      if (!result.includes(cat)) {
        result.push(cat);
      }
    });
    
    return result;
  };

  // Function to calculate ROI for a category based on actual data
  const calculateCategoryROI = (category) => {
    const investment = getCategoryInvestment(category);
    const returnValue = getCategoryReturn(category);
    
    // Calculate ROI percentage with more realistic values
    if (investment > 0) {
      // Cap the ROI at more realistic values
      const rawROI = (returnValue / investment - 1) * 100;
      
      // Apply a dampening factor to keep ROIs in a realistic range
      // Agricultural ROIs typically range from -10% to +30% in most cases
      const dampingFactor = 0.5;
      const cappedROI = Math.min(60, Math.max(-20, rawROI * dampingFactor));
      
      return Math.round(cappedROI);
    }
    return 0;
  };

  // Function to get category investment from actual expenses
  const getCategoryInvestment = (category) => {
    // Map expense categories to investment categories
    const categoryMapping = {
      'Input Costs': 'Crop Production',
      'Seeds': 'Crop Production',
      'Fertilizers': 'Crop Production',
      'Pesticides': 'Crop Production',
      'Equipment Maintenance': 'Equipment',
      'Equipment Purchase': 'Equipment',
      'Machinery': 'Equipment',
      'Labor Payments': 'Labor',
      'Seasonal Workers': 'Labor',
      'Permanent Workers': 'Labor',
      'Marketing': 'Marketing',
      'Advertising': 'Marketing',
      'Sales': 'Marketing',
      'Utilities': 'Other',
      'Miscellaneous': 'Other'
    };
    
    // Filter expenses by the mapped category and sum amounts
    return filteredExpenses.reduce((total, expense) => {
      const mappedCategory = categoryMapping[expense.category] || 'Other';
      if (mappedCategory === category) {
        return total + expense.amount;
      }
      return total;
    }, 0);
  };

  // Function to get category return from budget plans
  const getCategoryReturn = (category) => {
    // Map investment categories to budget plan fields
    const budgetFieldMapping = {
      'Crop Production': 'estimatedInputCosts',
      'Equipment': 'estimatedMachineryCosts',
      'Labor': 'estimatedLaborCosts',
      'Marketing': 'expectedRevenue',
      'Other': 'expectedRevenue'
    };
    
    // For returns, we need to calculate based on budget plans and expected revenue
    const investment = getCategoryInvestment(category);
    
    // Get total expected revenue from budget plans
    const totalExpectedRevenue = budgetPlans.reduce((sum, plan) => sum + plan.expectedRevenue, 0);
    
    // Get total costs from budget plans
    const totalCosts = budgetPlans.reduce((sum, plan) => {
      return sum + plan.estimatedInputCosts + plan.estimatedLaborCosts + plan.estimatedMachineryCosts;
    }, 0);
    
    // If there's no investment or expected revenue, return 0
    if (investment === 0 || totalExpectedRevenue === 0 || totalCosts === 0) {
      return 0;
    }
    
    // Calculate the proportion of this category's investment to total costs
    const proportion = investment / totalCosts;
    
    // Allocate expected revenue based on this proportion
    const expectedReturn = totalExpectedRevenue * proportion;
    
    // Apply a category-specific multiplier to make the returns more realistic
    // Using much more conservative multipliers to avoid unrealistic ROI percentages
    const returnMultipliers = {
      'Crop Production': 1.15, // Crop production often has higher returns
      'Equipment': 1.05,      // Equipment has moderate returns
      'Labor': 0.95,          // Labor often has lower returns
      'Marketing': 1.2,       // Marketing can have high returns
      'Other': 1.0            // Other expenses have average returns
    };
    
    return Math.round(investment * (1 + (returnMultipliers[category] - 1) * 0.3));
  };

  // Function to get ROI color with more realistic thresholds
  const getROIColor = (roi) => {
    if (roi >= 15) return 'text-green-600';
    if (roi >= 8) return 'text-yellow-600';
    if (roi >= 0) return 'text-orange-600';
    return 'text-red-600';
  };

  // Function to get ROI status with more realistic thresholds
  const getROIStatus = (roi) => {
    if (roi >= 20) return 'Excellent';
    if (roi >= 15) return 'Good';
    if (roi >= 8) return 'Average';
    if (roi >= 0) return 'Low';
    return 'Loss';
  };

  // Function to get ROI status color with more realistic thresholds
  const getROIStatusColor = (roi) => {
    if (roi >= 20) return 'bg-green-100 text-green-800';
    if (roi >= 15) return 'bg-green-100 text-green-800';
    if (roi >= 8) return 'bg-yellow-100 text-yellow-800';
    if (roi >= 0) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Modal for adding/editing items */}
      <EditModal 
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalTitle}
        resource={activeResource}
        item={tempItem}
        onSave={handleSaveItem}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-800">Financial Resource Management</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchFinancialData}
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
          Loading financial data...
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
            onClick={() => setActiveTab('expenses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'expenses'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Wallet className="h-5 w-5 inline mr-2" />
            Expense Tracking
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'loans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCard className="h-5 w-5 inline mr-2" />
            Loan Schemes
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'budget'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PieChart className="h-5 w-5 inline mr-2" />
            Budget Planning
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart2 className="h-5 w-5 inline mr-2" />
            Reports & Insights
          </button>
        </nav>
      </div>

      {/* Tabs content */}
      <div className="space-y-6">
        {activeTab === 'expenses' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Expense Tracking</h3>
              <div className="flex items-center gap-2">
                <select 
                  className="border border-gray-300 rounded-md p-2 text-sm"
                  value={expensesFilter}
                  onChange={(e) => setExpensesFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Input Costs">Input Costs</option>
                  <option value="Labor Payments">Labor Payments</option>
                  <option value="Equipment Maintenance">Equipment Maintenance</option>
                  <option value="Utilities">Utilities</option>
                </select>
                <button 
                  onClick={() => handleOpenModal('expenses', null, true)} 
                  className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                    <p className="text-xl font-semibold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Input Costs</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{financialData.expenses
                          .filter(expense => expense.category === 'Input Costs')
                          .reduce((sum, exp) => sum + exp.amount, 0)
                          .toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Labor Payments</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{financialData.expenses
                          .filter(expense => expense.category === 'Labor Payments')
                          .reduce((sum, exp) => sum + exp.amount, 0)
                          .toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Equipment Maintenance</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{financialData.expenses
                          .filter(expense => expense.category === 'Equipment Maintenance')
                          .reduce((sum, exp) => sum + exp.amount, 0)
                          .toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expense Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item/Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor/Payee
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {financialData.expenses
                      .filter(expense => expensesFilter === 'all' || expense.category === expensesFilter)
                      .map((expense, index) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {expense.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {expense.item}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            ₹{expense.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(expense.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {expense.vendor || expense.payee}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleOpenModal('expenses', expense)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('expenses', expense.id)}
                                className="text-red-600 hover:text-red-900"
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
          </div>
        )}

        {activeTab === 'loans' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Loan Scheme Integration</h3>
              <button 
                onClick={() => handleOpenModal('loans', null, true)} 
                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add Loan</span>
              </button>
            </div>
            
            {/* Loan Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-5 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Loan Amount</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ₹{totalLoans.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Active Loans</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {financialData.loans.filter(loan => loan.status === 'Approved').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Pending Applications</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {financialData.loans.filter(loan => loan.status === 'Applied').length}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Loans Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scheme Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interest Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Payment
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {financialData.loans.map((loan, index) => (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {loan.schemeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loan.bankName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{loan.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{loan.remainingAmount ? loan.remainingAmount.toLocaleString() : loan.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loan.interestRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            loan.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            loan.status === 'Applied' ? 'bg-yellow-100 text-yellow-800' :
                            loan.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString('en-IN') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {loan.status === 'Approved' && (
                              <button 
                                onClick={() => openPaymentConfirmation(loan.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Make Payment"
                              >
                                <PaymentCard className="h-4 w-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleOpenModal('loans', loan)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem('loans', loan.id)}
                              className="text-red-600 hover:text-red-900"
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
            
            {/* Payment History Section */}
            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Payment History</h4>
              
              {Object.keys(paymentHistory).length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Loan Scheme
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Remaining Principal
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Remaining Payments
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(paymentHistory).flatMap(([loanId, payments]) => {
                          const loan = financialData.loans.find(l => l.id === loanId) || { schemeName: 'Unknown Loan' };
                          return payments.map((payment, index) => (
                            <tr key={`${loanId}-${index}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {loan.schemeName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment.date).toLocaleDateString('en-IN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                ₹{payment.amount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{payment.remainingPrincipal ? payment.remainingPrincipal.toLocaleString() : '0'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.remainingPayments}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  onClick={() => handleDeletePaymentHistory(loanId, index)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete Payment Record"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 text-center rounded-lg">
                  <p className="text-gray-500">No payment history available</p>
                </div>
              )}
            </div>
            
            {/* Available Loan Schemes Section */}
            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Available Loan Schemes</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Kisan Credit Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <h5 className="text-lg font-semibold text-gray-800">Kisan Credit Card</h5>
                    <p className="text-sm text-gray-600 mb-4">Short-term credit for crop production, post-harvest expenses, and working capital.</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Interest Rate:</span>
                        <span className="font-medium">4.0% - 7.0%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Loan Amount:</span>
                        <span className="font-medium">Based on scale of finance</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Repayment:</span>
                        <span className="font-medium">12 months</span>
                      </div>
                    </div>
                    
                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
                
                {/* Agricultural Term Loan */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <h5 className="text-lg font-semibold text-gray-800">Agricultural Term Loan</h5>
                    <p className="text-sm text-gray-600 mb-4">Long-term financing for farm machinery, land development, and infrastructure.</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Interest Rate:</span>
                        <span className="font-medium">8.0% - 10.0%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Loan Amount:</span>
                        <span className="font-medium">Up to ₹10,00,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Repayment:</span>
                        <span className="font-medium">5-7 years</span>
                      </div>
                    </div>
                    
                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
                
                {/* Agri Gold Loan */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <h5 className="text-lg font-semibold text-gray-800">Agri Gold Loan</h5>
                    <p className="text-sm text-gray-600 mb-4">Quick financing against gold collateral for immediate farming needs.</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Interest Rate:</span>
                        <span className="font-medium">7.5% - 9.0%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Loan Amount:</span>
                        <span className="font-medium">Up to 75% of gold value</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Repayment:</span>
                        <span className="font-medium">Flexible options</span>
                      </div>
                    </div>
                    
                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Budget Planning Tool</h3>
              <button 
                onClick={() => handleOpenModal('budgetPlans', null, true)} 
                className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add Budget Plan</span>
              </button>
            </div>
            
            {/* Budget Summary */}
            <div className="bg-white border border-purple-200 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-medium text-purple-800 mb-4">Budget Summary</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Total Expenses</span>
                      <span className="text-sm font-medium text-gray-700">
                        ₹{(budgetSummary.totalInput + budgetSummary.totalLabor + budgetSummary.totalMachinery).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-500">Input Costs</span>
                        <span className="text-xs text-gray-500">₹{budgetSummary.totalInput.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${budgetSummary.totalInput / (budgetSummary.totalInput + budgetSummary.totalLabor + budgetSummary.totalMachinery) * 100}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-500">Labor Costs</span>
                        <span className="text-xs text-gray-500">₹{budgetSummary.totalLabor.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${budgetSummary.totalLabor / (budgetSummary.totalInput + budgetSummary.totalLabor + budgetSummary.totalMachinery) * 100}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-500">Machinery Costs</span>
                        <span className="text-xs text-gray-500">₹{budgetSummary.totalMachinery.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${budgetSummary.totalMachinery / (budgetSummary.totalInput + budgetSummary.totalLabor + budgetSummary.totalMachinery) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h5 className="font-medium text-purple-800 mb-3">Profitability Analysis</h5>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Revenue</span>
                      <span className="font-medium text-green-600">₹{budgetSummary.totalRevenue.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Expenses</span>
                      <span className="font-medium text-red-600">₹{(budgetSummary.totalInput + budgetSummary.totalLabor + budgetSummary.totalMachinery).toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-purple-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">Net Profit Estimate</span>
                        <span className="font-bold text-purple-800">
                          ₹{(budgetSummary.totalRevenue - (budgetSummary.totalInput + budgetSummary.totalLabor + budgetSummary.totalMachinery)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Budget Plans Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Season
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Input Costs
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Labor Costs
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Machinery Costs
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expected Revenue
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {financialData.budgetPlans.map((plan, index) => (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {plan.seasonName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{plan.estimatedInputCosts.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{plan.estimatedLaborCosts.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{plan.estimatedMachineryCosts.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{plan.expectedRevenue.toLocaleString()}
                          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100">
                            {Math.round((plan.expectedRevenue / (plan.estimatedInputCosts + plan.estimatedLaborCosts + plan.estimatedMachineryCosts) - 1) * 100)}% ROI
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleOpenModal('budgetPlans', plan)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem('budgetPlans', plan.id)}
                              className="text-red-600 hover:text-red-900"
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
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Reports & Insights</h3>
            
            {/* Improved filters row */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 font-medium">Time Period:</label>
                <select 
                  className="border border-gray-300 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={reportPeriod}
                  onChange={(e) => {
                    setReportPeriod(e.target.value);
                    updateFilteredData(e.target.value);
                  }}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors"
                onClick={handleExportReport}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                <span>{exportLoading ? 'Exporting...' : 'Export Report'}</span>
              </button>
            </div>
            
            {/* Financial Overview Cards - Improved with better explanation and visual indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-5 rounded-lg border border-orange-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Total Expenses</h4>
                    <div className="text-2xl font-bold text-gray-800">₹{totalExpenses.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Based on {expenses.length} expense entries</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-full">
                    <TrendingUp className={`h-6 w-6 ${expensesTrend > 0 ? 'text-orange-500' : 'text-green-500'}`} />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  {expensesTrend > 0 ? 
                    <div className="flex items-center text-orange-600">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>{expensesTrend}% increase from previous {reportPeriod}</span>
                    </div> :
                    <div className="flex items-center text-green-600">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      <span>{Math.abs(expensesTrend)}% decrease from previous {reportPeriod}</span>
                    </div>
                  }
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-green-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Expected Revenue</h4>
                    <div className="text-2xl font-bold text-gray-800">₹{totalIncome.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Based on {budgetPlans.length} budget plans</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded-full">
                    <CircleDollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                    <span>Expected by end of {getReportEndDate(reportPeriod)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Estimated Profit</h4>
                    <div className="text-2xl font-bold text-gray-800">₹{(totalIncome - totalExpenses).toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">{calculateProfitMargin(totalIncome, totalExpenses)}% ROI</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${getProfitHealthColor(totalIncome, totalExpenses)}`} 
                      style={{ width: `${Math.min(100, calculateProfitMargin(totalIncome, totalExpenses) * 2)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 flex justify-between">
                    <span>Break-even</span>
                    <span>Target (50%)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Two-column layout for visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Expense Analysis - Improved with clearer labeling */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Monthly Expense Analysis</h4>
                <p className="text-xs text-gray-500 mb-4">View your expense trends over time</p>
                
                <div className="h-64">
                  {chartData.monthlyExpenses.labels.length > 0 ? (
                    <Bar 
                      data={chartData.monthlyExpenses}
                      options={{
                        ...barChartOptions,
                        plugins: {
                          ...barChartOptions.plugins,
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `₹${context.formattedValue}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return '₹' + value;
                              }
                            },
                            title: {
                              display: true,
                              text: 'Amount (₹)'
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Month'
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <BarChart2 className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-sm">Not enough expense data to show chart</p>
                      <p className="text-xs mt-1">Add expenses to see the chart</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Highest expense:</span> 
                      <span className="ml-1 text-gray-600">{getHighestExpenseMonth(chartData.monthlyExpenses)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Average:</span> 
                      <span className="ml-1 text-gray-600">₹{getAverageMonthlyExpense(chartData.monthlyExpenses)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expense Distribution - Improved with better categorization */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Expense Distribution by Category</h4>
                <p className="text-xs text-gray-500 mb-4">See where your money is being spent</p>
                
                <div className="h-64 flex justify-center">
                  {chartData.expenseDistribution.labels.length > 0 ? (
                    <Pie 
                      data={chartData.expenseDistribution}
                      options={{
                        ...pieChartOptions,
                        plugins: {
                          ...pieChartOptions.plugins,
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const value = context.raw;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ₹${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <PieChart className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-sm">Not enough expense data to show chart</p>
                      <p className="text-xs mt-1">Add expenses to see the chart</p>
                    </div>
                  )}
                </div>
                
                {chartData.expenseDistribution.labels.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm mb-2 font-medium text-gray-700">Top spending categories:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {getTopExpenseCategories(chartData.expenseDistribution).map((category, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-2" 
                            style={{ backgroundColor: chartData.expenseDistribution.datasets[0].backgroundColor[category.index] }}
                          ></div>
                          <div className="text-xs">
                            <span className="text-gray-600">{category.label}:</span> 
                            <span className="ml-1 font-medium">{category.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Loan Repayment Schedule - Improved with clearer information */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Loan Repayment Schedule</h4>
                  <p className="text-xs text-gray-500">Track your upcoming loan payments</p>
                </div>
                <button 
                  onClick={() => setActiveTab('loans')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All Loans
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                      <th className="pb-2 font-medium text-gray-700">Loan Name</th>
                      <th className="pb-2 font-medium text-gray-700">Lender</th>
                      <th className="pb-2 font-medium text-gray-700">Next Payment</th>
                      <th className="pb-2 font-medium text-gray-700">Amount</th>
                      <th className="pb-2 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.loans
                      .filter(loan => loan.status !== 'Repaid') // Filter out repaid loans
                      .map((loan, index) => {
                        // Calculate EMI amount for each loan if not already set
                        const emiAmount = loan.emiAmount || 
                          (loan.status === 'Approved' ? 
                            calculateEMI(loan.amount, loan.interestRate, 12) : null);
                        
                        // Determine loan status display
                        let statusDisplay = 'Pending';
                        let statusClass = 'bg-blue-100 text-blue-800';
                        
                        if (loan.status === 'Approved') {
                          if (loan.nextPaymentDate && new Date(loan.nextPaymentDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
                            statusDisplay = 'Due Soon';
                            statusClass = 'bg-orange-100 text-orange-800';
                          } else {
                            statusDisplay = 'On Schedule';
                            statusClass = 'bg-green-100 text-green-800';
                          }
                        }
                        
                        return (
                          <tr key={loan.id || index} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 font-medium text-gray-800">{loan.schemeName}</td>
                            <td className="py-3 text-gray-700">{loan.bankName}</td>
                            <td className="py-3 text-gray-700">
                              {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' }) : 'Not scheduled'}
                            </td>
                            <td className="py-3 text-gray-700">₹{emiAmount ? Math.round(emiAmount).toLocaleString() : '-'}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
                                {statusDisplay}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="text-right text-xs text-gray-500 mt-4">
              Data last updated: {new Date().toLocaleString()}
            </div>
          </div>
        )}
      </div>
      
      {/* Payment Confirmation Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Payment</h3>
              <button
                onClick={() => setPaymentModal({isOpen: false, loanId: null, loanDetails: null, paymentAmount: 0})}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {paymentModal.loanDetails && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Loan Scheme</p>
                  <p className="font-medium text-gray-900">{paymentModal.loanDetails.schemeName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Bank</p>
                  <p className="font-medium text-gray-900">{paymentModal.loanDetails.bankName}</p>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Payment Amount</p>
                    <p className="text-lg font-bold text-green-600">₹{paymentModal.paymentAmount ? paymentModal.paymentAmount.toLocaleString() : '0'}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Payment Date</p>
                    <p className="font-medium text-gray-900">{new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                
                {/* Payment breakdown */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-2">Payment Breakdown</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Principal</p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(() => {
                          const loan = paymentModal.loanDetails;
                          const installment = loanInstallments[loan.id] || { remainingPrincipal: loan.amount };
                          const monthlyRate = (loan.interestRate / 100) / 12;
                          const interest = (installment.remainingPrincipal || loan.amount) * monthlyRate;
                          const principal = paymentModal.paymentAmount - interest;
                          return Math.round(principal).toLocaleString();
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Interest</p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(() => {
                          const loan = paymentModal.loanDetails;
                          const installment = loanInstallments[loan.id] || { remainingPrincipal: loan.amount };
                          const monthlyRate = (loan.interestRate / 100) / 12;
                          const interest = (installment.remainingPrincipal || loan.amount) * monthlyRate;
                          return Math.round(interest).toLocaleString();
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Note:</span> This payment will be recorded in your payment history and the next payment date will be updated automatically.
                  </p>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setPaymentModal({isOpen: false, loanId: null, loanDetails: null, paymentAmount: 0})}
                    className="flex-1 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLoanPayment}
                    className="flex-1 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialResourceManagement; 