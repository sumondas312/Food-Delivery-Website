import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  alert = {
    error: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAndConditions: '',
    },
  };

  message = {
    error: '',
    success: '',
  };

  constructor(private fb: FormBuilder,
    private signup: ApiService,
    private router: Router) { }

    registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', Validators.required],
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(
              '(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!#^~%*?&,.<>"\'\\;:{\\}\\[\\]\\|\\+\\-\\=\\_\\)\\(\\)\\`\\/\\\\\\]])[A-Za-z0-9d$@].{7,}'
            ),
          ]),
        ],
        confirmPassword: ['', Validators.required],
        termsAndConditions: ['', Validators.required],
      },
      {
        validators: this.MustMatch('password', 'confirmPassword'),
      }
    );
  
    //password and confirm password matching function
    MustMatch(controlName: string, matchingControlName: string) {
      return (registerForm:any) => {
        const control = registerForm.controls[controlName];
        const matchingControl = registerForm.controls[matchingControlName];
        if (matchingControl.errors && !matchingControl.errors['MustMatch']) {
          return;
        }
        if (control.value != matchingControl.value) {
          this.alert.error.confirmPassword =
            'Password and Confirm password not match';
        } else {
          this.alert.error.confirmPassword = '';
        }
      };
    }
  
    ngOnInit() {
      this.cap();
    }
    validateCredential(form: any) {
      this.alert.error.name = form.controls.name.errors
        ? 'Name is required'
        : '';
      this.alert.error.email = form.controls.email.errors
        ? 'Email is required'
        : '';
      this.alert.error.password = form.controls.password.errors
        ? 'Password is required'
        : '';
      this.alert.error.confirmPassword = form.controls.confirmPassword.errors
        ? 'Confirm-Password is required'
        : '';
      this.alert.error.termsAndConditions = form.controls.termsAndConditions
        .errors
        ? 'Please accept term and condition'
        : '';
  
      if (form.valid) {
        this.message.error = '';
        var str3: any = document.getElementById('pw');
        var str4: any = document.getElementById('repw');
        if (str3.value == str4.value) {
          this.message.error = '';
          var str1: any = document.getElementById('capt');
          var str2: any = document.getElementById('testCapt');
          if (str1.value == str2.value) {
            if (this.registerForm.value.termsAndConditions == true) {
              console.log(this.registerForm.value);
              this.signup.register(form.value).subscribe(
                (res:any) => {
                  console.log(res);
                window.alert('Account registration successfull');
                  this.router.navigate(['/login']);
                },
                (err:any) => {
                  if (err == 400) {
                    console.log(err);
                    this.message.error = 'Register is not complete';
                  } else {
                    console.log(err);
                    this.message.error = 'Server not found';
                  }
                }
              );
            } else {
              this.message.error = '';
              this.message.error = 'Accept all term and condition';
            }
          } else {
            this.message.error = '';
            this.message.error = 'Captcha not valid';
          }
        } else {
          this.message.error = '';
          this.message.error = 'Password and Confirm-password not matching';
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
