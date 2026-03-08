import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";

interface MonthData {
  month: string;
  quoted: number;
  booked: number;
}

const RevenueChart = () => {
  const [data, setData] = useState<MonthData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [quotesRes, bookingDetailsRes] = await Promise.all([
        supabase.from("client_quotes").select("total_price, status, created_at"),
        supabase.from("booking_details").select("total_value, created_at"),
      ]);

      const quotes = quotesRes.data || [];
      const bookingDetails = bookingDetailsRes.data || [];

      const now = new Date();
      const months: MonthData[] = [];

      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthLabel = format(monthStart, "MMM yyyy");
        const monthKey = format(monthStart, "yyyy-MM");

        let quoted = 0;
        let booked = 0;

        quotes.forEach((q) => {
          if (q.created_at?.startsWith(monthKey)) {
            const price = Number(q.total_price) || 0;
            quoted += price;
            if (q.status === "booked") booked += price;
          }
        });

        // Add booking total_value to booked
        (bookingDetails as any[]).forEach((b) => {
          if (b.created_at?.startsWith(monthKey)) {
            const val = Number(b.total_value) || 0;
            if (val > 0) booked += val;
          }
        });

        months.push({ month: monthLabel, quoted, booked });
      }

      setData(months);
    };
    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Revenue (6 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barGap={2}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="quoted" name="Quoted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="booked" name="Booked" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">No quote data yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
