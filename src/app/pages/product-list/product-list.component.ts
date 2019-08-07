import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  listProducts: any = [];

  constructor() {}

  ngOnInit() {
    this.listProducts = this.getProdutos();
  }

  async getProdutos() {
    const res = await fetch('https://paypal-node-jastre.herokuapp.com/products');
    const listProdutos = await res.json();
    // console.log(listProdutos);
    return listProdutos;
  }
}
