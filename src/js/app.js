//const { firebrick } = require('color-name');    - skąd sie to wzięło :) ?????
import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);

        /* save parsedResponse as ThisApp.data.products*/
        thisApp.data.products = parsedResponse;
        /*execute initMenu method */

        thisApp.initMenu();
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initMenu: function () {
    const thisApp = this;
    console.log('thisApp.data:', thisApp.data);

    for (let productData in thisApp.data.products) {
      // new Product(productData, thisApp.data.products[productData]);// zmienine przy tworzeniuu api
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
  },

  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    //thisApp.initMenu(); - wywoływana w funkcji parsedResponse
    thisApp.initCart();
  },
};

app.init();

/*Ćwiczenie
Spróbuj wprowadzić ten sam pomysł w klasie Product. Tak, 
żeby wszystkie referencje do elementów DOM były "schowane" w 
dodatkowym obiekcie thisProduct.dom. (9.3) */

/* (302)  prepareCartProductParams
 params[paramId] = {
          label: param.label,
          options: {},
        };
czemuu params[x] ??? -> objekty[objekt x ??]
*/

//!!!!!!!!!!!!!!!!!!!!
/* event - customEvent - dispatchEvent(jak działa?)- (400); potem uwamy addeventlistenner(event - czy to ten nasz customowy?)*/
