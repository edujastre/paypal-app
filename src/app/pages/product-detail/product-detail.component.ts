import { Component, OnInit } from '@angular/core';
import { IPayPalConfig, ICreateOrderRequest, IAddressPortable } from 'ngx-paypal';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'



@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  currentProduct: any;
  id: number;

  payPalConfig?: IPayPalConfig;
  showSuccess: boolean;

  dataFields: ICreateOrderRequest;
  dataAddress: IAddressPortable = {
    address_line_1: 'Ataliba leonel',
    address_line_2: '452',
    country_code: 'BR',
    postal_code: '11370-450',
    admin_area_2: 'São Vicente'
  };

  addressForm: FormGroup;


  constructor(private route: ActivatedRoute, private http: HttpClient) {}


  ngOnInit() {


    this.route.params.subscribe(params => {
      this.id = +params['id'];
      console.log(this.id);
    });

    //this.currentProduct =
    this.getProdutos(this.id).then(
      data => {
        console.log(data);
        this.currentProduct = data;

        const product = this.currentProduct;
        console.log(product[0].preco);

        this.dataFields = {
        intent: 'CAPTURE',
        payer: {
          address: this.dataAddress
        },
        purchase_units: [
          {
            shipping: {
              address: this.dataAddress
            },
            amount: {
              currency_code: 'BRL',
              value: product[0].preco,
              breakdown: {
                item_total: {
                  currency_code: 'BRL',
                  value: product[0].preco
                }
              }
            },
            items: [
              {
                name: product[0].titulo,
                quantity: '1',
                category: 'DIGITAL_GOODS',
                unit_amount: {
                  currency_code: 'BRL',
                  value: product[0].preco
                }
              }
            ]
          }
        ]
      };
      }
    ).finally(() => {
      console.log(this.dataFields);
      this.initConfig();
    });


  }

  async getProdutos(id) {
    const res = await this.http.get('http://localhost:3000/products/' + id).toPromise();


    return res;
  }

  private initConfig(): void {
    this.payPalConfig = {
      style: {
        label: 'checkout',
        color: 'blue',
        shape: 'pill'
      },
      currency: 'BRL',
      clientId:
        'AeFZmDW4AtJR36IA3bzKD0Ra8_sqX6iOV4yXTd66_Bc_WFbQjv4YN-DNau8TdIk5RS0DSV2v2IahCaAO',
      createOrderOnServer: async data => {
        const res = await fetch('http://localhost:3000/buy', {
          method: 'post',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.dataFields)
        });
        const order = await res.json();
        console.log(order);
        console.log(data.orderID);
        return order.orderID;
      },
      onApprove: (data, actions) => {
        console.log(
          'onApprove - transaction was approved, but not authorized',
          data,
          actions
        );
        actions.order.get().then(details => {
          console.log(
            'onApprove - you can get full order details inside onApprove: ',
            details
          );
        });
      },
      onClientAuthorization: data => {
        console.log(
          'onClientAuthorization - you should probably inform your server about completed transaction at this point',
          data
        );
        this.showSuccess = true;
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        console.log('OnError', err);
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      }
    };
  }
}
