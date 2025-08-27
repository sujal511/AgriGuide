import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Local storage keys
const STORAGE_KEYS = {
  FINANCIAL_DATA: 'financial_resources_data'
};

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get stored financial data from localStorage
const getStoredFinancialData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.FINANCIAL_DATA);
  return data ? JSON.parse(data) : null;
};

// Store financial data in localStorage
const storeFinancialData = (data) => {
  localStorage.setItem(STORAGE_KEYS.FINANCIAL_DATA, JSON.stringify(data));
};

// Fetch all financial resources
export const getFinancialResources = async () => {
  try {
    // Try to get from API first
    const response = await axios.get(`${API_URL}/api/financial-resources/`, {
      headers: {
        ...getAuthHeader()
      }
    });
    
    // If successful, store in localStorage as backup
    if (response.data) {
      storeFinancialData(response.data);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching financial resources from API:', error);
    
    // Try to get from localStorage if API fails
    const storedData = getStoredFinancialData();
    if (storedData) {
      console.log('Using locally stored financial data');
      return { success: true, data: storedData };
    }
    
    return { 
      success: false, 
      message: error.response?.data?.error || 'Failed to fetch financial data' 
    };
  }
};

// Expense CRUD operations
export const createExpense = async (expenseData) => {
  try {
    const response = await axios.post(`${API_URL}/api/financial-resources/expenses/`, expenseData, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    // Update local storage with new data
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.expenses.push({...expenseData, id: response.data.id || expenseData.id});
      storeFinancialData(storedData);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating expense:', error);
    
    // Update local storage anyway to ensure data doesn't get lost
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.expenses.push(expenseData);
      storeFinancialData(storedData);
    }
    
    return { 
      success: true, // Return success even if API fails to maintain UI flow
      message: 'Saved locally. API connection error: ' + (error.response?.data?.error || 'Failed to create expense'),
      data: { id: expenseData.id }
    };
  }
};

export const updateExpense = async (expenseId, expenseData) => {
  try {
    const response = await axios.put(`${API_URL}/api/financial-resources/expenses/${expenseId}/`, expenseData, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    // Update local storage with new data
    const storedData = getStoredFinancialData();
    if (storedData) {
      const index = storedData.expenses.findIndex(expense => expense.id === expenseId);
      if (index !== -1) {
        storedData.expenses[index] = expenseData;
        storeFinancialData(storedData);
      }
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating expense:', error);
    
    // Update local storage anyway to ensure data doesn't get lost
    const storedData = getStoredFinancialData();
    if (storedData) {
      const index = storedData.expenses.findIndex(expense => expense.id === expenseId);
      if (index !== -1) {
        storedData.expenses[index] = expenseData;
        storeFinancialData(storedData);
      }
    }
    
    return { 
      success: true, // Return success even if API fails to maintain UI flow
      message: 'Saved locally. API connection error: ' + (error.response?.data?.error || 'Failed to update expense')
    };
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/financial-resources/expenses/${expenseId}/delete/`, {
      headers: {
        ...getAuthHeader()
      }
    });
    
    // Update local storage with new data
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.expenses = storedData.expenses.filter(expense => expense.id !== expenseId);
      storeFinancialData(storedData);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting expense:', error);
    
    // Update local storage anyway to ensure data doesn't get lost
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.expenses = storedData.expenses.filter(expense => expense.id !== expenseId);
      storeFinancialData(storedData);
    }
    
    return { 
      success: true, // Return success even if API fails to maintain UI flow
      message: 'Deleted locally. API connection error: ' + (error.response?.data?.error || 'Failed to delete expense')
    };
  }
};

// Loan CRUD operations
export const createLoan = async (loanData) => {
  try {
    const response = await axios.post(`${API_URL}/api/financial-resources/loans/`, loanData, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    // Update local storage with new data
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.loans.push({...loanData, id: response.data.id || loanData.id});
      storeFinancialData(storedData);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating loan:', error);
    
    // Update local storage anyway to ensure data doesn't get lost
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.loans.push(loanData);
      storeFinancialData(storedData);
    }
    
    return { 
      success: true, // Return success even if API fails to maintain UI flow
      message: 'Saved locally. API connection error: ' + (error.response?.data?.error || 'Failed to create loan'),
      data: { id: loanData.id }
    };
  }
};

export const updateLoan = async (loanId, loanData) => {
  try {
    const response = await axios.put(`${API_URL}/api/financial-resources/loans/${loanId}/`, loanData, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    // Update local storage with new data
    const storedData = getStoredFinancialData();
    if (storedData) {
      const index = storedData.loans.findIndex(loan => loan.id === loanId);
      if (index !== -1) {
        storedData.loans[index] = loanData;
        storeFinancialData(storedData);
      }
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating loan:', error);
    
    // Update local storage anyway to ensure data doesn't get lost
    const storedData = getStoredFinancialData();
    if (storedData) {
      const index = storedData.loans.findIndex(loan => loan.id === loanId);
      if (index !== -1) {
        storedData.loans[index] = loanData;
        storeFinancialData(storedData);
      }
    }
    
    return { 
      success: true, // Return success even if API fails to maintain UI flow
      message: 'Saved locally. API connection error: ' + (error.response?.data?.error || 'Failed to update loan')
    };
  }
};

export const deleteLoan = async (loanId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/financial-resources/loans/${loanId}/delete/`, {
      headers: {
        ...getAuthHeader()
      }
    });
    
    // Update local storage with new data
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.loans = storedData.loans.filter(loan => loan.id !== loanId);
      storeFinancialData(storedData);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting loan:', error);
    
    // Update local storage anyway to ensure data doesn't get lost
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.loans = storedData.loans.filter(loan => loan.id !== loanId);
      storeFinancialData(storedData);
    }
    
    return { 
      success: true, // Return success even if API fails to maintain UI flow
      message: 'Deleted locally. API connection error: ' + (error.response?.data?.error || 'Failed to delete loan')
    };
  }
};

// Budget Plan CRUD operations
export const createBudgetPlan = async (budgetPlanData) => {
  try {
    const response = await axios.post(`${API_URL}/api/financial-resources/budgetPlans/`, budgetPlanData, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    // Update local storage with new data
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.budgetPlans.push({...budgetPlanData, id: response.data.id || budgetPlanData.id});
      storeFinancialData(storedData);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating budget plan:', error);
    
    // Update local storage anyway to ensure data doesn't get lost
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.budgetPlans.push(budgetPlanData);
      storeFinancialData(storedData);
    }
    
    return { 
      success: true, // Return success even if API fails to maintain UI flow
      message: 'Saved locally. API connection error: ' + (error.response?.data?.error || 'Failed to create budget plan'),
      data: { id: budgetPlanData.id }
    };
  }
};

export const updateBudgetPlan = async (planId, budgetPlanData) => {
  try {
    const response = await axios.put(`${API_URL}/api/financial-resources/budgetPlans/${planId}/`, budgetPlanData, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    // Update local storage with new data
    const storedData = getStoredFinancialData();
    if (storedData) {
      const index = storedData.budgetPlans.findIndex(plan => plan.id === planId);
      if (index !== -1) {
        storedData.budgetPlans[index] = budgetPlanData;
        storeFinancialData(storedData);
      }
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating budget plan:', error);
    
    // Update local storage anyway to ensure data doesn't get lost
    const storedData = getStoredFinancialData();
    if (storedData) {
      const index = storedData.budgetPlans.findIndex(plan => plan.id === planId);
      if (index !== -1) {
        storedData.budgetPlans[index] = budgetPlanData;
        storeFinancialData(storedData);
      }
    }
    
    return { 
      success: true, // Return success even if API fails to maintain UI flow
      message: 'Saved locally. API connection error: ' + (error.response?.data?.error || 'Failed to update budget plan')
    };
  }
};

export const deleteBudgetPlan = async (planId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/financial-resources/budgetPlans/${planId}/delete/`, {
      headers: {
        ...getAuthHeader()
      }
    });
    
    // Update local storage with new data
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.budgetPlans = storedData.budgetPlans.filter(plan => plan.id !== planId);
      storeFinancialData(storedData);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting budget plan:', error);
    
    // Update local storage anyway to ensure data doesn't get lost
    const storedData = getStoredFinancialData();
    if (storedData) {
      storedData.budgetPlans = storedData.budgetPlans.filter(plan => plan.id !== planId);
      storeFinancialData(storedData);
    }
    
    return { 
      success: true, // Return success even if API fails to maintain UI flow
      message: 'Deleted locally. API connection error: ' + (error.response?.data?.error || 'Failed to delete budget plan')
    };
  }
}; 