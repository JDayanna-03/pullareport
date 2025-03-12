import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private readonly PHOTOS_STORAGE_KEY = 'saved_photos';

  constructor() { }

  private async checkPermissions(): Promise<void> {
    const check = async (permission: PermissionStatus): Promise<boolean> => {
      if (permission.camera !== 'granted' || permission.photos !== 'granted') {
        const request = await Camera.requestPermissions();
        return request.camera === 'granted' && request.photos === 'granted';
      }
      return true;
    };
   
    const permissions = await Camera.checkPermissions();
    if (!(await check(permissions))) {
      throw new Error('Permisos de cámara no otorgados');
    }
  }

  async takePictureFromCamera(): Promise<string> {
    await this.checkPermissions();
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera // Modificado para usar la cámara específicamente
    });

    var imageUrl = image.webPath;

    if (imageUrl != null) {
      return imageUrl;
    } else {
      throw new Error("Error al tomar la foto");
    }
  }

  async takePictureFromGallery(): Promise<string> {
    await this.checkPermissions();
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos // Usar la galería de fotos
    });

    var imageUrl = image.webPath;

    if (imageUrl != null) {
      return imageUrl;
    } else {
      throw new Error("Error al seleccionar la foto");
    }
  }

  // Métodos de almacenamiento integrados en el servicio de cámara
  
  async getSavedPhotos(): Promise<string[]> {
    const { value } = await Preferences.get({ key: this.PHOTOS_STORAGE_KEY });
    return value ? JSON.parse(value) : [];
  }

  async savePhoto(photoUrl: string): Promise<void> {
    const savedPhotos = await this.getSavedPhotos();
    
    // Comprobar si la foto ya está guardada para evitar duplicados
    if (!savedPhotos.includes(photoUrl)) {
      savedPhotos.push(photoUrl);
      await Preferences.set({
        key: this.PHOTOS_STORAGE_KEY,
        value: JSON.stringify(savedPhotos)
      });
    }
  }

  async deletePhoto(index: number): Promise<void> {
    const savedPhotos = await this.getSavedPhotos();
    
    if (index >= 0 && index < savedPhotos.length) {
      savedPhotos.splice(index, 1);
      await Preferences.set({
        key: this.PHOTOS_STORAGE_KEY,
        value: JSON.stringify(savedPhotos)
      });
    }
  }
}