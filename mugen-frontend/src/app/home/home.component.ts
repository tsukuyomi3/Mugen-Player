import { Component, OnInit } from '@angular/core';
import { MugenDataHandlerService } from 'src/services/mugen-data-handler.service';
import { RestApiService } from 'src/services/rest-api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router'


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  title = 'Mugen';
  validUser: boolean = false;
  constructor(public dataHandlerService: MugenDataHandlerService, private rest_service: RestApiService, private router: Router) { }
  loginform: FormGroup;
  signUpform: FormGroup;
  isLoginForm: boolean = true;
  isSignUpForm: boolean = false;
  loginError : boolean = false;
  usernameExists: boolean = false;
  emailExists: boolean = false;
  errorMsg: string = "";

  ngOnInit() {
    if(localStorage.getItem("isloginPage")){
      this.dataHandlerService.$isloginPage = JSON.parse(localStorage.getItem("isloginPage"));
    }
    this.loginform = new FormGroup({
      'username': new FormControl('', Validators.required),
      'password': new FormControl('', Validators.required)
    });
    this.signUpform = new FormGroup({
      'username': new FormControl('', Validators.required),
      'email': new FormControl('', Validators.required),
      'password': new FormControl('', Validators.required)
    });
  }

  showSignUpForm() {
    this.isLoginForm = !this.isLoginForm;
    this.isSignUpForm = !this.isSignUpForm;
  }

  showLoginForm() {
    this.isLoginForm = !this.isLoginForm;
    this.isSignUpForm = !this.isSignUpForm;
  }

  validateUser() {
    let username = this.loginform.value.username;
    let password = this.loginform.value.password;
    let q = {
      "username": username,
      "password": password
    }
    this.rest_service.loginUser(q, (res) => {
      if (res == "SUCCESS") {
        this.loginError = false;
        this.dataHandlerService.$activeUser = username;
        this.dataHandlerService.$isloginPage = false;
        this.router.navigate(['/home/album']);
      }
      else {
        this.errorMsg = "Invalid username and/or password ";
        this.loginError = true;
      }
    });
  }


  addUser() {
    let username = this.signUpform.value.username;
    let email = this.signUpform.value.email;
    let password = this.signUpform.value.password;
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    this.rest_service.addUser(formData, (res) => {
      if (res == "error") {
        console.error(res);
      }
      else if (res == "USER_ALREADY_EXIST") {
        this.errorMsg = "username already exist! Please try another";
        this.usernameExists = true;
      }
      else if (res == "EMAIL_ALREADY_EXIST") {
        this.usernameExists = false;
        this.errorMsg = "email already exist";
        this.emailExists = true;
      }
      else {
        this.dataHandlerService.$activeUser = username;
        this.dataHandlerService.$isloginPage = false;
        this.usernameExists = false;
        this.emailExists = false;
        this.router.navigate(['/home/album']);
      }
    });
  }

}
