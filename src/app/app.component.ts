import { Component } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public iab: InAppBrowser
  ) {
    this.initializeApp();
    this.login();
  }
  login() {
    this.splashScreen.show();
    const url = 'https://login.microsoftonline.com/common/oauth2/authorize?client_id='

    + '68cce58f-20a7-4340-8850-c6691d9d45a7' + // here need to paste your client id

    '&response_type=code&redirect_uri='

    + encodeURIComponent('urn:ietf:wg:oauth:2.0:oob') + // here encoding redirect url using default function

    '&response_mode=query&resource='

    + encodeURIComponent('https://vrish.sharepoint.com') + // here encoding resource url using default function

    `&state=12345`;
    const browser = this.iab.create(url, '_blank', {
      location: 'no',
      zoom: 'no',
      hardwareback: 'no',
      clearcache: 'yes'
    });
    browser.on('loadstart').subscribe((event) => {

      this.splashScreen.show();

    });

    browser.on('loadstop').subscribe((event) => {

      this.splashScreen.hide();

      browser.show();

    });
    browser.on('loaderror').subscribe((event) => {
      // here we have split our requiring part one.
      const sd = 'AuthResult';
      const result = event.url.split('code=');
      console.log('Authentication result', result);
      // here we have split our requiring part two.
      window[sd] = result[1].split('&')[0];
      // Authentication Code stored in local for future purpose.
      // It means get access token and refresh token for sharepoint.
      localStorage.setItem('AuthCode', window[sd]);
      browser.close();
    });
    browser.on('exit').subscribe(
      (event) => {
        // Below line for checking if closing event
        const App = 'App';
        if (event) {
          if (event.type.toLowerCase() === 'exit') {
            if (localStorage.getItem('AuthCode') && localStorage.getItem('AuthCode') === 'cancel') {
              // this.platform.exitApp();
              navigator[App].exitApp();  // This line is used for close a app. In case not logged in.
              event.preventDefault();
              return true;
            }
          }
        }
      },
      (err) => {
        console.log('InAppBrowser Loadstop Event Error: ' + err);
      });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
