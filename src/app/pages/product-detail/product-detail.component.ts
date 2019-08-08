import { Component, OnInit, NgZone } from '@angular/core';
import {
  IPayPalConfig,
  ICreateOrderRequest,
  IAddressPortable,
  IPartyName,
  ITaxInfo,
  IPhone
} from 'ngx-paypal';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

interface IPayer {
  name?: IPartyName;
  email_address?: string;
  payer_id?: string;
  birth_date?: string;
  tax_info?: ITaxInfo;
  address?: IAddressPortable;
  phone?: IPhone;
}

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

  dataName: IPartyName = {
    prefix: '',
    given_name: 'Eduardo',
    surname: 'Jastre',
    middle_name: '',
    suffix: '',
    alternate_full_name: 'Eduardo Jastre',
    full_name: 'Eduardo Jastre'
  };

  dataAddress: IAddressPortable = {
    address_line_1: 'Ataliba leonel',
    address_line_2: '452',
    country_code: 'BR',
    postal_code: '11370-450',
    admin_area_1: 'São Vicente',
    admin_area_2: 'São Paulo'
  };

  dataPayer: IPayer = {
    name: this.dataName,
    email_address: 'email@gmail.com',
    address: this.dataAddress,
    phone: {
      phone_number: { national_number: '1234-5678' },
      phone_type: 'MOBILE'
    }
  };

  addressForm: FormGroup;
  orderID: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const key = 'id';
      this.id = +params[key];
    });

    this.getProdutos(this.id)
      .then(data => {
        this.currentProduct = data;

        const product = this.currentProduct;

        this.dataFields = {
          intent: 'CAPTURE',
          payer: {
            name: {
              given_name: this.dataName.given_name,
              surname: this.dataName.surname
            },
            address: this.dataAddress,
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
      })
      .finally(() => {
        // console.log(this.dataFields);
        this.initConfig();
      });
  }

  async getProdutos(id) {
    const res = await this.http
      .get('https://paypal-node-jastre.herokuapp.com/products/' + id)
      .toPromise();

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
        const res = await fetch(
          'https://paypal-node-jastre.herokuapp.com/buy',
          {
            method: 'post',
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.dataFields)
          }
        );
        const order = await res.json();
        // console.log(order);
        // this.orderID = order.orderID;
        return order.orderID;
      },
      onApprove: (data, actions) => {
        console.log(
          'onApprove - transaction was approved, but not authorized',
          data,
          actions
        );
        actions.order.get().then(details => {
          this.orderID = details.id;
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

        setTimeout(() => {
          this.ngZone.run(() =>
            this.router.navigate(['success', this.orderID])
          );
        }, 500);
        // this.router.navigateByUrl('/success/' + data.id);
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
