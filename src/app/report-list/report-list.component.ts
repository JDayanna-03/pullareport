import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReportData, ReportService } from './services/report.service';
@Component({
  selector: 'app-report-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.css'
})
export class ReportListComponent implements OnInit {
  reportService: ReportService = inject(ReportService);
  router: Router = inject(Router);
  
  reports: ReportData[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  
  ngOnInit(): void {
    this.loadReports();
  }
  
  async loadReports() {
    try {
      console.log('ReportListComponent: Comenzando a cargar reportes...');
      this.loading = true;
      
      // Forzar la recarga de reportes desde el almacenamiento
      await this.reportService.loadReports();
      
      // Obtener los reportes actualizados
      const reports = await this.reportService.getReports();
      console.log('ReportListComponent: Reportes cargados:', reports);
      
      this.reports = reports;
      
      // Ordenamos los reportes por fecha (más recientes primero)
      if (this.reports && this.reports.length > 0) {
        this.reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        console.log('ReportListComponent: Reportes ordenados correctamente');
      } else {
        console.log('ReportListComponent: No hay reportes para ordenar');
      }
      
      this.loading = false;
    } catch (error) {
      console.error('Error al cargar los reportes:', error);
      this.errorMessage = 'No se pudieron cargar los reportes. Intente nuevamente.';
      this.loading = false;
    }
  }
  
  formatDate(isoString: string): string {
    return this.reportService.formatDate(isoString);
  }
  
  viewDetails(reportId: string) {
    // Navegar a la vista de detalles (a implementar)
    this.router.navigate(['/reports', reportId]);
  }
  
  async deleteReport(reportId: string, event: Event) {
    event.stopPropagation(); // Evitar navegación a detalles
    
    if (confirm('¿Está seguro que desea eliminar este reporte?')) {
      try {
        await this.reportService.deleteReport(reportId);
        this.reports = this.reports.filter(report => report.id !== reportId);
      } catch (error) {
        console.error('Error al eliminar el reporte:', error);
        this.errorMessage = 'No se pudo eliminar el reporte. Intente nuevamente.';
      }
    }
  }
  
  createNewReport() {
    this.router.navigate(['/create-report']);
  }
}