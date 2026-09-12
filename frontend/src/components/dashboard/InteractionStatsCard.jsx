import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../../services/api";
import Card from "./card";

export default function InteractionBarChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.getDashboardStats()
      .then((stats) => {
        setData([
          { name: "Likes", value: stats.totalLikes },
          { name: "Enregistrements", value: stats.totalSaves },
          { name: "Téléchargements", value: stats.totalDownloads },
        ]);
      })
      .catch((err) =>
        console.error("Erreur chargement interactions", err)
      );
  }, []);

  return (
    <div className="interaction-wrapper">
      <Card className="interaction-card">

        <h3 className="interaction-title">
          Interactions globales
        </h3>

        <div className="interaction-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="value"
                radius={[10, 10, 0, 0]}
                fill="#2563eb"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </Card>
    </div>
  );
}
