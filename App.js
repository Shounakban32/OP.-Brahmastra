import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, BookOpen, Search, Upload, Plus, Zap, Award, Coffee, Wind, Star, Sun, Moon, Target } from 'lucide-react';

// Function to generate the 45-day study plan
const generateInitialTasks = () => {
    const tasks = {};
    const startDate = new Date('2025-07-18T00:00:00');
    let currentId = 1;

    for (let i = 0; i < 45; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        tasks[dateString] = [];

        const dailyObjectives = [
            { id: currentId++, category: 'Intel Review', text: '2 IMS Videos', time: 90, completed: false },
            { id: currentId++, category: 'Marksmanship', text: 'Arun Sharma QA – 30 Qs', time: 75, completed: false },
            { id: currentId++, category: 'Marksmanship', text: 'IMS QA – ~16 Qs', time: 45, completed: false },
            { id: currentId++, category: 'Data Ops', text: 'IMS DI – ~5 Qs', time: 45, completed: false },
            { id: currentId++, category: 'Verbal Ops', text: 'IMS VA – ~40 Qs', time: 60, completed: false },
            { id: currentId++, category: 'Recon', text: 'RC Sets – 3 Sets', time: 45, completed: false },
            { id: currentId++, category: 'Field Drills', text: 'DILR Sets – 15–20 Sets', time: 120, completed: false },
            { id: currentId++, category: 'Field Manuals', text: 'Reading – 45 minutes', time: 45, completed: false }
        ];

        // Add 1 EG Concept Class for the first 15 days
        if (i < 15) {
            tasks[dateString].push(
                { id: currentId++, category: 'Special Training', text: 'EG Concept Class', time: 120, completed: false }
            );
        }
        
        tasks[dateString].push(...dailyObjectives);
    }
    return tasks;
};


const motivationalQuotes = [
  "Victory is reserved for those who are willing to pay its price.",
  "The only easy day was yesterday.",
  "Out of every one hundred men, ten shouldn't even be there, eighty are just targets, nine are the real fighters, and we are lucky to have them, for they make the battle. Ah, but the one, one is a warrior, and he will bring the others back.",
  "Discipline is the soul of an army. It makes small numbers formidable; procures success to the weak, and esteem to all.",
  "To be prepared for war is one of the most effective means of preserving peace."
];

// Military Theme Colors
const PIE_COLORS = ['#4a5568', '#e53e3e']; // Gray for completed, Red for backlog

// Helper to get dates
const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: numDays }, (_, i) => new Date(year, month, i + 1));
};


