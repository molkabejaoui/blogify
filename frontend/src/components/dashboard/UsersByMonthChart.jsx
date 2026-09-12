import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import api from "../../services/api";

export default function UsersByMonthChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getUsersByMonth();
        setData(res.map(d => ({ month: d.month, count: d.count })));
      } catch (error) {
        console.error("Erreur chart:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="chart-card bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-gray-700 font-semibold mb-2">Users by Month</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="count" stroke="#1e90ff" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
