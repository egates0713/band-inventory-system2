'use client';

import { gapi } from 'gapi-script';
import { InventoryData } from '@/types';

// Google Drive API configuration
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Check if credentials are configured
const hasValidCredentials = () => {
  return CLIENT_ID && API_KEY &&
         !CLIENT_ID.includes('your-') &&
         !API_KEY.includes('your-');
};

// File name for the inventory data
const INVENTORY_FILENAME = 'band-inventory-data.json';

export interface SyncStatus {
  isSignedIn: boolean;
  isLoading: boolean;
  lastSync?: Date;
  error?: string;
  userEmail?: string;
}

class GoogleDriveSyncService {
  private isInitialized = false;
  private listeners: ((status: SyncStatus) => void)[] = [];
  private currentStatus: SyncStatus = {
    isSignedIn: false,
    isLoading: false
  };

  // Initialize Google API
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Only initialize on client side
    if (typeof window === 'undefined') {
      this.updateStatus({
        isLoading: false,
        error: 'Server-side rendering'
      });
      return;
    }

    // Check if credentials are configured
    if (!hasValidCredentials()) {
      this.updateStatus({
        isLoading: false,
        error: 'setup_required'
      });
      this.isInitialized = true; // Mark as initialized to prevent retry loops
      return;
    }

    // Check if Google API is available
    if (typeof gapi === 'undefined') {
      this.updateStatus({
        isLoading: false,
        error: 'Google API script not loaded'
      });
      return;
    }

    try {
      this.updateStatus({ isLoading: true });

      await new Promise<void>((resolve, reject) => {
        gapi.load('client:auth2', async () => {
          try {
            await gapi.client.init({
              apiKey: API_KEY,
              clientId: CLIENT_ID,
              discoveryDocs: [DISCOVERY_DOC],
              scope: SCOPES
            });

            const authInstance = gapi.auth2.getAuthInstance();
            const isSignedIn = authInstance.isSignedIn.get();

            // Listen for sign-in state changes
            authInstance.isSignedIn.listen((signedIn: boolean) => {
              this.updateSignInStatus(signedIn);
            });

            this.updateSignInStatus(isSignedIn);
            this.isInitialized = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      this.updateStatus({
        isLoading: false,
        error: 'Failed to initialize Google Drive API. Check your credentials.'
      });
    }
  }

  // Sign in to Google
  async signIn(): Promise<boolean> {
    // Check if credentials are configured
    if (!hasValidCredentials()) {
      this.updateStatus({
        isLoading: false,
        error: 'setup_required'
      });
      return false;
    }

    // Check if API is initialized
    if (!this.isInitialized || typeof gapi === 'undefined') {
      this.updateStatus({
        isLoading: false,
        error: 'Google API not properly initialized. Please refresh the page.'
      });
      return false;
    }

    try {
      this.updateStatus({ isLoading: true });
      const authInstance = gapi.auth2.getAuthInstance();

      if (!authInstance) {
        throw new Error('Google Auth instance not available');
      }

      await authInstance.signIn();
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      this.updateStatus({
        isLoading: false,
        error: 'Sign in failed. Please check your Google Drive API setup.'
      });
      return false;
    }
  }

  // Sign out from Google
  async signOut(): Promise<void> {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  // Backup data to Google Drive
  async backupData(data: InventoryData): Promise<boolean> {
    if (!this.currentStatus.isSignedIn) {
      throw new Error('Not signed in to Google Drive');
    }

    try {
      this.updateStatus({ ...this.currentStatus, isLoading: true });

      // Check if file already exists
      const existingFile = await this.findInventoryFile();

      const dataString = JSON.stringify({
        ...data,
        lastBackup: new Date().toISOString(),
        version: '1.0'
      }, null, 2);

      if (existingFile) {
        // Update existing file
        await this.updateFile(existingFile.id, dataString);
      } else {
        // Create new file
        await this.createFile(dataString);
      }

      this.updateStatus({
        ...this.currentStatus,
        isLoading: false,
        lastSync: new Date()
      });

      return true;
    } catch (error) {
      console.error('Backup failed:', error);
      this.updateStatus({
        ...this.currentStatus,
        isLoading: false,
        error: 'Backup failed'
      });
      return false;
    }
  }

  // Restore data from Google Drive
  async restoreData(): Promise<InventoryData | null> {
    if (!this.currentStatus.isSignedIn) {
      throw new Error('Not signed in to Google Drive');
    }

    try {
      this.updateStatus({ ...this.currentStatus, isLoading: true });

      const file = await this.findInventoryFile();
      if (!file) {
        this.updateStatus({ ...this.currentStatus, isLoading: false });
        return null;
      }

      const fileContent = await this.downloadFile(file.id);
      const data = JSON.parse(fileContent) as InventoryData & { lastBackup?: string; version?: string };

      this.updateStatus({
        ...this.currentStatus,
        isLoading: false,
        lastSync: data.lastBackup ? new Date(data.lastBackup) : new Date()
      });

      // Remove backup metadata before returning
      const { lastBackup, version, ...inventoryData } = data;
      return inventoryData as InventoryData;
    } catch (error) {
      console.error('Restore failed:', error);
      this.updateStatus({
        ...this.currentStatus,
        isLoading: false,
        error: 'Restore failed'
      });
      return null;
    }
  }

  // Find the inventory file in Google Drive
  private async findInventoryFile(): Promise<any> {
    const response = await gapi.client.drive.files.list({
      q: `name='${INVENTORY_FILENAME}' and trashed=false`,
      spaces: 'drive'
    });

    const files = response.result.files;
    return files && files.length > 0 ? files[0] : null;
  }

  // Create a new file in Google Drive
  private async createFile(content: string): Promise<any> {
    const fileMetadata = {
      name: INVENTORY_FILENAME,
      parents: ['appDataFolder'] // Store in app data folder for privacy
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'application/json' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({
        'Authorization': `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
      }),
      body: form
    });

    return response.json();
  }

  // Update an existing file in Google Drive
  private async updateFile(fileId: string, content: string): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: new Headers({
        'Authorization': `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`,
        'Content-Type': 'application/json'
      }),
      body: content
    });

    return response.json();
  }

  // Download file content from Google Drive
  private async downloadFile(fileId: string): Promise<string> {
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    return response.body;
  }

  // Update sign-in status
  private updateSignInStatus(isSignedIn: boolean): void {
    let userEmail = '';
    if (isSignedIn) {
      const user = gapi.auth2.getAuthInstance().currentUser.get();
      userEmail = user.getBasicProfile().getEmail();
    }

    this.updateStatus({
      isSignedIn,
      isLoading: false,
      userEmail,
      error: undefined
    });
  }

  // Update status and notify listeners
  private updateStatus(newStatus: Partial<SyncStatus>): void {
    this.currentStatus = { ...this.currentStatus, ...newStatus };
    this.listeners.forEach(listener => listener(this.currentStatus));
  }

  // Subscribe to status changes
  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current status
    listener(this.currentStatus);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get current status
  getStatus(): SyncStatus {
    return this.currentStatus;
  }
}

// Create and export singleton instance
export const googleDriveSync = new GoogleDriveSyncService();
