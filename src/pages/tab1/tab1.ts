import { ChatPage } from './../chat/chat';
import { HomePage } from './../home/home';
import { CallNumber } from '@ionic-native/call-number';
import { LancheDetailPage } from './../lanche-detail/lanche-detail';
import { FireService } from './../../services/fire.service';
import { Component } from '@angular/core';
import { NavController, NavParams, App, AlertController, ViewController, ModalController } from 'ionic-angular';

@Component({
  selector: 'page-tab1',
  templateUrl: 'tab1.html'
})
export class Tab1Page {
  itens: any[];
  estabelecimento: any;
  loading: boolean = true;
  constructor(
    public navCtrl: NavController, 
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public fireService: FireService,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public callnumber: CallNumber,
    public app: App
    ) {
      this.estabelecimento = this.navParams.data;
    }

  ionViewDidLoad() {
    console.log('Entrou na tab1');
    this.fireService.getItensByAba(this.estabelecimento.$key, 0)
      .subscribe(itens => {
        this.loading = false;
        this.itens = itens;
        console.log(this.itens);
      })
  }

  goToItem(item){
    this.app.getRootNav().push(LancheDetailPage, {lanche: item, estabelecimento: this.estabelecimento});

  }
  goToChat(){
    let modal = this.modalCtrl.create(ChatPage, {estabelecimento: this.estabelecimento});
    modal.present();

  }

  call(){
      let buttons;
      let subTitle;
      
      this.estabelecimento.telefone2 && this.estabelecimento.telefone1? subTitle = 'Selecione o número para o qual deseja ligar.': 'Deseja realmente ligar?'

      if(this.estabelecimento.telefone1 && this.estabelecimento.telefone1){
        buttons = [
          {
            text: this.estabelecimento.telefone1.numero,
            handler: () => {
              this.callnumber.callNumber(this.estabelecimento.telefone1.numero, true)
            }
          },
          {
            text: this.estabelecimento.telefone2.numero,
            handler: () => {
              this.callnumber.callNumber(this.estabelecimento.telefone2.numero, true)
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]
      }
      else if(this.estabelecimento.telefone2){
          buttons = [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Ligar',
              handler: () => {
                this.callnumber.callNumber(this.estabelecimento.telefone2, true)
              }
            }
          ]
        }

        else if(this.estabelecimento.telefone1){
          buttons = [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Ligar',
              handler: () => {
                this.callnumber.callNumber(this.estabelecimento.telefone2.numero, true)
              }
            }
          ]
        }

        let alert = this.alertCtrl.create({
          title: 'Ligar para '+this.estabelecimento.nome,
          subTitle: subTitle,
          buttons: buttons
        });
        alert.present();
      }

  backButtonAction(){
    console.log('Estabelecimento backbuttonaction');
    //this.viewCtrl._nav.popToRoot
    this.app.getRootNav().pop();
  }
}
