import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Suppression du token dans le localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    // Redirection vers la page de connexion
    navigate("/login");
  };

  return (
    <nav className="bg-blue-500 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Gestion Budget</h1>
        
        <ul className="flex space-x-6">
          <li>
            <Link to="/home" className="text-white hover:text-gray-300 hover:underline">Accueil</Link>
          </li>
          <li>
            <Link to="/recap" className="text-white hover:text-gray-300 hover:underline">Récapitulatif</Link>
          </li>
          <li>
            <Link to="/projet" className="text-white hover:text-gray-300 hover:underline">Créer un Projet</Link>
          </li>
          <li>
            <Link to="/collaborateurs" className="text-white hover:text-gray-300 hover:underline">Collaborateurs</Link>
          </li>
          <li>
            <Link to="/tjm" className="text-white hover:text-gray-300 hover:underline">TJM</Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-300 hover:underline"
            >
              Déconnexion
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
