import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: 'reports', 
        pathMatch: 'full' 
      },
      { 
        path: 'reports', 
        loadComponent: () => import('./report-list/report-list.component').then(m => m.ReportListComponent) 
      },
      { 
        path: 'create-report', 
        loadComponent: () => import('./camera/camera.component').then(m => m.CameraComponent) 
      },
      { 
        path: 'reports/:id', 
        loadComponent: () => import('./report-detail/report-detail.component').then(m => m.ReportDetailComponent) 
      },
      { 
        path: '**', 
        redirectTo: 'reports' 
      }
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
