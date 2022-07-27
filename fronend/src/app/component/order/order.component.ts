import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  error:any="";
  isSubmit=false;
  link:any;
  username=localStorage.getItem('name');

  constructor(private apiservice:ApiService,private router: Router) { }

  ngOnInit(): void {
  }

submit(){

  var name:any=document.getElementById("name");
  var mobile:any=document.getElementById("mobile");
  var order:any=document.getElementById("order");
  var quantity:any=document.getElementById("quantity");
  var date:any=document.getElementById("date");
  var time:any=document.getElementById("time");
  var address:any=document.getElementById("address");

  var formdata = {
    name: name.value,
    mobile:mobile.value,
    order:order.value,
    quantity:quantity.value,
    date:date.value,
    time:time.value,
    address:address.value,
  };
  if(name.value!=""&&mobile.value!=""&&order.value!=""&&quantity.value!=""&&date.value!=""&&time.value!=""&&address.value!=""){
  this.apiservice.order(formdata).subscribe(
    (res: any) => {
      console.log(res);
      this.isSubmit = true;
      this.link = res.body.link;
      // setTimeout(() => {
      //   let ref = document.getElementById('pdf');
      //   ref?.click();
      //   console.log(this.link);
      // }, 1000);
      
    },
    (err) => {
      this.isSubmit = false;
      console.log(err);
    }
    );
    console.log(formdata);
  }else{
    this.isSubmit = false;
    this.error="Please fill all the fields";
  }
    
}
logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      this.router.navigate(['/login']);
    }
}
