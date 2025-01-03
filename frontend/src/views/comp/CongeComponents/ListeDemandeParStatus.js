import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDemandesByStatus } from '../../../services/apiConge'; // Assuming this service fetches by status

const ListeDemandesParStatus = ({ status  }) => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const data = await fetchDemandesByStatus(status); // Pass status as parameter
        const dataAu=data.filter(data=>
          data.decision_directrice ==="En attente");
        
    
      console.log(data);
      console.log(dataAu);
      setDemandes(dataAu);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemandes();
  }, [status]); // Re-fetch on status change

  const handleManageDemande = (id_cong) => {
    navigate(`/directrice/directrice-demande/${id_cong}`);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="card-title  rounded  py-2 ps-2 ">Liste des demandes de congés {status} par le chef Service</h2>
      <div className="card-deck">
        {demandes.map((demande) => (
          <div key={demande.id_cong} className="card mb-2">
            <div className="card-body">
              <h5 className="card-title">{demande.matricule}</h5>
              <p className="card-text">
                <strong>Date de début :</strong> { formatDate(demande.date_debut) }<br />
                <strong>Raison :</strong> {demande.raison}<br />
                <strong>Statut :</strong> {demande.status}
              </p>
               {/* Afficher les pièces jointes */}
          {demande.piecesJointes && (
            <div className="mt-2">
              <h6>Pièces jointes :</h6>
              <ul>
                {demande.piecesJointes.url_certificat_non_jouissance && (
                  <li>
                    <a 
                      href={demande.piecesJointes.url_certificat_non_jouissance} 
                      target="_blank" 
                      rel="noopener noreferrer">
                      Certificat de non-jouissance
                    </a>
                  </li>
                )}
                {demande.piecesJointes.url_derniere_autorisation_conges && (
                  <li>
                    <a 
                      href={demande.piecesJointes.url_derniere_autorisation_conges} 
                      target="_blank" 
                      rel="noopener noreferrer">
                      Dernière autorisation de congés
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
              <button className="btn btn-primary" onClick={() => handleManageDemande(demande.id_cong)}>
                Gérer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListeDemandesParStatus;