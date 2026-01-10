"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface OccupancyData {
    name: string;
    total: number;
    occupied: number;
}

interface OccupancyChartProps {
    data: OccupancyData[];
}

export function OccupancyChart({ data }: OccupancyChartProps) {
    // Transform data for stacked chart
    const chartData = data.map(item => ({
        ...item,
        free: Math.max(0, item.total - item.occupied)
    }));

    return (
        <Card className="col-span-12 md:col-span-8">
            <CardHeader>
                <CardTitle>Tỷ lệ lấp đầy phòng theo Tòa nhà</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="occupied" name="Đã ở" stackId="a" fill="#adfa1d" radius={[0, 0, 4, 4]} className="fill-primary" />
                        <Bar dataKey="free" name="Còn trống" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
