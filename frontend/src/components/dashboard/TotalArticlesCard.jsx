import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import api from "../../services/api";
import Card from "./card";
import dayjs from "dayjs";

export default function TotalArticlesCard() {
  const [total, setTotal] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const articles = await api.getArticles(); 
        setTotal(articles.length);

        const year = dayjs().year();
        const months = Array.from({ length: 12 }, (_, i) => ({
          month: dayjs(`${year}-${i + 1}-01`).format("YYYY-MM"),
          count: 0
        }));

        // Compter les articles par mois
        articles.forEach(article => {
          const m = dayjs(article.datePublication).format("YYYY-MM");
          const monthObj = months.find(x => x.month === m);
          if (monthObj) monthObj.count += 1;
        });

        // Trouver le dernier mois où il y a eu au moins un article
        const lastMonthIndex = months
          .map((m, idx) => (m.count > 0 ? idx : -1))
          .filter(idx => idx !== -1)
          .pop() ?? -1;

        // Remplacer les mois après le dernier article par null
        months.forEach((m, idx) => {
          if (idx > lastMonthIndex) m.count = null;
        });

        setChartData(months);

      } catch (err) {
        console.error("Erreur TotalArticlesCard:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="total-articles-card w-full">
      <h3 className="total-articles-title text-lg font-semibold mb-2">Articles publiés</h3>
      <div className="total-articles-count text-2xl font-bold text-green-600 mb-2">{total}</div>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" tickFormatter={str => dayjs(str).format("MMM")} />
            <YAxis allowDecimals={false} />
            <Tooltip labelFormatter={str => dayjs(str).format("MMMM YYYY")} />
            <CartesianGrid stroke="#f5f5f5" />
            <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
