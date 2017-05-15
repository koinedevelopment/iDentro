import { SuperTabsModule } from 'ionic2-super-tabs';
import { EstabelecimentoPage } from './estabelecimento';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';


@NgModule({
  declarations: [
    EstabelecimentoPage,
  ],
  imports: [
    IonicPageModule.forChild(EstabelecimentoPage),
    SuperTabsModule
  ],
  exports: [
    EstabelecimentoPage
  ]
})
export class EstabelecimentosPageModule {}
