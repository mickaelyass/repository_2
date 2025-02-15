import React, { useEffect, useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { Field, ErrorMessage, Formik, Form } from 'formik';
import * as Yup from 'yup';
import { getDossier, updateMutation } from '../../../services/api';
import '../Dasbord.css';

const ChangeEtat = () => {
  const { id_dossier } = useParams();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchDossier = async () => {
      try {
        const response = await getDossier(id_dossier);
        setDossier(response.data);
        console.log(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [id_dossier]);

  const EtatFormSchema = Yup.object().shape({
      etat: Yup.string().required('État is required'),
  });

  const handleSubmit = async (values) => {
    console.log(values);
    const { etat } = values;
    console.log(etat);
    if (['Actif', 'Abandon/demission', 'Retraite','Décédé'].includes(etat)) {
      const mutationData = {
        etat: etat,  // Set the chosen state
        poste_actuel: "Neant",
        service_actuel: "Neant",
        nouveau_poste: "Neant",
        nouveau_service: "Neant",
        date_prise_fonction: "01/01/01",
        date_changement: "01/01/01",
        motif_changement: "Neant",
        type_changement: "Neant",
        besoins_changement: "Neant",
      };
      await updateMutation(dossier.matricule, mutationData);
      console.log(mutationData);
    }else{
      try {
        switch (etat) {
          case 'Muté':
          
            navigate(`/admin/mutation-form/${dossier.matricule}`);
            break;
          case 'Mise à disposition':
            navigate(`/admin/mise-a-disposition-form/${dossier.matricule}`);
            break;
          case 'Détachement':
            navigate(`/admin/detachement-form/${dossier.matricule}`);
            break;
          case 'Mise en disponibilité':
            navigate(`/admin/mise-en-disponibilite-form/${dossier.matricule}`);
          break;
          // Add cases for other states as needed
          default:
            navigate(`/dossier/${dossier.matricule}`); // Redirect back to dossier if no specific form
            break;
        }
      } catch (error) {
        console.error('Error updating dossier state:', error);
        setError('Failed to update dossier state. Please try again later.');
      }
    }
   
    
  };


  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">Error: {error}</div>;
  }

  if (!dossier) {
    return <div className="text-center mt-5">No dossier found.</div>;
  }

  const currentEtat = dossier.InfoPro.Details && dossier.InfoPro.Details.length > 0
  ? dossier.InfoPro.Details[dossier.InfoPro.Details.length - 1].etat
  : ''; // Default to empty string if no details are found


  return (
    <div className="dashboard">
        <div className="container card">
          <div className="card-header text-primary">
            <h2 className="mb-0">Profile de {dossier.InfoIdent.prenom} {dossier.InfoIdent.nom}</h2>
          </div>
          <div className="card-body gap-3">
            <p><strong>Matricule:</strong> {dossier.Utilisateur.matricule}</p>
            <p><strong>Role:</strong> {dossier.Utilisateur.role}</p>
            <p><strong>Statut:</strong> {dossier.InfoPro.statut}</p>
            <p><strong>Corps:</strong> {dossier.InfoPro.corps}</p>
            <p><strong>Catégorie:</strong> {dossier.InfoPro.categorie}</p>
            <p><strong>Fonctions:</strong> {dossier.InfoPro.fonctions}</p>
            <p><strong>Date première prise de service:</strong> {dossier.InfoPro.dat_first_prise_de_service}</p>
            <p><strong>Date de départ en retraite:</strong> {dossier.InfoPro.dat_de_depart_retraite}</p>
            <p><strong>Date de prise de service dans le département:</strong> {dossier.InfoPro.dat_de_prise_service_dans_departement}</p>
            <p><strong>Poste actuel service:</strong> {dossier.InfoPro.poste_actuel_service}</p>
            <p><strong>Poste spécifique:</strong> {dossier.InfoPro.poste_specifique}</p>
            <p><strong>État:</strong> {dossier.InfoPro.Details && 
            dossier.InfoPro.Details.length > 0 
            ? dossier.InfoPro.Details[dossier.InfoPro.Details.length - 1].etat : 'Aucun détail'}</p>
          </div>

          <Formik
            initialValues={{etat: currentEtat } }
            validationSchema={EtatFormSchema}
            onSubmit={handleSubmit}
          >
             {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="etat">Choix du nouveau État</label>
                <Field as="select" name="etat" className="form-control">
                  <option value="">Sélectionner un état</option>
                  <option value="Actif">Actif</option>
                  <option value="Muté">Muté</option>
                  <option value="Détachement">Détachement</option>
                  <option value="Mise en disponibilité">Mise en disponibilité</option>
                  <option value="Mise à disposition">Mise à disposition</option>
                  <option value="Abandon/demission">Abandon/demission</option>
                  <option value="Retraite">Retraite</option>
                  <option value="Décédé">Décédé</option>
                </Field>
                <ErrorMessage name="etat" component="div" className="text-danger" />
              </div>
              {error && <div className="text-danger">{error}</div>}
              <button type="submit" className="btn btn-primary my-2" disabled={isSubmitting}>
                Submit
              </button>
            </Form>
          )}
          </Formik>
        </div>
    </div>
  );
};

export default ChangeEtat;