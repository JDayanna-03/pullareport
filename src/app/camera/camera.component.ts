import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CameraService } from './services/camera.service';
import { ReportService } from '../report-list/services/report.service';

@Component({
  selector: 'app-camera',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent implements OnInit {
  cameraService: CameraService = inject(CameraService);
  reportService: ReportService = inject(ReportService);
  formBuilder: FormBuilder = inject(FormBuilder);
  router: Router = inject(Router);
  
  problemForm!: FormGroup;
  imgUrl: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  savedPhotos: string[] = [];
  showGallery: boolean = false;
  formSubmitted: boolean = false;
  
  ngOnInit() {
    this.loadSavedPhotos();
    this.initForm();
  }
  
  initForm() {
    this.problemForm = this.formBuilder.group({
      equipmentId: ['', [Validators.required, Validators.minLength(3)]],
      problemDescription: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  
  async loadSavedPhotos() {
    try {
      this.savedPhotos = await this.cameraService.getSavedPhotos();
    } catch (error) {
      console.error('Error al cargar fotos guardadas:', error);
      this.errorMessage = 'No se pudieron cargar las fotos guardadas';
    }
  }
  
  async takePictureFromCamera() {
    this.errorMessage = ''; // Limpiar mensajes de error anteriores
    try {
      this.loading = true;
      this.imgUrl = await this.cameraService.takePictureFromCamera();
      if (!this.imgUrl) {
        throw new Error('No se obtuvo una imagen válida');
      }
      await this.cameraService.savePhoto(this.imgUrl); // Guardar la foto automáticamente
      await this.loadSavedPhotos(); // Recargar la lista de fotos
      await new Promise(resolve => setTimeout(resolve, 100));
      this.loading = false;
    } catch (error) {
      console.error('Error al capturar imagen con cámara:', error);
      this.errorMessage = String(error);
      this.imgUrl = '';
      this.loading = false;
    }
  }
  
  async takePictureFromGallery() {
    this.errorMessage = ''; // Limpiar mensajes de error anteriores
    try {
      this.loading = true;
      this.imgUrl = await this.cameraService.takePictureFromGallery();
      if (!this.imgUrl) {
        throw new Error('No se obtuvo una imagen válida');
      }
      await this.cameraService.savePhoto(this.imgUrl); // Guardar la foto automáticamente
      await this.loadSavedPhotos(); // Recargar la lista de fotos
      await new Promise(resolve => setTimeout(resolve, 100));
      this.loading = false;
    } catch (error) {
      console.error('Error al seleccionar imagen de la galería:', error);
      this.errorMessage = String(error);
      this.imgUrl = '';
      this.loading = false;
    }
  }
  
  selectPhoto(photoUrl: string) {
    this.imgUrl = photoUrl;
    this.showGallery = false;
  }
  
  async deletePhoto(index: number, event: Event) {
    event.stopPropagation(); // Evitar que se seleccione la foto al eliminarla
    try {
      this.loading = true;
      await this.cameraService.deletePhoto(index);
      await this.loadSavedPhotos();
      this.loading = false;
      // Si la foto actual fue eliminada, limpiar imgUrl
      if (this.imgUrl === this.savedPhotos[index]) {
        this.imgUrl = '';
      }
    } catch (error) {
      console.error('Error al eliminar la foto:', error);
      this.errorMessage = 'No se pudo eliminar la foto';
      this.loading = false;
    }
  }
  
  
  async onSubmit() {
    this.formSubmitted = true;
    this.errorMessage = '';
    
    if (this.problemForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos';
      return;
    }
    
    if (!this.imgUrl) {
      this.errorMessage = 'Por favor, capture o seleccione una imagen';
      return;
    }
    
    try {
      this.loading = true;
      
      // Obtener los datos del formulario
      const formData = {
        equipmentId: this.problemForm.value.equipmentId,
        problemDescription: this.problemForm.value.problemDescription,
        imageUrl: this.imgUrl
      };
      console.log('Router:', this.router);
      // Guardar el reporte utilizando el servicio

      this.loading = false;

      await this.reportService.saveReport(formData);
      
      // Mostrar mensaje de éxito y navegar a la lista de reportes
      alert('Reporte guardado con éxito');
      this.router.navigate(['/reports']); // Esta línea podría faltar
      this.resetForm();
      
    } catch (error) {
      console.error('Error al guardar el reporte:', error);
      this.errorMessage = 'No se pudo guardar el reporte. Intente nuevamente.';
      this.loading = false;
    }
  }
  
  resetForm() {
    this.problemForm.reset();
    this.imgUrl = '';
    this.formSubmitted = false;
    this.errorMessage = '';
  }
}