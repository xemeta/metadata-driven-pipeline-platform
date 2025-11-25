import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ModelerWorkbenchComponent } from './modeler-workbench/modeler-workbench.component';

@NgModule({
  declarations: [ModelerWorkbenchComponent],
  imports: [CommonModule, FormsModule],
  exports: [ModelerWorkbenchComponent],
})
export class ModelerModule {}
