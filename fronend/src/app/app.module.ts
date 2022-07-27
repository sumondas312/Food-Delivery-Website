import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './component/header/header.component';
import { CartComponent } from './component/cart/cart.component';
import { HttpClientModule} from "@angular/common/http";
import { FilterPipe } from './shared/filter.pipe';
import { FormsModule,ReactiveFormsModule } from "@angular/forms";
import { OrderComponent } from './component/order/order.component';
import { HomeComponent } from './component/home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegisterComponent } from './component/register/register.component';
import { LoginComponent } from './component/login/login.component';
import { NgImageSliderModule } from 'ng-image-slider';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CartComponent,
    FilterPipe,
    OrderComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgImageSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
