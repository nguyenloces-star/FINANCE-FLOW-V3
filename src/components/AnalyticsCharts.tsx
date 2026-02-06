import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils';
import { getCategoryById } from '../constants';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  currentDate: Date;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ transactions, currentDate }) => {
  
  // 1. Prepare Data for Area Chart (Daily Cash Flow) - LOGIC MỚI: CENTERED 7 DAYS
  const dailyData = useMemo(() => {
    const data = [];
    
    // Vòng lặp từ -3 (3 ngày trước) đến +3 (3 ngày sau)
    for (let i = -3; i <= 3; i++) {
        const targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + i); // Cộng/Trừ ngày

        // Format hiển thị trục X (dd/MM)
        const dayStr = targetDate.getDate().toString().padStart(2, '0');
        const monthStr = (targetDate.getMonth() + 1).toString().padStart(2, '0');
        const dateDisplay = `${dayStr}/${monthStr}`;

        // Tính tổng thu chi cho ngày này
        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            // So sánh chính xác ngày/tháng/năm
            if (
                tDate.getDate() === targetDate.getDate() &&
                tDate.getMonth() === targetDate.getMonth() &&
                tDate.getFullYear() === targetDate.getFullYear()
            ) {
                if (t.type === TransactionType.INCOME) {
                    income += t.amount;
                } else {
                    expense += t.amount;
                }
            }
        });

        data.push({
            date: dateDisplay, // Nhãn hiển thị (VD: 24/11)
            fullDate: targetDate, // Để debug nếu cần
            income,
            expense
        });
    }

    return data;
  }, [transactions, currentDate]);

  // 2. Prepare Data for Donut Charts
  const getCategoryData = (type: TransactionType) => {
    // Lọc giao dịch theo THÁNG hiện tại
    const relevantTransactions = transactions.filter(t => 
      t.type === type &&
      new Date(t.date).getMonth() === currentDate.getMonth() &&
      new Date(t.date).getFullYear() === currentDate.getFullYear()
    );

    const groups: { [key: string]: number } = {};
    relevantTransactions.forEach(t => {
      groups[t.category] = (groups[t.category] || 0) + t.amount;
    });

    const total = Object.values(groups).reduce((a, b) => a + b, 0);

    const data = Object.entries(groups).map(([id, value]) => {
      const cat = getCategoryById(id);
      return {
        name: cat.name,
        value,
        color: cat.color,
        percent: total > 0 ? (value / total) * 100 : 0
      };
    }).sort((a, b) => b.value - a.value);

    return { data, total };
  };

  const expenseData = useMemo(() => getCategoryData(TransactionType.EXPENSE), [transactions, currentDate]);
  const incomeData = useMemo(() => getCategoryData(TransactionType.INCOME), [transactions, currentDate]);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        let percent = 0;
        if (data && data.payload && typeof data.payload.percent === 'number') {
            percent = data.payload.percent;
        }
        
        return (
            <div className="bg-white/95 dark:bg-slate-800/95 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }}></div>
                    <p className="font-bold text-slate-800 dark:text-white">{data.name}</p>
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    {formatCurrency(data.value)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Share {percent.toFixed(1)}%
                </p>
            </div>
        );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 backdrop-blur-sm min-w-[180px]">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm mb-2 last:mb-0">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }} />
                 <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name}</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      
      {/* Row 1: Cash Flow Trend (Centered 7 Days) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Cash Flow Trend (7 Days)</h3>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Income
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span> Expense
                </div>
            </div>
        </div>
        <div className="h-[250px] md:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                width={45}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value)}
              />
              <Tooltip content={<CustomAreaTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" activeDot={{ r: 6, strokeWidth: 0, fill: "#059669" }} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 6, strokeWidth: 0, fill: "#ea580c" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Category Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Income Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 flex flex-col h-[500px] lg:h-[420px]">
          <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Income Structure</h3>
          </div>
          {/* FIX: Thêm overflow-hidden vào parent */}
          <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch gap-2 min-h-0 overflow-hidden">
            {/* Chart Side */}
            <div className="relative w-full lg:w-5/12 h-[220px] lg:h-full flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeData.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {incomeData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Income</span>
                  <span title={formatCurrency(incomeData.total)} className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 truncate w-full text-center max-w-[100px]">
                    {formatCurrency(incomeData.total)}
                  </span>
                </div>
            </div>
            
            {/* Legend List Side - FIX: Thêm lg:h-full */}
            <div className="w-full lg:w-7/12 flex-1 lg:h-full overflow-y-auto custom-scrollbar pr-2 min-h-0">
                {incomeData.data.length > 0 ? (
                    <div className="space-y-3">
                         {incomeData.data.map((item) => (
                            <div key={item.name} className="flex items-center justify-between gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate text-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="font-bold text-slate-800 dark:text-white text-sm whitespace-nowrap">
                                        {formatCurrency(item.value)}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md min-w-[40px] text-center">
                                      {(typeof item.percent === 'number' ? item.percent : 0).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 font-medium">No data available</div>
                )}
            </div>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 flex flex-col h-[500px] lg:h-[420px]">
          <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-rose-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Expense Structure</h3>
          </div>
          {/* FIX: Thêm overflow-hidden vào parent */}
          <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch gap-2 min-h-0 overflow-hidden">
             {/* Chart Side */}
            <div className="relative w-full lg:w-5/12 h-[220px] lg:h-full flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {expenseData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Expenses</span>
                  <span title={formatCurrency(expenseData.total)} className="text-sm font-extrabold text-rose-600 dark:text-rose-400 truncate w-full text-center max-w-[100px]">
                    {formatCurrency(expenseData.total)}
                  </span>
                </div>
            </div>

            {/* Legend List Side - FIX: Thêm lg:h-full */}
            <div className="w-full lg:w-7/12 flex-1 lg:h-full overflow-y-auto custom-scrollbar pr-2 min-h-0">
                 {expenseData.data.length > 0 ? (
                    <div className="space-y-3">
                         {expenseData.data.map((item) => (
                            <div key={item.name} className="flex items-center justify-between gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate text-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="font-bold text-slate-800 dark:text-white text-sm whitespace-nowrap">
                                        {formatCurrency(item.value)}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md min-w-[40px] text-center">
                                      {(typeof item.percent === 'number' ? item.percent : 0).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 font-medium">No data available</div>
                )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};