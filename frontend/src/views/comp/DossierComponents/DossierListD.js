import React, { useEffect, useState } from 'react';
import { getDossiers, deleteDossier, getDossierSearch } from '../../../services/api';
import { Link } from 'react-router-dom';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import { FaEdit, FaPlus, FaEye, FaTrash } from 'react-icons/fa'; // Importer des icônes

const DossierListD = () => {
  const [dossiers, setDossiers] = useState({
    actifs: [],
    retireesDecedes: [],
    autres: []
  });

  const [nom, setNom] = useState('');
  const [service, setService] = useState('');

  useEffect(() => {
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    try {
      const response = await getDossiers();
      const allDossiers = response.data;
      
      // Filtrer les actifs
      const actifs = allDossiers.filter(dossier => {
        const details = dossier.InfoPro?.Details;
        const lastDetail = Array.isArray(details) && details.length > 0 ? details[details.length - 1] : null;
        return lastDetail && ['Actif'].includes(lastDetail.etat);
      });
      
      // Filtrer les retraites et décédés
      const retireesDecedes = allDossiers.filter(dossier => {
        const details = dossier.InfoPro?.Details;
        const lastDetail = Array.isArray(details) && details.length > 0 ? details[details.length - 1] : null;
        return lastDetail && ['Retraite', 'Décédé'].includes(lastDetail.etat);
      });
      
      // Filtrer les autres
      const autres = allDossiers.filter(dossier => {
        const details = dossier.InfoPro?.Details;
        const lastDetail = Array.isArray(details) && details.length > 0 ? details[details.length - 1] : null;
        return lastDetail && !['Actif', 'Retraite', 'Décédé'].includes(lastDetail.etat);
      });

      setDossiers({
        actifs,
        retireesDecedes,
        autres
      });
    } catch (error) {
      console.error('Error fetching dossiers', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (window.confirm(`Le dossier ${id} sera supprimé`)) {
        await deleteDossier(id);
        fetchDossiers();
      }
    } catch (error) {
      console.error('Error deleting dossier', error);
    }
  };

  const handleSearch = async () => {
    try {
      const result = await getDossierSearch(nom, service);
      setDossiers({
        actifs: result.filter(dossier => dossier.InfoPro.Details.etat === 'Actif'),
        retireesDecedes: result.filter(dossier => ['Retraite', 'Décédé'].includes(dossier.InfoPro.Details.etat)),
        autres: result.filter(dossier => !['Actif', 'Retraite', 'Décédé'].includes(dossier.InfoPro.Details.etat))
      });
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  const renderDossiersTable = (dossiersList, title) => (
    <CCard className="mb-4">
      <CCardHeader className="bg-secondary text-light">{title}</CCardHeader>
      <CCardBody>
        {dossiersList.length > 0 ? (
          <CTable striped hover className="text-light">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Matricule</CTableHeaderCell>
                <CTableHeaderCell>Nom</CTableHeaderCell>
                <CTableHeaderCell>Prénom</CTableHeaderCell>
                <CTableHeaderCell>Service</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {dossiersList.map(dossier => (
                <CTableRow key={dossier.id_dossier} className="text-light">
                  <CTableDataCell>{dossier.matricule}</CTableDataCell>
                  <CTableDataCell>{dossier.InfoIdent.nom}</CTableDataCell>
                  <CTableDataCell>{dossier.InfoIdent.prenom}</CTableDataCell>
                  <CTableDataCell>{dossier.InfoPro.poste_actuel_service}</CTableDataCell>
                  <CTableDataCell>
                 <Link to={`/admin/profileD/${dossier.id_dossier}`} className="btn btn-secondary me-2 p-1" aria-label="Plus">
                                       <FaEye />
                                     </Link>
                    <button onClick={() => handleDelete(dossier.id_dossier)} className="btn btn-danger p-1" aria-label="Supprimer">
                                         <FaTrash />
                                       </button>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        ) : (
          <p>Aucun dossier trouvé.</p>
        )}
      </CCardBody>
    </CCard>
  );

  return (
    <div className="dashboard container p-3">
      <CForm className="row g-3 align-items-center mb-4">
        <div className="col-4">
          <CFormInput
            id="nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom"
          />
        </div>
        <div className="col-4">
          <CFormInput
            id="service"
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Service"
          />
        </div>
        <div className="col-auto">
          <CButton onClick={handleSearch} color="secondary">
            Rechercher
          </CButton>
        </div>
      </CForm>

      <Link to="/admin/create-dossier" className="btn btn-primary mb-3">Créer un nouveau dossier</Link>

      {renderDossiersTable(dossiers.actifs, 'Dossiers Actifs')}
      {renderDossiersTable(dossiers.autres, 'Autres Dossiers')}
      {renderDossiersTable(dossiers.retireesDecedes, 'Dossiers Retraités ou Décédés')}
    </div>
  );
};

export default DossierListD;
