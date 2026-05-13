class StorageManager {
  constructor() {
    this.dbName = 'CustomerExcellenceDashboard';
    this.version = 1;
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('callCenterData')) {
          db.createObjectStore('callCenterData', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('csatData')) {
          db.createObjectStore('csatData', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('ticketData')) {
          db.createObjectStore('ticketData', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('performanceMetrics')) {
          db.createObjectStore('performanceMetrics', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('businessCategories')) {
          db.createObjectStore('businessCategories', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('individualCategories')) {
          db.createObjectStore('individualCategories', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('agentData')) {
          db.createObjectStore('agentData', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('uploadHistory')) {
          db.createObjectStore('uploadHistory', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async addData(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllData(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

const storage = new StorageManager();