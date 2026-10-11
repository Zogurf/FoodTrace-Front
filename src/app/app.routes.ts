import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { HomeComponent } from './home.component';
import { LoginComponent } from './login.component';
import { CatalogosComponent } from './catalogos.component';
import { TrazabilidadComponent } from './trazabilidad.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'catalogos', component: CatalogosComponent, canActivate: [authGuard] },
  { path: 'trazabilidad', component: TrazabilidadComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' }
];
