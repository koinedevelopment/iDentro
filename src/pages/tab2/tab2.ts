import { ChatPage } from './../chat/chat';
import { CallNumber } from '@ionic-native/call-number';
import { FireService } from './../../services/fire.service';
import { LancheDetailPage } from './../lanche-detail/lanche-detail';
import { Component } from '@angular/core';
import { NavController, NavParams, App, AlertController, ModalController, IonicPage, Events, ToastController } from 'ionic-angular';
import * as firebase from 'firebase';

@Component({
  selector: 'page-tab2',
  templateUrl: 'tab2.html'
})
export class Tab2Page {
  itens: any[];
  estabelecimento: any;
  loading: boolean = true;
  aba_key: string = '';
  qtdeCarrinho: number = 0;
  linkLocalizacao: string = '';
  currentUser: any;
  toast: any;
  constructor(
    public navCtrl: NavController, 
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public fireService: FireService,
    public modalCtrl: ModalController,
    public callnumber: CallNumber,
    public app: App,
    public events: Events,
    public toastCtrl: ToastController

    ) {
      this.estabelecimento = this.navParams.data.estabelecimento;
      this.aba_key = this.navParams.data.abas_key[1];
      this.toast = this.toastCtrl.create({
        message: 'Item adicionado ao carrinho',
        duration: 2000,
        closeButtonText: 'X'
      })
      if(this.estabelecimento.localizacao.lat && this.estabelecimento.localizacao.lng){
        this.linkLocalizacao = "http://maps.google.com/maps?q=" + this.estabelecimento.localizacao.lat + ',' + this.estabelecimento.localizacao.lng + "("+ this.estabelecimento.nome +")&z=15";
      }
      this.qtdeCarrinho = this.fireService.getQuantidadeItensCarrinho();
    }

  ionViewDidLoad() {
    console.log('estabelecimento: ', this.estabelecimento);
    this.events.subscribe('quantidade:carrinho', qtde => {
      console.log('quantidade:carrinho tab2: ', qtde);
      this.qtdeCarrinho = qtde;
    });
    this.fireService.getItensByAba(this.estabelecimento.$key, this.aba_key)
      .subscribe(itens => {
        this.loading = false;
        this.itens = itens;
        this.currentUser = firebase.auth().currentUser;
      })
  }

  goToItem(item){
    this.app.getRootNav().push('LancheDetailPage', {lanche: item, estabelecimento: this.estabelecimento});
  }
  
  goToChat(){
    let modal = this.modalCtrl.create(ChatPage, {estabelecimento: this.estabelecimento});
    modal.present();

  }
  addToCart(item: any){
    try{
      let result = this.fireService.addToCart(item, this.estabelecimento);
      if(result != true){
        let alert = this.alertCtrl.create({
          title: 'Erro',
          subTitle: 'Você possui itens de outro estabelecimento adicionados no carrinho. Deseja limpar o carrinho?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Ok',
              handler: () => {
                this.fireService.limpaCarrinho()
              }
            }
          ]
        })
        alert.present();  
      }
      else{
        this.toast.present();
      }
    }
    catch (err) {
      console.log(err);
    }
  }
  call(){
      let buttons;
      let subTitle;
      
      this.estabelecimento.telefone2 && this.estabelecimento.telefone1? subTitle = 'Selecione o número para o qual deseja ligar.': 'Deseja realmente ligar?'

      if(this.estabelecimento.telefone1 && this.estabelecimento.telefone2){
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

  goToCarrinho(){
    this.app.getRootNav().push('CarrinhoPage');
  }
}
