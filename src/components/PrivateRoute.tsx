import { Navigate } from "react-router-dom";
import React from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  // Récupération du token dans localStorage
  const token = localStorage.getItem("token");

  // Si un token existe, on peut le décoder pour récupérer le rôle (par exemple)
  let isAdmin = false;
  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Décodage du token
      isAdmin = decodedToken.role === "admin"; // Vérification du rôle
    } catch (error) {
      console.error("Erreur lors du décodage du token", error);
    }
  }

  // Si le token existe et que l'utilisateur est admin, on permet l'accès
  if (token && isAdmin) {
    return <>{children}</>;
  }

  // Sinon, on redirige vers la page de connexion
  return <Navigate to="/login" />;
};

export default PrivateRoute;