// Main App Component
export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date('2025-07-18T00:00:00'));
  const [tasks, setTasks] = useState(generateInitialTasks());
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [quote, setQuote] = useState('');

  const operationStartDate = new Date('2025-07-18T00:00:00');
  const today = new Date(); // Use current date for countdown
  const daysElapsed = Math.floor((today - operationStartDate) / (1000 * 60 * 60 * 24));
  const operationDaysLeft = Math.max(0, 45 - daysElapsed);

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    document.body.style.backgroundColor = '#1a202c';
    document.body.style.fontFamily = "'Roboto Mono', monospace";
  }, []);

  const handleTaskToggle = (date, taskId) => {
    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      const dayTasks = newTasks[date].map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      newTasks[date] = dayTasks;
      return newTasks;
    });
  };

  const getOverallProgress = useCallback(() => {
    const allTasks = Object.values(tasks).flat();
    if (allTasks.length === 0) return 0;
    const completedTasks = allTasks.filter(t => t.completed).length;
    return Math.round((completedTasks / allTasks.length) * 100);
  }, [tasks]);

  const getWeeklySummary = useCallback(() => {
    const summaryStartDate = new Date('2025-07-18T00:00:00');
    const startOfWeek = new Date(summaryStartDate);
    startOfWeek.setDate(summaryStartDate.getDate() - summaryStartDate.getDay());

    let planned = 0;
    let completed = 0;
    let backlog = 0;
    
    for (let i=0; i<7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dateString = day.toISOString().split('T')[0];
        if (tasks[dateString]) {
            const dayTasks = tasks[dateString];
            planned += dayTasks.length;
            completed += dayTasks.filter(t => t.completed).length;
            if (day < summaryStartDate) {
                backlog += dayTasks.filter(t => !t.completed).length;
            }
        }
    }
    return { planned, completed, backlog };
  }, [tasks]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard progress={getOverallProgress()} weeklySummary={getWeeklySummary()} operationDaysLeft={operationDaysLeft} quote={quote} />;
      case 'Planner':
        return <DailyPlanner currentDate={currentDate} setCurrentDate={setCurrentDate} tasks={tasks} handleTaskToggle={handleTaskToggle} />;
      case 'Backlog':
        return <BacklogPane tasks={tasks} />;
      case 'Milestones':
        return <Milestones />;
      case 'Pomodoro':
        return <PomodoroTimer />;
      case 'History':
        return <StudyHistory tasks={tasks} />;
      default:
        return <Dashboard progress={getOverallProgress()} weeklySummary={getWeeklySummary()} operationDaysLeft={operationDaysLeft} quote={quote} />;
    }
  };

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen font-mono">
      <div className="flex flex-col lg:flex-row">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = ['Dashboard', 'Planner', 'Backlog', 'Milestones', 'Pomodoro', 'History'];
  const navIcons = {
    Dashboard: <Target className="w-5 h-5" />,
    Planner: <BookOpen className="w-5 h-5" />,
    Backlog: <Zap className="w-5 h-5 text-red-500" />,
    Milestones: <Award className="w-5 h-5" />,
    Pomodoro: <Coffee className="w-5 h-5" />,
    History: <Clock className="w-5 h-5" />,
  };

  return (
    <aside className="bg-gray-900 lg:w-64 lg:min-h-screen border-b lg:border-r border-gray-700">
      <div className="p-6 hidden lg:block">
        <h1 className="text-2xl font-bold text-gray-400 tracking-widest">C.A.T. COMMAND</h1>
      </div>
      <nav className="flex lg:flex-col justify-around lg:justify-start p-2 lg:p-4">
        {navItems.map(item => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === item
                ? 'bg-red-800/40 text-red-400'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            {navIcons[item]}
            <span className="hidden lg:inline">{item}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

// Dashboard Component
const Dashboard = ({ progress, weeklySummary, operationDaysLeft, quote }) => {
    const data = [
        { name: 'Completed', value: weeklySummary.completed },
        { name: 'M.I.A', value: weeklySummary.backlog },
    ];

    return (
        <div>
            <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-2 border-gray-700 flex items-center justify-center bg-gray-800">
                    <Target className="w-16 h-16 lg:w-20 lg:h-20 text-red-500" />
                </div>
                <div>
                    <h2 className="text-3xl lg:text-5xl font-bold text-gray-200 tracking-wider">OPERATION BRAHMASTRA</h2>
                    <p className="text-red-500 font-semibold">45-DAY INTENSIVE PREP</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Countdown */}
                <div className="bg-gray-800 p-6 rounded-md border border-gray-700 flex flex-col items-center justify-center text-center">
                    <h3 className="text-5xl font-bold text-red-500">{operationDaysLeft}</h3>
                    <p className="text-lg font-medium mt-2 text-gray-400 uppercase tracking-widest">Operation Days Left</p>
                </div>
                {/* Overall Progress */}
                <div className="bg-gray-800 p-6 rounded-md border border-gray-700">
                    <h3 className="font-bold text-lg mb-4 text-gray-400 uppercase tracking-wider">Mission Progress</h3>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                        <div className="bg-red-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-center mt-2 font-semibold text-xl text-gray-200">{progress}% Complete</p>
                </div>
                {/* Weekly Summary */}
                <div className="bg-gray-800 p-6 rounded-md border border-gray-700 md:col-span-2 lg:col-span-1">
                    <h3 className="font-bold text-lg mb-4 text-gray-400 uppercase tracking-wider">Weekly Sit-Rep</h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={50} fill="#8884d8" paddingAngle={5} dataKey="value">
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-around mt-4 text-center">
                        <div><p className="font-bold text-lg text-gray-200">{weeklySummary.planned}</p><p className="text-sm text-gray-400">Objectives</p></div>
                        <div><p className="font-bold text-lg text-green-500">{weeklySummary.completed}</p><p className="text-sm text-gray-400">Neutralized</p></div>
                        <div><p className="font-bold text-lg text-red-500">{weeklySummary.backlog}</p><p className="text-sm text-gray-400">M.I.A.</p></div>
                    </div>
                </div>
                 {/* Commander's Words */}
                <div className="bg-gray-800 p-6 rounded-md border border-gray-700 md:col-span-2">
                    <h3 className="font-bold text-lg mb-2 text-gray-400 uppercase tracking-wider">Commander's Words</h3>
                    <p className="text-gray-300 italic">"{quote}"</p>
                </div>
                 {/* Smart Prediction */}
                <div className="bg-gray-800 p-6 rounded-md border border-gray-700">
                     <h3 className="font-bold text-lg mb-2 text-gray-400 uppercase tracking-wider">Threat Analysis</h3>
                     <p className="text-sm text-gray-300 mb-2">Current ETA for Mission Completion: <span className="font-bold text-red-500">Aug 31, 2025</span>.</p>
                     <p className="text-sm text-gray-300">Required pace increase: <span className="font-bold text-orange-400">5%</span>.</p>
                </div>

            </div>
        </div>
    );
};

// Daily Planner Component
const DailyPlanner = ({ currentDate, setCurrentDate, tasks, handleTaskToggle }) => {
  const dateString = currentDate.toISOString().split('T')[0];
  const dailyTasks = tasks[dateString] || [];
  const monthDates = getDaysInMonth(currentDate);

  const handleDateChange = (date) => {
    setCurrentDate(date);
  };
  
  const changeMonth = (offset) => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + offset, 1);
        return newDate;
    });
  }

  const completedCount = dailyTasks.filter(t => t.completed).length;
  const dailyProgress = dailyTasks.length > 0 ? Math.round((completedCount / dailyTasks.length) * 100) : 0;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4 uppercase tracking-widest">Daily Briefing</h2>
      
      <div className="bg-gray-800 p-4 rounded-md border border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-3">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft /></button>
            <h3 className="text-lg font-semibold text-gray-300">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight /></button>
        </div>
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {monthDates.map(date => (
            <button
              key={date.toISOString()}
              onClick={() => handleDateChange(date)}
              className={`flex-shrink-0 w-14 h-20 rounded-md flex flex-col items-center justify-center transition-all duration-200 border ${
                date.toDateString() === currentDate.toDateString()
                  ? 'bg-red-700 text-white border-red-500'
                  : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
              }`}
            >
              <span className="text-xs">{date.toLocaleString('default', { weekday: 'short' })}</span>
              <span className="font-bold text-lg">{date.getDate()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h3 className="text-xl font-bold text-gray-300">Objectives for {currentDate.toLocaleDateString('en-CA')}</h3>
                <p className="text-sm text-gray-400">{completedCount} of {dailyTasks.length} objectives neutralized</p>
            </div>
            <div className="w-1/3">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{width: `${dailyProgress}%`}}></div>
                </div>
            </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto pr-2">
            {dailyTasks.length > 0 ? (
                dailyTasks.map(task => (
                    <div key={task.id} className={`flex items-center justify-between p-4 rounded-md mb-2 transition-all border ${task.completed ? 'bg-green-900/30 border-green-800/40 text-gray-500' : 'bg-gray-900/50 border-gray-700'}`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleTaskToggle(dateString, task.id)}>
                                <CheckCircle className={`w-6 h-6 transition-all ${task.completed ? 'text-green-400' : 'text-gray-600'}`} />
                            </button>
                            <div>
                                <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>{task.text}</p>
                                <span className="text-xs text-red-400 bg-red-800/50 px-2 py-0.5 rounded-full">{task.category}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{task.time} min</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>No objectives scheduled. Awaiting orders.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};


// Backlog Pane Component
const BacklogPane = ({ tasks }) => {
    const today = new Date('2025-07-18T00:00:00');
    const backlogTasks = Object.entries(tasks)
        .filter(([date]) => new Date(date) < today)
        .flatMap(([date, dayTasks]) => 
            dayTasks.filter(task => !task.completed).map(task => ({ ...task, date }))
        );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 uppercase tracking-widest">M.I.A. Objectives</h2>
            <div className="bg-gray-800 p-6 rounded-md border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-300">Mission Failures</h3>
                {backlogTasks.length > 0 ? (
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                        {backlogTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-4 rounded-md bg-red-900/30 border border-red-700/50">
                                <div>
                                    <p className="font-medium text-gray-200">{task.text}</p>
                                    <span className="text-xs text-red-400">❗Failed on {task.date}</span>
                                </div>
                                <button className="text-sm text-blue-400 hover:underline">Redeploy</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-10 text-gray-500">No M.I.A. objectives. All clear.</p>
                )}
            </div>
        </div>
    );
};

// Milestones Component
const Milestones = () => {
    const achievements = [
        { id: 1, badge: '🔥', title: '5-Day Streak', unlocked: true, date: 'July 15, 2025' },
        { id: 2, badge: '🎯', title: 'First Chapter Done', unlocked: true, date: 'July 10, 2025' },
        { id: 3, badge: '🚀', title: '50% Overall Progress', unlocked: false },
        { id: 4, badge: '🏆', title: '100% Overall Progress', unlocked: false },
        { id: 5, badge: '📚', title: 'Read 10 Articles', unlocked: true, date: 'July 16, 2025' },
        { id: 6, badge: '🧠', title: '50 DILR Sets Solved', unlocked: false },
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 uppercase tracking-widest">Commendations</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {achievements.map(ach => (
                    <div key={ach.id} className={`p-6 rounded-md text-center transition-all duration-300 border ${ach.unlocked ? 'bg-gray-800 border-yellow-500/50' : 'bg-gray-800/50 border-gray-700'}`}>
                        <div className={`text-5xl mb-3 transition-transform duration-300 ${ach.unlocked ? 'transform scale-110' : 'opacity-40'}`}>{ach.badge}</div>
                        <h3 className={`font-bold ${ach.unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>{ach.title}</h3>
                        {ach.unlocked ? 
                            <p className="text-xs text-gray-400 mt-1">Awarded {ach.date}</p> :
                            <p className="text-xs text-gray-500 mt-1">Locked</p>
                        }
                    </div>
                ))}
            </div>
        </div>
    );
};

// Pomodoro Timer Component
const PomodoroTimer = () => {
    const [time, setTime] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // focus, short, long
    const [sound, setSound] = useState('none');

    useEffect(() => {
        let interval = null;
        if (isActive && time > 0) {
            interval = setInterval(() => {
                setTime(t => t - 1);
            }, 1000);
        } else if (isActive && time === 0) {
            clearInterval(interval);
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, time]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = (newMode) => {
        setIsActive(false);
        setMode(newMode);
        if (newMode === 'focus') setTime(25 * 60);
        else if (newMode === 'short') setTime(5 * 60);
        else if (newMode === 'long') setTime(10 * 60);
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 uppercase tracking-widest">Focus Timer</h2>
            <div className="bg-gray-800 p-8 rounded-md border border-gray-700 max-w-md mx-auto text-center">
                <div className="flex justify-center gap-2 mb-6">
                    <button onClick={() => resetTimer('focus')} className={`px-4 py-1.5 rounded-full text-sm ${mode === 'focus' ? 'bg-red-700 text-white' : 'bg-gray-700'}`}>Focus</button>
                    <button onClick={() => resetTimer('short')} className={`px-4 py-1.5 rounded-full text-sm ${mode === 'short' ? 'bg-red-700 text-white' : 'bg-gray-700'}`}>Short Rest</button>
                    <button onClick={() => resetTimer('long')} className={`px-4 py-1.5 rounded-full text-sm ${mode === 'long' ? 'bg-red-700 text-white' : 'bg-gray-700'}`}>Long Rest</button>
                </div>
                <div className="text-8xl font-bold my-8 text-gray-100">{formatTime(time)}</div>
                <button onClick={toggleTimer} className="w-full bg-red-600 text-white py-3 rounded-md text-xl font-bold uppercase tracking-wider hover:bg-red-700">
                    {isActive ? 'Pause' : 'Engage'}
                </button>
            </div>
        </div>
    );
};

// Study History Component
const StudyHistory = ({ tasks }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const allTasks = Object.entries(tasks).flatMap(([date, dayTasks]) => 
        dayTasks.map(task => ({ ...task, date }))
    );

    const filteredTasks = allTasks.filter(task => 
        task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => new Date(b.date) - new Date(a.date));

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 uppercase tracking-widest">Mission Logs</h2>
            <div className="bg-gray-800 p-6 rounded-md border border-gray-700">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        type="text"
                        placeholder="Search logs by keyword or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border bg-gray-900 border-gray-600 rounded-md text-gray-200"
                    />
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {filteredTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 border-b border-gray-700">
                            <div>
                                <p className="font-medium text-gray-300">{task.text}</p>
                                <span className="text-xs text-gray-500">{task.date}</span>
                            </div>
                            {task.completed ? 
                                <span className="text-xs text-green-500 bg-green-900/40 px-2 py-1 rounded-full">Success</span> :
                                <span className="text-xs text-orange-400 bg-orange-900/40 px-2 py-1 rounded-full">Pending</span>
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
