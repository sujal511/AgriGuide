import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, Square, Plus, Trash2, Calendar } from 'lucide-react';

const TaskManager = () => {
  // Initial task data
  const initialTasks = [
    { id: 1, title: 'Irrigation Check', priority: 'High', dueDate: 'Today', actualDate: new Date().toISOString().split('T')[0], completed: false, dateOrder: 1 },
    { id: 2, title: 'Apply Fertilizer - Field 2', priority: 'Medium', dueDate: 'Tomorrow', actualDate: (() => { 
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); 
      return tomorrow.toISOString().split('T')[0];
    })(), completed: false, dateOrder: 2 },
    { id: 3, title: 'Equipment Maintenance', priority: 'Low', dueDate: 'Next Week', actualDate: (() => { 
      const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7); 
      return nextWeek.toISOString().split('T')[0];
    })(), completed: false, dateOrder: 3 },
  ];
  
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('farmTasks');
    
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Sort tasks by their dateOrder or actualDate
        const sortedTasks = sortTasksByDate(parsedTasks);
        setTasks(sortedTasks);
      } catch (err) {
        console.error("Error parsing tasks from localStorage:", err);
        // If there's an error, initialize with default tasks
        localStorage.setItem('farmTasks', JSON.stringify(initialTasks));
        setTasks(initialTasks);
      }
    } else {
      // If no tasks in localStorage, use the initial tasks
      localStorage.setItem('farmTasks', JSON.stringify(initialTasks));
      setTasks(initialTasks);
    }
  }, []);

  // Helper function to determine date order (Today=1, Tomorrow=2, dates after=3+)
  const getDateOrder = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (dateStr === today) return 1;
    if (dateStr === tomorrowStr) return 2;
    
    // For other dates, calculate days from today
    const date = new Date(dateStr);
    const diffTime = date.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 2; // +2 because Today=1, Tomorrow=2
  };

  // Sort tasks by date
  const sortTasksByDate = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      // First by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Then by date order or actualDate
      const aOrder = a.dateOrder || getDateOrder(a.actualDate);
      const bOrder = b.dateOrder || getDateOrder(b.actualDate);
      return aOrder - bOrder;
    });
  };

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('farmTasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const toggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(sortTasksByDate(updatedTasks));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    // Format date for display
    let displayDate = 'Today';
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (newDueDate === today) {
      displayDate = 'Today';
    } else if (newDueDate === tomorrowStr) {
      displayDate = 'Tomorrow';
    } else {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      if (new Date(newDueDate) <= nextWeek) {
        displayDate = 'Next Week';
      } else {
        // Format date as DD/MM/YYYY
        const date = new Date(newDueDate);
        displayDate = date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }
    
    const task = {
      id: Date.now(),
      title: newTask,
      priority: newPriority,
      dueDate: displayDate,
      actualDate: newDueDate,
      dateOrder: getDateOrder(newDueDate),
      completed: false
    };
    
    const updatedTasks = [...tasks, task];
    setTasks(sortTasksByDate(updatedTasks));
    setNewTask('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Upcoming Tasks</h2>
      </div>
      
      {/* Add new task form */}
      <form onSubmit={addTask} className="flex flex-col md:flex-row mb-6 space-y-2 md:space-y-0 md:space-x-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex space-x-2">
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          
          <div className="relative flex items-center">
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pl-8"
            />
            <Calendar className="absolute left-2 h-4 w-4 text-gray-400" />
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </form>
      
      {/* Task list */}
      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-3 border-l-4 ${
                task.completed 
                  ? 'bg-gray-50 border-gray-300 opacity-60' 
                  : 'bg-white border-green-500'
              } rounded-lg shadow-sm`}
            >
              <div className="flex items-center space-x-3">
                <button onClick={() => toggleTaskCompletion(task.id)}>
                  {task.completed ? (
                    <CheckSquare className="h-5 w-5 text-green-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-800'}>
                  {task.title}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(task.priority)}`}>
                  {task.priority}
                </span>
                <span className="text-sm text-gray-500">{task.dueDate}</span>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No tasks yet. Add one above!</p>
        )}
      </div>
    </div>
  );
};

export default TaskManager; 