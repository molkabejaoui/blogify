import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";
import Card from "./card"; 


export default function TotalUsersCard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    authenticated: 0,
    visitors: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const visitorStats = await api.getVisitorStats();
        const dashboardStats = await api.getDashboardStats();

        setStats({
          totalUsers: dashboardStats.totalUsers,
          authenticated: dashboardStats.totalUsers,
          visitors: visitorStats.totalAnonymous,
        });
      } catch (error) {
        console.error("Erreur chargement TotalUsersCard:", error);
      }
    };

    fetchData();
  }, []);

  const pieData = [
    { name: "Authentifiés", value: stats.authenticated },
    { name: "Visiteurs", value: stats.visitors },
  ];

  const COLORS = ["#1e90ff", "#ff7f50"];

  return (
  <div className="total-users-wrapper">
    <Card className="total-users-card">

      <div className="total-users-content">

        {/* LEFT SIDE */}
        <div className="total-users-left">
          <h3 className="total-users-title">
            Utilisateurs & Visiteurs
          </h3>

          <div className="users-stats">
            <div className="user-stat blue">
              <span>Visiteurs</span>
              <strong>{stats.visitors}</strong>
            </div>

            <div className="user-stat green">
              <span>Authentifiés</span>
              <strong>{stats.authenticated}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="total-users-right">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={5}
                cornerRadius={10}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="pie-center">
            <strong>{stats.totalUsers + stats.visitors}</strong>
            <span>Total</span>
          </div>
        </div>

      </div>

    </Card>
  </div>
);

}
