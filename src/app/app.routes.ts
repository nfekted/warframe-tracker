import { Routes } from '@angular/router';

//Each view is a separate chunk, loaded only when opened
export const routes: Routes = [
  { path: 'items', loadComponent: () => import('./items-panel/items-panel.component').then(m => m.ItemsPanelComponent) },
  { path: 'incarnon', loadComponent: () => import('./incarnon-panel/incarnon-panel.component').then(m => m.IncarnonPanelComponent) },
  { path: 'star-chart', loadComponent: () => import('./star-chart-panel/star-chart-panel.component').then(m => m.StarChartPanelComponent) },
  { path: 'market', loadComponent: () => import('./market/market.component').then(m => m.MarketComponent) },
  { path: '**', redirectTo: 'items' },
];
