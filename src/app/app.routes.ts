import { Routes } from '@angular/router';

import { authChildGuard, publicOnlyChildGuard } from './core/auth/auth.guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { ProtectedLayout } from './layouts/protected-layout/protected-layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { Register } from './pages/register/register';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '',
    component: AuthLayout,
    canActivateChild: [publicOnlyChildGuard],
    children: [
      {
        path: 'login',
        component: Login,
      },
      {
        path: 'register',
        component: Register,
      },
    ],
  },
  {
    path: '',
    component: ProtectedLayout,
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'home',
        component: Home,
      },
      {
        path: 'profile',
        component: Profile,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
