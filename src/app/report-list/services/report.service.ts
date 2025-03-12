import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ReportData {
  id: string;
  equipmentId: string;
  problemDescription: string;
  imageUrl: string;
  date: string;
  technician: string;
  status: 'Activo' | 'Resuelto' | 'Pendiente';
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly REPORTS_STORAGE_KEY = 'equipment_reports';
  private reportsSubject = new BehaviorSubject<ReportData[]>([]);
  reports$: Observable<ReportData[]> = this.reportsSubject.asObservable();

  constructor() {
    this.loadReports();
  }

  async loadReports(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.REPORTS_STORAGE_KEY });
      const reports = value ? JSON.parse(value) : [];
      this.reportsSubject.next(reports);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      this.reportsSubject.next([]);
    }
  }

  async saveReport(reportData: Omit<ReportData, 'id' | 'date' | 'status' | 'technician'>): Promise<ReportData> {
    try {
      const currentReports = await this.getReports();
      
      // Generar un ID único
      const id = `EQ-${new Date().getFullYear()}-${String(currentReports.length + 1).padStart(3, '0')}`;
      
      const newReport: ReportData = {
        id,
        ...reportData,
        date: new Date().toISOString(),
        technician: 'Técnico Actual', // Esto debería venir de un servicio de autenticación
        status: 'Activo'
      };
      
      const updatedReports = [...currentReports, newReport];
      await Preferences.set({
        key: this.REPORTS_STORAGE_KEY,
        value: JSON.stringify(updatedReports)
      });
      
      this.reportsSubject.next(updatedReports);
      return newReport;
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      throw error;
    }
  }

  async getReports(): Promise<ReportData[]> {
    const { value } = await Preferences.get({ key: this.REPORTS_STORAGE_KEY });
    return value ? JSON.parse(value) : [];
  }

  async getReportById(id: string): Promise<ReportData | undefined> {
    const reports = await this.getReports();
    return reports.find(report => report.id === id);
  }

  async updateReport(updatedReport: ReportData): Promise<void> {
    const reports = await this.getReports();
    const index = reports.findIndex(report => report.id === updatedReport.id);
    
    if (index !== -1) {
      reports[index] = updatedReport;
      await Preferences.set({
        key: this.REPORTS_STORAGE_KEY,
        value: JSON.stringify(reports)
      });
      
      this.reportsSubject.next(reports);
    }
  }

  async deleteReport(id: string): Promise<void> {
    const reports = await this.getReports();
    const updatedReports = reports.filter(report => report.id !== id);
    
    await Preferences.set({
      key: this.REPORTS_STORAGE_KEY,
      value: JSON.stringify(updatedReports)
    });
    
    this.reportsSubject.next(updatedReports);
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}