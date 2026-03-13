import type { ImageSource } from "@/lib/scannerDraft";

const DATABASE_NAME = "scanner-original-image-store";
const DATABASE_VERSION = 1;
const STORE_NAME = "scanner-images";
const ORIGINAL_IMAGE_KEY = "current-meal-original-image";

export type StoredScannerOriginalImage = {
  blob: Blob;
  fileName?: string;
  mimeType: string;
  savedAt: string;
  source: Exclude<ImageSource, "url">;
};

type StoredScannerOriginalImageRecord = StoredScannerOriginalImage & {
  id: string;
};

const openScannerImageDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof window.indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponible"));
      return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onerror = () => {
      reject(new Error("Ouverture IndexedDB impossible"));
    };

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

const runTransaction = async <T>(
  mode: IDBTransactionMode,
  executor: (
    store: IDBObjectStore,
    resolve: (value: T) => void,
    reject: (reason?: unknown) => void,
  ) => void,
): Promise<T> => {
  const database = await openScannerImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    transaction.oncomplete = () => {
      database.close();
    };

    transaction.onerror = () => {
      reject(transaction.error ?? new Error("Transaction IndexedDB impossible"));
      database.close();
    };

    transaction.onabort = () => {
      reject(transaction.error ?? new Error("Transaction IndexedDB interrompue"));
      database.close();
    };

    executor(store, resolve, reject);
  });
};

export const saveScannerOriginalImage = async (
  image: StoredScannerOriginalImage,
): Promise<void> => {
  await runTransaction<void>("readwrite", (store, resolve, reject) => {
    const request = store.put({
      id: ORIGINAL_IMAGE_KEY,
      ...image,
    } satisfies StoredScannerOriginalImageRecord);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Sauvegarde IndexedDB impossible"));
  });
};

export const getScannerOriginalImage = async (): Promise<StoredScannerOriginalImage | null> => {
  return runTransaction<StoredScannerOriginalImage | null>("readonly", (store, resolve, reject) => {
    const request = store.get(ORIGINAL_IMAGE_KEY);

    request.onsuccess = () => {
      const result = request.result as StoredScannerOriginalImageRecord | undefined;

      if (!result) {
        resolve(null);
        return;
      }

      resolve({
        blob: result.blob,
        fileName: result.fileName,
        mimeType: result.mimeType,
        savedAt: result.savedAt,
        source: result.source,
      });
    };

    request.onerror = () => reject(request.error ?? new Error("Lecture IndexedDB impossible"));
  });
};

export const deleteScannerOriginalImage = async (): Promise<void> => {
  await runTransaction<void>("readwrite", (store, resolve, reject) => {
    const request = store.delete(ORIGINAL_IMAGE_KEY);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Suppression IndexedDB impossible"));
  });
};

export const readBlobAsDataUrl = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Blob converti dans un format inattendu"));
    };

    reader.onerror = () => reject(new Error("Lecture du blob impossible"));
    reader.readAsDataURL(blob);
  });
};
