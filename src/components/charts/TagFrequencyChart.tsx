import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { memo } from "react";

interface TagFrequencyChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = [
  "hsl(262, 83%, 58%)", // primary
  "hsl(210, 100%, 50%)", // blue
  "hsl(340, 82%, 52%)", // pink
  "hsl(158, 64%, 52%)", // teal
  "hsl(43, 96%, 56%)", // yellow
  "hsl(14, 90%, 53%)", // orange
  "hsl(280, 65%, 60%)", // purple
  "hsl(173, 58%, 39%)", // cyan
  "hsl(25, 95%, 53%)", // red-orange
  "hsl(142, 71%, 45%)", // green
];

const TagFrequencyChart = ({ data }: TagFrequencyChartProps) => {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No tags data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Tags Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Memoize chart to prevent unnecessary re-renders
export default memo(TagFrequencyChart);
