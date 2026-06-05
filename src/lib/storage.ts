// lib/storage.ts

interface StoredFile {
    id: string;
    formKey: string;
    field: string;
    index?: number;
    arrayBuffer: ArrayBuffer;
    name: string;
    type: string;
    size: number;
    lastModified: number;
}

interface FormData {
    [key: string]: unknown;
}

class FormStorage {
    private dbName = 'AdmissionFormDB';
    private dbVersion = 3; // Increment version
    private storeName = 'formData';
    private fileStoreName = 'formFiles';

    async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }

                if (!db.objectStoreNames.contains(this.fileStoreName)) {
                    const fileStore = db.createObjectStore(this.fileStoreName, { keyPath: 'id' });
                    fileStore.createIndex('formKey', 'formKey', { unique: false });
                }
            };
        });
    }

    // Convert File to ArrayBuffer for storage
    private fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    // Convert ArrayBuffer back to File
    private arrayBufferToFile(arrayBuffer: ArrayBuffer, name: string, type: string, lastModified: number): File {
        const blob = new Blob([arrayBuffer], { type });
        return new File([blob], name, {
            type,
            lastModified
        });
    }

    async saveFormData(key: string, data: FormData): Promise<void> {
        try {
            // First, clear existing data
            await this.clearFormData(key);

            const db = await this.openDB();
            const { files, formData } = await this.extractFiles(data, key);

            // Then, save new data in a separate transaction
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName, this.fileStoreName], 'readwrite');

                // Save form data
                const store = transaction.objectStore(this.storeName);
                store.put(formData, key);

                // Save files
                const fileStore = transaction.objectStore(this.fileStoreName);
                files.forEach(fileInfo => {
                    fileStore.add(fileInfo);
                });

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (error) {
            throw error;
        }
    }

    private async extractFiles(data: FormData, formKey: string): Promise<{ files: StoredFile[], formData: FormData }> {
        const files: StoredFile[] = [];
        const formData = { ...data };

        const fileFields = [
            'first_school_leaving', 'first_sitting_result', 'second_sitting_result',
            'passport', 'other_documents', 'o_level', 'hnd', 'degree', 'degree_transcript'
        ];

        for (const field of fileFields) {
            const fieldValue = formData[field];

            if (!fieldValue) continue;

            if (Array.isArray(fieldValue)) {
                const filePlaceholders: unknown[] = [];

                for (let index = 0; index < fieldValue.length; index++) {
                    const file = fieldValue[index];
                    if (file instanceof File) {
                        try {
                            const arrayBuffer = await this.fileToArrayBuffer(file);
                            files.push({
                                id: `${formKey}_${field}_${index}_${Date.now()}`,
                                formKey,
                                field,
                                index,
                                arrayBuffer,
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                lastModified: file.lastModified
                            });

                            filePlaceholders.push({
                                isFile: true,
                                name: file.name,
                                size: file.size,
                                type: file.type
                            });
                        } catch (error) {
                            console.error(`Error processing file ${field}[${index}]:`, error);
                        }
                    } else {
                        filePlaceholders.push(file);
                    }
                }

                formData[field] = filePlaceholders;
            } else if (fieldValue instanceof File) {
                try {
                    const arrayBuffer = await this.fileToArrayBuffer(fieldValue);
                    files.push({
                        id: `${formKey}_${field}_${Date.now()}`,
                        formKey,
                        field,
                        arrayBuffer,
                        name: fieldValue.name,
                        type: fieldValue.type,
                        size: fieldValue.size,
                        lastModified: fieldValue.lastModified
                    });

                    formData[field] = {
                        isFile: true,
                        name: fieldValue.name,
                        size: fieldValue.size,
                        type: fieldValue.type
                    };
                } catch (error) {
                    console.error(`Error processing file ${field}:`, error);
                }
            }
        }

        return { files, formData };
    }

    async loadFormData(key: string): Promise<FormData | null> {
        const db = await this.openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName, this.fileStoreName], 'readonly');

            const store = transaction.objectStore(this.storeName);
            const formRequest = store.get(key);

            const fileStore = transaction.objectStore(this.fileStoreName);
            const fileRequest = fileStore.index('formKey').getAll(IDBKeyRange.only(key));

            transaction.oncomplete = async () => {
                try {
                    const formData = formRequest.result;
                    const files = fileRequest.result as StoredFile[];

                    if (formData) {
                        const reconstructedData = await this.reconstructFiles(formData, files);
                        resolve(reconstructedData);
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            transaction.onerror = () => reject(transaction.error);
        });
    }

    private async reconstructFiles(formData: FormData, files: StoredFile[]): Promise<FormData> {
        const reconstructed = { ...formData };

        for (const fileInfo of files) {
            if (fileInfo.field && fileInfo.arrayBuffer) {
                try {
                    const file = this.arrayBufferToFile(
                        fileInfo.arrayBuffer,
                        fileInfo.name,
                        fileInfo.type,
                        fileInfo.lastModified
                    );

                    if (fileInfo.index !== undefined) {
                        if (!reconstructed[fileInfo.field]) {
                            reconstructed[fileInfo.field] = [];
                        }
                        (reconstructed[fileInfo.field] as File[])[fileInfo.index] = file;
                    } else {
                        reconstructed[fileInfo.field] = file;
                    }
                } catch (error) {
                    console.error(`Error reconstructing file ${fileInfo.field}:`, error);
                }
            }
        }

        return reconstructed;
    }

    async clearFormData(key: string): Promise<void> {
        const db = await this.openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName, this.fileStoreName], 'readwrite');

            // Clear form data
            const store = transaction.objectStore(this.storeName);
            const deleteFormRequest = store.delete(key);
            // console.log('deleteFormRequest', deleteFormRequest)

            // Clear files
            const fileStore = transaction.objectStore(this.fileStoreName);
            const fileCursorRequest = fileStore.index('formKey').openCursor(IDBKeyRange.only(key));

            fileCursorRequest.onsuccess = () => {
                const cursor = fileCursorRequest.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

export const formStorage = new FormStorage();

