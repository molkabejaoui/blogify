import React from "react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer"; // 🔥 Ajouter le Footer
import TotalUsersCard from "../components/dashboard/TotalUsersCard";
import TotalArticlesCard from "../components/dashboard/TotalArticlesCard";
import InteractionBarChart from "../components/dashboard/InteractionStatsCard";
import UsersByMonthChart from "../components/dashboard/UsersByMonthChart";

export default function Dashboard() {
    return (
        <>
            {/* 🔥 Même structure que Home.jsx */}
            <div className="layout d-flex bg-light">
                <Sidebar />

                <main className="flex-grow-1 py-4 main-content">
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "1100px",
                            margin: "0 auto",
                            padding: "0 16px",
                        }}
                    >
                        {/* Header */}
                        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                            Dashboard
                        </h1>

                        {/* Bloc statistiques — 3 cartes côte à côte sur grand écran */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <TotalUsersCard />
                            <InteractionBarChart />
                            <TotalArticlesCard />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <UsersByMonthChart />
                        </div>

                        {/* Ici tu peux ajouter d'autres composants du dashboard */}
                        {/* <div className="bg-white rounded-2xl shadow-md p-6">
                            <AutreCard />
                        </div> */}
                    </div>
                </main>
            </div>

            {/* 🔥 Footer en dehors du layout */}
            <Footer />
        </>
    );
}