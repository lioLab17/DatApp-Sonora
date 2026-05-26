import { useLocation, useNavigate } from "react-router-dom";
import ProductorDashboard from "./dashboards/ProductorDashboard";
import IngenieroDashboard from "./dashboards/IngenieroDashboard";
import ClienteDashboard from "./dashboards/ClienteDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const rol = location.state?.rol || "productor";

  if (rol === "ingeniero") return <IngenieroDashboard navigate={navigate} />;
  if (rol === "cliente") return <ClienteDashboard navigate={navigate} />;
  
  return <ProductorDashboard navigate={navigate} />;
}