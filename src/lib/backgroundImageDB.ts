/**
 * Helper para persistir a imagem de fundo personalizada no IndexedDB.
 *
 * Armazena o Blob original — sem converter para Base64 — evitando o
 * overhead de ~33% de tamanho e o risco de QuotaExceededError no localStorage.
 *
 * Base de dados : "kanban-bg-db"  (versão 1)
 * Object store  : "images"
 * Chave fixa    : "custom-bg"  (apenas uma imagem personalizada por utilizador)
 */

const DB_NAME = "kanban-bg-db";
const STORE_NAME = "images";
const IMAGE_KEY = "custom-bg";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Guarda (ou substitui) a imagem no IndexedDB e devolve uma Object URL temporária. */
export async function saveBackgroundImage(file: File): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(file, IMAGE_KEY);

    request.onsuccess = () => {
      db.close();
      resolve(URL.createObjectURL(file));
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * Carrega a imagem do IndexedDB e devolve uma Object URL.
 * Devolve `null` se não existir nenhuma imagem guardada.
 */
export async function loadBackgroundImage(): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(IMAGE_KEY);

    request.onsuccess = () => {
      db.close();
      const file = request.result as File | undefined;
      resolve(file ? URL.createObjectURL(file) : null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/** Remove a imagem do IndexedDB. */
export async function deleteBackgroundImage(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(IMAGE_KEY);

    request.onsuccess = () => {
      db.close();
      resolve();
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}
