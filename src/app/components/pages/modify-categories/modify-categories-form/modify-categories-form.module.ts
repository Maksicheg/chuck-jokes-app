import { ExistingCategoryValidatorDirective } from './../../../../shared/validators/existing-category-validator.directive';
import { SharedModule } from './../../../../shared/shared.module';
import { ModifyCategoriesFormComponent } from './modify-categories-form.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    ModifyCategoriesFormComponent,
    ExistingCategoryValidatorDirective,
  ],
  imports: [SharedModule],
  exports: [ModifyCategoriesFormComponent],
})
export class ModifyCategoriesFormModule {}
