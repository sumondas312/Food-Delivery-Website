import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './component/cart/cart.component';
import { HeaderComponent } from './component/header/header.component';
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { OrderComponent } from './component/order/order.component';
import { RegisterComponent } from './component/register/register.component';


const routes: Routes = [
  {path:'',redirectTo:'home',pathMatch:'full'},
  {path:'header',component:HeaderComponent},
  {path:'cart',component:CartComponent},
  {path:'order',component:OrderComponent},
  {path:'home',component:HomeComponent},
  {path:'login',component:LoginComponent},
  {path:'register',component:RegisterComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
