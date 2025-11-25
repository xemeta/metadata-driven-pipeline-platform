import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ModelerModule } from './modeler/modeler.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [BrowserModule, AppRoutingModule, ModelerModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
