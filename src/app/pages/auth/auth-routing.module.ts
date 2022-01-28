import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { SignInOrUpComponent } from './pages/sign-in-or-up/sign-in-or-up.component';

const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'login', component: SignInOrUpComponent },
  { path: 'signup', component: SignInOrUpComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
