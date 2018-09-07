import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgSelectedTextTooltipModule } from 'ng-selected-text-tooltip';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgSelectedTextTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
