import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthReponse, Usuario } from '../interfaces/interfaces';
import {of} from 'rxjs';
import {map,catchError,tap} from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _usuario?: Usuario;
  private baseUrl: string=environment.baseUrl;


  get usuario(){
    return {...this._usuario};
  }

  constructor(private http: HttpClient) { }

  registro(name: string, email: string, password: string){
    const url = `${this.baseUrl}/auth/new`
    const body={
      email,password,name
    }
    return this.http.post<AuthReponse>(url,body)
      .pipe(
        tap(({ok,token})=>{
          if(ok){
            localStorage.setItem('token',token!);
            
          }
        }),
        map(resp=>resp.ok),
        catchError( err => of(err.error.msg))
      )
  }


  login(email: string, password: string){
    const url = `${this.baseUrl}/auth/`
    const body={
      email,password
    }
    return this.http.post<AuthReponse>(url,body)
      .pipe(
        tap(resp=>{
          if(resp.ok){
            localStorage.setItem('token',resp.token!);
          }
        }),
        map(resp=>resp.ok),
        catchError( err => of(err.error.msg))
      )
  }

  validarToken(){
    const url = `${this.baseUrl}/auth/renew`;
    const headers = new HttpHeaders()
      .set('x-token',localStorage.getItem('token')||'');
    return this.http.get<AuthReponse>(url,{headers})
      .pipe(
        map(({ok,name,email,uid,token})=>{
          localStorage.setItem('token',token!);
          this._usuario={
            name: name!,
            uid: uid!,
            email: email!
          }
          return ok;
        }),
        catchError(err=>of(false))
      );
  }

  logout(){
    localStorage.clear();
  }
}
