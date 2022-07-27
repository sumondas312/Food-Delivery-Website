import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ApiService } from "src/app/service/api.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {

  name:any="";

  alert = {
    error: {
      // name:"",
      email: "",
      password: "",
    },
  };

  message = {
    error: "",
  };

  constructor(
    private fb: FormBuilder,
    private login: ApiService,
    private router: Router
  ) {}

  loginForm = this.fb.group({
    // name: ["", Validators.required],
    email: ["", Validators.required],
    password: ["", Validators.required]
  });

  ngOnInit(): void {
    if (
      localStorage.getItem('token') != null &&
      localStorage.getItem('name') != null
    ) {
      this.router.navigate(['/order']);
    } else {
      this.cap();
    }
  }

  validateCredential(form: any) {
    // this.alert.error.name = form.controls.name.errors
    //   ? 'Name is required'
    //   : '';
    this.alert.error.email = form.controls.email.errors
      ? 'User Id is required'
      : '';
    this.alert.error.password = form.controls.password.errors
      ? 'Password is required'
      : '';

    if (form.valid) {
      this.message.error = '';
      var str1: any = document.getElementById('capt');
      var str2: any = document.getElementById('testCapt');
      if (str1.value == str2.value) {
        console.log(form.value);
        this.login.login(form.value).subscribe(
          (res:any) => {
            console.log(res);
            window.localStorage.setItem('token', res.body.token);
            window.localStorage.setItem('name', res.body.name);
            window.location.reload();
            this.router.navigate(['/order']);
          },
          (err:any) => {
            if (err == 400) {
              console.log(err);
              this.message.error = 'Invalid UserId and Password';
            } else {
              console.log(err);
              this.message.error = 'Server not found';
            }
          }
        );
      } else {
        this.message.error = 'Captcha not valid';
      }
    }
  }

  cap() {
    var alpha = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '0',
    ];
    var a = alpha[Math.floor(Math.random() * 36)];
    var b = alpha[Math.floor(Math.random() * 36)];
    var c = alpha[Math.floor(Math.random() * 36)];
    var d = alpha[Math.floor(Math.random() * 36)];
    var e = alpha[Math.floor(Math.random() * 36)];
    var f = alpha[Math.floor(Math.random() * 36)];

    var final = a + b + c + d + e + f;
    let captcha: any = document.getElementById('capt');
    captcha.value = final;
  }
}
