import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportData, ReportService } from '../report-list/services/report.service';
@Component({
  selector: 'app-report-detail',
  imports: [CommonModule,RouterModule, ReactiveFormsModule],
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css'
})
export class ReportDetailComponent implements OnInit {
  reportService: ReportService = inject(ReportService);
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  formBuilder: FormBuilder = inject(FormBuilder);
  
  reportId: string = '';
  report: ReportData | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  editMode: boolean = false;
  
  reportForm!: FormGroup;
  
  ngOnInit(): void {
    this.reportId = this.route.snapshot.paramMap.get('id') || '';
    if (this.reportId) {
      this.loadReport();
    } else {
      this.errorMessage = 'ID de reporte no válido';
      this.loading = false;
    }
  }
  
  async loadReport() {
    try {
      const report = await this.reportService.getReportById(this.reportId);
      if (report) {
        this.report = report;
        this.initForm();
      } else {
        this.errorMessage = 'Reporte no encontrado';
      }
      this.loading = false;
    } catch (error) {
      console.error('Error al cargar el reporte:', error);
      this.errorMessage = 'No se pudo cargar el reporte';
      this.loading = false;
    }
  }
  
  initForm() {
    if (!this.report) return;
    
    this.reportForm = this.formBuilder.group({
      equipmentId: [this.report.equipmentId, [Validators.required, Validators.minLength(3)]],
      problemDescription: [this.report.problemDescription, [Validators.required, Validators.minLength(10)]],
      status: [this.report.status, Validators.required]
    });
    
    // Desactivar el formulario inicialmente
    this.reportForm.disable();
  }
  
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.reportForm.enable();
    } else {
      this.reportForm.disable();
    }
  }
  
  async saveChanges() {
    if (!this.report || this.reportForm.invalid) return;
    
    try {
      this.loading = true;
      
      const updatedReport: ReportData = {
        ...this.report,
        equipmentId: this.reportForm.value.equipmentId,
        problemDescription: this.reportForm.value.problemDescription,
        status: this.reportForm.value.status
      };
      
      await this.reportService.updateReport(updatedReport);
      this.report = updatedReport;
      this.editMode = false;
      this.reportForm.disable();
      this.loading = false;
      
      alert('Reporte actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar el reporte:', error);
      this.errorMessage = 'No se pudo actualizar el reporte';
      this.loading = false;
    }
  }
  
  async deleteReport() {
    if (!this.report) return;
    
    if (confirm('¿Está seguro que desea eliminar este reporte?')) {
      try {
        this.loading = true;
        await this.reportService.deleteReport(this.report.id);
        this.loading = false;
        alert('Reporte eliminado con éxito');
        this.router.navigate(['/reports']);
      } catch (error) {
        console.error('Error al eliminar el reporte:', error);
        this.errorMessage = 'No se pudo eliminar el reporte';
        this.loading = false;
      }
    }
  }
  
  formatDate(isoString: string): string {
    return this.reportService.formatDate(isoString);
  }
  
  goBack() {
    this.router.navigate(['/reports']);
  }
}
