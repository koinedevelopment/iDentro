import { lanches, estabelecimentos, lanches_por_estabelecimento } from './dados';
import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { AngularFireOffline, ListObservable, ObjectObservable } from 'angularfire2-offline';
import { Observable } from 'rxjs';
import { Facebook } from 'ionic-native';
import * as firebase from 'firebase';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class FireService {
    uid= '';
    cart: any = {};
    public auth = firebase.auth();
    public user = this.auth.currentUser;
    constructor(
        private afo: AngularFireOffline,
        private af: AngularFire
    ) {
         firebase.auth().onAuthStateChanged(user => {
            if(user){
                this.uid = user.uid;
                console.log('onAuthState ',user);
            }
        })
    }

    getEstabelecimentos(){
        return this.af.database.list('estabelecimentos');
    }

    getEstabelecimentoByKey(estabelecimento_key: string): Observable<any>{
        console.log(estabelecimento_key);
        return this.af.database.object('estabelecimentos/'+estabelecimento_key);
    }
    getIngredientes(){
        return this.af.database.list('ingredientes');
    }

    getLanchesPorIngredientes(ingredientes){
        return this.af.database.list('lanches');
    }
    getLanchesPorEstabelecimento(key_estabelecimento: string){
        console.log('key_estb: ',key_estabelecimento)
        return this.af.database.list('lanches_por_estabelecimento/'+key_estabelecimento);
    }

    getLancheByKey(key_lanche: string){
        console.log('key_lanche: ', key_lanche)
        return this.af.database.object('lanches/'+key_lanche);
    }
    getUid(){
        return this.uid;
    }

    addToCart(lanche, estabelecimento): string{
        
        let adicionado: boolean = false;
        console.log(!this.cart.estabelecimento);
        console.log(this.cart);
        if(!this.cart.estabelecimento){     //Se o carrinho está vazio, insere uma entrada no carrinho
            this.cart = {
                estabelecimento: estabelecimento,
                valor_total: lanche.preco,
                itens: [{quantidade: 1, lanche: lanche}]
            }

            adicionado = true;
            return 'success';
        }

        else{

            if(estabelecimento.$key != this.cart.estabelecimento.$key){    //Verifica se o item adicionado é de um estabelecimento diferente do que já foi adicionado ao carrinho
                return 'error'  
            }
            else{
                this.cart.itens.map(item => {               //Percorre o array de itens para ver se já existe um item igual no carrinho
                    if(lanche.$key == item.lanche.$key){
                        item.quantidade++;
                        this.cart.valor_total += lanche.preco;
                        adicionado = true;
                    }
                })

                if(!adicionado){   //Caso não haja um item igual, insere uma nova entrada.
                    this.cart.itens.push({quantidade: 1, lanche: lanche});
                    this.cart.valor_total += lanche.preco;
                }
            }
        }
        console.log(this.cart);
        return 'sucess';
        /*
        let adicionado: boolean = false;

        console.log('carrinho: ', this.cart);

        if(this.cart.length == 0){

            this.cart.push({
                estabelecimento: estabelecimento,
                valor_total: lanche.preco,
                itens: [{quantidade: 1, lanche: lanche}]
            })
            adicionado = true;
        }
        else{
            console.log('Adicionado: ', adicionado);
            let achouEstabelecimento = false;
            this.cart.map(aux => {
                if(aux.estabelecimento.$key == estabelecimento.$key){
                    achouEstabelecimento = true;

                    aux.itens.map(item => {
                        if(lanche.$key == item.lanche.$key){
                            item.quantidade++;
                            aux.valor_total += lanche.preco;
                            adicionado = true;
                        }
                    })

                    if(!adicionado){
                        aux.itens.push({quantidade: 1, lanche: lanche});
                        aux.valor_total += lanche.preco;
                    }
                }
            })
            if(!achouEstabelecimento){
                this.cart.push({
                    estabelecimento: estabelecimento,
                    valor_total: lanche.preco,
                    itens: [{quantidade: 1, lanche: lanche}]
                })
            }
        }
        

        console.log(this.cart); */
    
}

    fecharPedido(index: number){
        console.log(this.cart[index]);
    }

    /*
    addToCart(lanche){
        let adicionado: boolean = false;
        console.log('carrinho: ', this.cart);

        if(this.cart.length == 0){
            this.cart.push({quantidade: 1, lanche: lanche});
            adicionado = true;
            console.log('Cart = 0 ', lanche)
        }
        if(!adicionado){
            console.log('Nao adicionado: ', lanche);
            this.cart.map(item => {
                console.log('Mapeando itens');
                if(lanche.$key == item.lanche.$key){
                    item.quantidade++;
                    adicionado = true;
                    console.log('Achou o lanche', this.cart);
                }
            })
        }
        if(!adicionado){
            console.log('Não encontrou lanche', lanche);
            this.cart.push({quantidade: 1, lanche: lanche});
            console.log('carrinho: ', this.cart);
        }
    }
    
     */

    limpaCarrinho(){
        this.cart = {};
    }
    removeItem(item): Array<any>{
        this.cart.itens.map((aux, indexItem) => {
            if(item.lanche.$key == aux.lanche.$key){
                this.cart.valor_total -= item.lanche.preco;
                this.cart.itens.splice(indexItem,1); // Caso contrário, exclua apenas o do lanches.
                if(this.cart.itens.length == 0)   //Se não houver mais itens no carrinho. Exclua o estabelecimento do carrinho.
                    this.cart = {};
            }
        })
        console.log(this.cart);
        return this.cart;
    }

    diminuiItem(item): Array<any>{
        this.cart.itens.map(aux => {
            if(item.lanche.$key == aux.lanche.$key){
                aux.quantidade = aux.quantidade - 1;
                this.cart.valor_total -= item.lanche.preco;
            }
        });
        return this.cart;
    }

    addItem(item){
        this.cart.itens.map(aux => {
            if(item.lanche.$key == aux.lanche.$key){
                aux.quantidade = aux.quantidade + 1;
                this.cart.valor_total += item.lanche.preco;
            }
        });
        return this.cart;
    }

    getCart(){
        return this.cart;
    }


    addBairro(nomeBairro: string):firebase.Promise<any>{
        return this.af.database.list('bairros').push({nome: nomeBairro});
    }

    getBairros(): Observable<any>{
        console.log('getBairros');
        return this.af.database.list('bairros', {
            query: {
                orderByChild: 'nome'
            }
        });
    }

    getBairroByKey(key: string):Observable<any>{
        return this.af.database.object('bairros/'+key);
    }

    addToFavorito(estabelecimento:any, jaFavorito:boolean):firebase.Promise<any>{
        console.log(estabelecimento);
        if(jaFavorito){
            return firebase.database().ref('usuarios_favoritos/'+this.uid+'/favoritos/'+estabelecimento.$key).remove();
        }
        else{
            return firebase.database().ref('usuarios_favoritos/'+this.uid+'/favoritos/'+estabelecimento.$key).set({
                nome: estabelecimento.nome,
                key: estabelecimento.$key,
                imagemCapa: estabelecimento.imagemCapa,
                telefone: estabelecimento.telefone,
                celular: estabelecimento.celular
            })
        }
    }

    checkFavorito(estabelecimento_key: string): Promise<boolean>{
        let promise = new Promise((resolve, reject) => {
            firebase.database().ref('usuarios_favoritos/'+this.uid+'/favoritos/'+estabelecimento_key).once('value')
                .then(snap => {
                    console.log('snap favorito: ', snap.val());
                    if(snap.val())
                        resolve(true)
                    else    
                        resolve(false);
                })
        })
        return promise;
    }

    getFavoritos():Observable<any>{
        return this.af.database.list('usuarios_favoritos/'+this.uid+'/favoritos');
    }

    loginWithFacebook(): Promise<any>{
        let promise: Promise<any>;
        promise = new Promise((resolve, reject) => {
            Facebook.login(['user_friends', 'public_profile', 'email'])
                .then(userFacebook => {
                    let accessToken = userFacebook.authResponse.accessToken;
                    let credential: firebase.auth.AuthCredential;
            
                    console.log('credential: ', credential)
                    console.log('firebase authProvider: ', firebase.auth.FacebookAuthProvider.credential(accessToken));
                    firebase.auth().signInWithCredential(firebase.auth.FacebookAuthProvider.credential(accessToken))
                        .then(user => {
                            console.log('User após credencial: ', user);
                            this.saveUserInfoCurrent();
                            return resolve('logado');
                        })
                        .catch(err => {
                            console.log(err);
                            if(err['code'] == "auth/email-already-in-use" || err['code'] == "auth/account-exists-with-different-credential"){
                                return resolve(err);

                            }
                        })
                })
        });
        return promise;
    }

    saveUserInfoCurrent():firebase.Promise<any>{
        let user = this.auth.currentUser;
        let obj_user = {
                uid: user.uid,
                nome: user.displayName,
                imagem: user.photoURL,
                email: user.email 
            }
        return firebase.database().ref('usuarios_app/'+user.uid).set(obj_user)
    }

    logout(): firebase.Promise<any>{
        return firebase.auth().signOut();
    }
}