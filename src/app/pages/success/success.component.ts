import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  transactionId: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.transactionId = this.route.snapshot.paramMap.get('transactionId');
    console.log(this.transactionId);
  }
}
