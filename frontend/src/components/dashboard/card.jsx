import React from "react";
import api from "../../services/api";

export default function Card({ children, className }) {
  return (
    <div className={`
      bg-white
      rounded-2xl
      shadow-lg
      border
      border-gray-200
      p-6
      transition-shadow
      hover:shadow-xl
      ${className || ""}
    `}>
      {children}
    </div>
  );
}
