// Nom de la base de données
const NOM_BASE = "tableau-taches";
// Nom du tiroir qui contient la liste
const NOM_TIROIR = "taches";
// Clé unique sous laquelle toute la liste est rangée
const CLE_LISTE = "liste";

// Ouverture de la base (elle est créée si elle n'existe pas)
function ouvrirBase() {
  return new Promise(function (resolve, reject) {
    // Demande d'ouverture de la base, en version 1
    const demande = indexedDB.open(NOM_BASE, 1);

    // Création du tiroir à la première ouverture
    demande.onupgradeneeded = function () {
      demande.result.createObjectStore(NOM_TIROIR);
    };

    // Base ouverte : envoi du résultat
    demande.onsuccess = function () {
      resolve(demande.result);
    };

    // Problème d'ouverture : envoi de l'erreur
    demande.onerror = function () {
      reject(demande.error);
    };
  });
}

// Lecture de la liste enregistrée (undefined si rien n'est enregistré)
export function chargerTaches() {
  return ouvrirBase().then(function (base) {
    return new Promise(function (resolve, reject) {
      // Ouverture du tiroir en lecture
      const transaction = base.transaction(NOM_TIROIR, "readonly");
      const tiroir = transaction.objectStore(NOM_TIROIR);
      // Demande de la liste
      const demande = tiroir.get(CLE_LISTE);

      // Liste trouvée : envoi du résultat
      demande.onsuccess = function () {
        resolve(demande.result);
      };

      // Problème de lecture : envoi de l'erreur
      demande.onerror = function () {
        reject(demande.error);
      };
    });
  });
}

// Enregistrement de la liste (remplace l'ancienne)
export function sauvegarderTaches(taches) {
  return ouvrirBase().then(function (base) {
    return new Promise(function (resolve, reject) {
      // Ouverture du tiroir en écriture
      const transaction = base.transaction(NOM_TIROIR, "readwrite");
      const tiroir = transaction.objectStore(NOM_TIROIR);
      // Rangement de la liste sous la clé choisie
      tiroir.put(taches, CLE_LISTE);

      // Écriture terminée : fin de l'opération
      transaction.oncomplete = function () {
        resolve();
      };

      // Problème d'écriture : envoi de l'erreur
      transaction.onerror = function () {
        reject(transaction.error);
      };
    });
  });
}