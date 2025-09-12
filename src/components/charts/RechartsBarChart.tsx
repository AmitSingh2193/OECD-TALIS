import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DataPoint {
  age: number;
  salary: number;
}

interface RechartsBarChartProps {
  data: DataPoint[];
  width?: number | string;
  height?: number;
  referenceAge?: number; // Age at which to draw the reference line
}

export const RechartsBarChart = ({
  data,
  width = '100%',
  height = 400,
  referenceAge,
}: RechartsBarChartProps) => {
  // Format data for Recharts
  const chartData = data.map(item => ({
    age: item.age.toString(),
    salary: item.salary,
  }));

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4 text-center">Recharts Bar Chart</h3>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div style={{ width, height }}>
          <ResponsiveContainer width={width} height={height}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
              barCategoryGap={0}
              barGap={0}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="age" 
                label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} 
                tickFormatter={(value) => `${value}`}
                type="number"
                domain={['dataMin - 2', 'dataMax + 2']}
                ticks={referenceAge !== undefined 
                  ? [...data.map(d => d.age), referenceAge].sort((a, b) => a - b)
                  : data.map(d => d.age)
                }
              />
              <YAxis 
                label={{ value: 'Salary ($)', angle: -90, position: 'insideLeft' }} 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Salary']} 
                labelFormatter={(label) => `Age: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  padding: '0.5rem',
                  color: '#1f2937',
                }}
                cursor={false}
              />
              <Legend />
              <Bar 
                dataKey="salary" 
                name="Salary by Age" 
                fill="hsl(221.2 83.2% 53.3%)" 
                radius={[2, 2, 0, 0]}
                label={{ position: 'top', formatter: (value: number) => `$${value.toLocaleString()}` }}
                activeBar={{ fill: 'hsl(221.2 83.2% 53.3%)' }}
                onMouseOver={() => {}}
                onMouseLeave={() => {}}
                isAnimationActive={false}
              />
              {referenceAge !== undefined && (
                <ReferenceLine
                  x={referenceAge}
                  stroke="#e53e3e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: `Age ${referenceAge}`,
                    position: 'center',
                    fill: '#e53e3e',
                    fontSize: 12,
                    fontWeight: 'bold',
                    offset: 10
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RechartsBarChart;
