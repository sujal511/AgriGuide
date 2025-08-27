import React, { useState, useEffect } from 'react';
import { PieChart, Calendar, ArrowRight, Sliders, Calculator } from 'lucide-react';

const EMICalculator = ({ 
  initialLoanAmount = 100000, 
  initialInterestRate = 8.5, 
  initialLoanTerm = 12, 
  onClose 
}) => {
  const [loanAmount, setLoanAmount] = useState(initialLoanAmount);
  const [interestRate, setInterestRate] = useState(initialInterestRate);
  const [loanTerm, setLoanTerm] = useState(initialLoanTerm);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [activeTab, setActiveTab] = useState('calculator');
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [showAmortizationTable, setShowAmortizationTable] = useState(false);

  // Calculate EMI when inputs change
  useEffect(() => {
    console.log('EMICalculator component loaded with values:', { loanAmount, interestRate, loanTerm });
    calculateEMI();
  }, [loanAmount, interestRate, loanTerm]);

  // Calculate the EMI and related values
  const calculateEMI = () => {
    // Convert interest rate from percentage to decimal per month
    const monthlyInterestRate = interestRate / 12 / 100;
    
    // Calculate monthly payment using the formula: P x R x (1+R)^N / [(1+R)^N-1]
    const emi = loanAmount * monthlyInterestRate * 
                Math.pow(1 + monthlyInterestRate, loanTerm) / 
                (Math.pow(1 + monthlyInterestRate, loanTerm) - 1);
    
    // Use the exact EMI value for total calculations to avoid compounding rounding errors
    const exactEmi = emi;
    const totalPay = exactEmi * loanTerm;
    const totalInt = totalPay - loanAmount;
    
    setMonthlyPayment(emi);
    setTotalPayment(totalPay);
    setTotalInterest(totalInt);
    
    // Generate amortization schedule
    generateAmortizationSchedule(exactEmi, monthlyInterestRate);
  };

  // Generate amortization schedule
  const generateAmortizationSchedule = (monthlyPayment, monthlyRate) => {
    let balance = loanAmount;
    let schedule = [];
    
    for (let month = 1; month <= loanTerm; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      // Ensure we don't have rounding issues with the final payment
      const actualPrincipalPayment = month === loanTerm && balance < principalPayment ? balance : principalPayment;
      balance -= actualPrincipalPayment;
      
      // Ensure balance doesn't go negative due to rounding errors
      if (balance < 0) balance = 0;
      
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: actualPrincipalPayment,
        interest: interestPayment,
        balance: balance
      });
    }
    
    setAmortizationSchedule(schedule);
  };

  // Format currency
  const formatCurrency = (amount, decimals = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: decimals
    }).format(amount);
  };

  // Handle loan amount input change with value correction
  const handleLoanAmountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const constrainedValue = Math.min(Math.max(value, 10000), 50000000);
      setLoanAmount(constrainedValue);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 transition-all duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-3 sm:mb-0">
          <Calculator className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Loan EMI Calculator</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <button 
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'calculator' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('calculator')}
            >
              Calculator
            </button>
            <button 
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'chart' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('chart')}
            >
              Chart
            </button>
          </div>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Loan Input Sliders */}
            <div className="space-y-4">
              {/* Loan Amount Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Sliders className="h-4 w-4 mr-1.5 text-green-600 dark:text-green-400" />
                    Loan Amount
                  </label>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(loanAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="50000000"
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">₹10,000</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">₹5,00,00,000</span>
                </div>
              </div>

              {/* Interest Rate Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <PieChart className="h-4 w-4 mr-1.5 text-amber-500 dark:text-amber-400" />
                    Interest Rate (% per annum)
                  </label>
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {interestRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">4%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">24%</span>
                </div>
              </div>

              {/* Loan Term Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400" />
                    Loan Term (months)
                  </label>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {loanTerm} months
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="360"
                  step="3"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">3 months</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">30 years</span>
                </div>
              </div>
            </div>

            {/* Manual Input Option */}
            <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Manual Input</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Loan Amount
                  </label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={handleLoanAmountChange}
                    min="10000"
                    max="50000000"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={interestRate}
                    step="0.1"
                    min="4"
                    max="24"
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Term (months)
                  </label>
                  <input
                    type="number"
                    value={loanTerm}
                    min="3"
                    max="360"
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* EMI Result */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-6 rounded-lg border border-green-100 dark:border-green-800 flex flex-col">
            <div className="text-center mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Monthly Payment (EMI)
              </h3>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                {formatCurrency(monthlyPayment)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Payment: {formatCurrency(totalPayment)}
              </p>
            </div>
            
            <div className="space-y-4 mt-auto">
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Principal Amount</span>
                  <span className="text-gray-700 dark:text-gray-300">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 dark:bg-green-500" 
                    style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Interest</span>
                  <span className="text-gray-700 dark:text-gray-300">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 dark:bg-amber-400" 
                    style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-gray-500 dark:text-gray-400">Principal-to-Interest Ratio</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {Math.round((loanAmount / totalPayment) * 100)}% : {Math.round((totalInterest / totalPayment) * 100)}%
                  </span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 dark:bg-green-600" 
                    style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-amber-500 dark:bg-amber-600" 
                    style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                  ></div>
                </div>
                <div className="flex text-xs mt-2">
                  <div className="flex items-center mr-3">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-600 rounded-full mr-1"></div>
                    <span className="text-gray-600 dark:text-gray-400">Principal</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 dark:bg-amber-600 rounded-full mr-1"></div>
                    <span className="text-gray-600 dark:text-gray-400">Interest</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowAmortizationTable(!showAmortizationTable)}
              className="mt-4 flex items-center justify-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
            >
              {showAmortizationTable ? 'Hide Repayment Schedule' : 'View Repayment Schedule'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'chart' && (
        <div className="pt-2">
          <div className="flex justify-center">
            <div className="w-64 h-64 relative flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                {/* Background circle */}
                <circle 
                  cx="18" cy="18" r="15.91549430918954" 
                  fill="transparent" 
                  stroke="#f3f4f6" 
                  strokeWidth="3"
                  className="dark:stroke-gray-700"
                ></circle>
                
                {/* Principal portion */}
                <circle 
                  cx="18" cy="18" r="15.91549430918954" 
                  fill="transparent" 
                  stroke="#10b981" 
                  strokeWidth="3"
                  strokeDasharray={`${(loanAmount / totalPayment) * 100} ${100 - (loanAmount / totalPayment) * 100}`}
                  strokeDashoffset="25"
                  className="dark:stroke-green-600"
                ></circle>
                
                {/* Interest portion */}
                <circle 
                  cx="18" cy="18" r="15.91549430918954" 
                  fill="transparent" 
                  stroke="#f59e0b" 
                  strokeWidth="3"
                  strokeDasharray={`${(totalInterest / totalPayment) * 100} ${100 - (totalInterest / totalPayment) * 100}`}
                  strokeDashoffset={`${100 - (loanAmount / totalPayment) * 100 + 25}`}
                  className="dark:stroke-amber-600"
                ></circle>
              </svg>
              <div className="absolute text-center">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(monthlyPayment)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">per month</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-750 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loan Summary</h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Principal</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(loanAmount)}</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Interest Rate</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{interestRate}% p.a.</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Loan Term</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{loanTerm} months</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-750 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Summary</h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Monthly Payment</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(monthlyPayment)}</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total Interest</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(totalInterest)}</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total Payment</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(totalPayment)}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button
              onClick={() => setActiveTab('calculator')}
              className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
            >
              Back to Calculator
            </button>
          </div>
        </div>
      )}

      {/* Amortization Schedule */}
      {showAmortizationTable && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loan Repayment Schedule</h3>
          <div className="overflow-x-auto max-h-64 rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Principal</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {amortizationSchedule.slice(0, 12).map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">{row.month}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">{formatCurrency(row.payment)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">{formatCurrency(row.principal)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">{formatCurrency(row.interest)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
                {amortizationSchedule.length > 12 && (
                  <tr>
                    <td colSpan="5" className="px-3 py-2 text-xs text-center text-gray-500 dark:text-gray-400">
                      Showing first 12 months of {loanTerm} months
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Tips and educational content */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tips for Loan Management
        </h3>
        <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
          <li className="flex items-start">
            <span className="mr-1">•</span>
            <span>Lower interest rates and shorter loan terms can significantly reduce your total interest payments.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-1">•</span>
            <span>Making extra payments toward the principal can help pay off your loan faster and save on interest.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-1">•</span>
            <span>Consider your seasonal income patterns when planning loan repayments for agricultural purposes.</span>
          </li>
        </ul>
      </div>
      
      {/* Loan Term Comparison */}
      {activeTab === 'calculator' && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Loan Term Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Term</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Payment</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Interest</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { months: 12, label: '1 year' },
                  { months: 36, label: '3 years' },
                  { months: 60, label: '5 years' },
                  { months: 120, label: '10 years' }
                ].map((term) => {
                  // Calculate EMI for this term
                  const monthlyRate = interestRate / 12 / 100;
                  const emi = loanAmount * monthlyRate * 
                            Math.pow(1 + monthlyRate, term.months) / 
                            (Math.pow(1 + monthlyRate, term.months) - 1);
                  const totalPay = emi * term.months;
                  const totalInt = totalPay - loanAmount;
                  
                  // Highlight the row if it matches the current term
                  const isCurrentTerm = term.months === loanTerm;
                  
                  return (
                    <tr 
                      key={term.months} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isCurrentTerm ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                      onClick={() => setLoanTerm(term.months)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300 font-medium">
                        {term.label}
                        {isCurrentTerm && <span className="ml-2 text-green-600 dark:text-green-400">✓</span>}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                        {formatCurrency(emi)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                        {formatCurrency(totalInt)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                        {formatCurrency(totalPay)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Click on any row to set that loan term
          </p>
        </div>
      )}
    </div>
  );
};

export default EMICalculator; 