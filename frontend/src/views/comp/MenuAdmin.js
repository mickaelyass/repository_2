import React from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';
import 'bootstrap/dist/css/bootstrap.min.css'; // Assurez-vous que Bootstrap est bien importé
import './MenuAdmin.css'; // Assurez-vous que le fichier CSS existe pour les styles personnalisés

const MenuAdmin = ({ isMenuOpen }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')); // Récupérer l'utilisateur depuis le localStorage
  const matricule = user ? user.matricule : ''; // Extraire le matricule de l'utilisateur

  const handleGoBack=()=>{
    navigate(-1);
  }
  const handleGo=()=>{
    navigate(1);
  }
  const handleNavigation = (path, data) => {
    navigate(path, { state: data });
  };

  const logout = () => {
    // Suppression du token ou des informations de session
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    // Redirection vers la page de connexion
    handleNavigation('/login');
  };

  return (
    <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div >
               {/* Première barre blanche */}
      <div className="top-bar bg-success py-1 shadow-sm"></div>

{/* Deuxième barre blanche */}
<div className="top-bar mx-3 bg-white py-1 shadow-sm mt-1"></div>
      
      </div>
      <div className='d-flex'>
      <h3 className=" h3 ms-3 my-4 text-center text-light">Menu  </h3>
      <span className='h4 bg-clair my-4 ms-auto'>
          <span className=' ' onClick={handleGoBack} ><i className=' text-light bi bi-arrow-left-circle'></i></span>
          <span className=' ms-2' onClick={handleGo} ><i className=' text-light bi bi-arrow-right-circle'></i></span>
      </span>
      </div>
      
      
      <ul className="nav flex-column gap-3">
        <li className="nav-item">
          <a className="nav-link " href="#" onClick={() => handleNavigation('/admin-dashbord', null)}>
            <i className="bi bi-house-door me-1"></i> Tableau de bord
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link " href="#" onClick={() => handleNavigation('/dossier-list', null)}>
            <i className="bi bi-person me-1"></i> Liste des dossiers
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link " href="#" onClick={() => handleNavigation('/utilisateur-list', null)}>
            <i className="bi bi-person me-1"></i> Les utilisateurs
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link " href="#" onClick={() => handleNavigation('/conge-liste', null)}>
            <i className="bi bi-calendar-plus me-1"></i> Listes des demandes de congés
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link " href="/notifs_admin">
            <i className="bi bi-bell me-1"></i> Notification
          </a>
          
        </li>
       {/*  <li className="nav-item">
          <a className="nav-link  bg-danger text-light" href="#" onClick={logout}>
            <i className="bi bi-box-arrow-right me-1"></i> Deconnexion
          </a>
        </li> */}
      </ul>
    </div>
  );
};

export default MenuAdmin;