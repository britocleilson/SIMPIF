import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';
import { randomItem, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Define opções de carga
export let options = {
  vus: 10,
  duration: '1m',
};

const products = [
  "0PUK6V6EV0",
  "1YMWWN1N4O",
  "2ZYFJ3GM2N",
  "66VCHSJNUP",
  "6E92ZMYYFZ",
  "9SIQT8TOJO",
  "L9ECAV7KIM",
  "LS4PSXUNUM",
  "OLJCESPC7Z"
];

const currencies = ["EUR", "USD", "JPY", "GBP", "TRY", "CAD"];

function browseProduct() {
  let product = randomItem(products);
  http.get(`/product/${product}`);
}

function changeCurrency() {
  let payload = JSON.stringify({ currency_code: randomItem(currencies) });
  let headers = { 'Content-Type': 'application/json' };
  http.post('/setCurrency', payload, { headers });
}

function addToCart() {
  let product = randomItem(products);
  http.get(`/product/${product}`);
  let payload = JSON.stringify({
    product_id: product,
    quantity: randomIntBetween(1, 3)
  });
  let headers = { 'Content-Type': 'application/json' };
  http.post('/cart', payload, { headers });
}

function viewCart() {
  http.get('/cart');
}

function checkout() {
  addToCart();

  let headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'http://localhost:8080/cart'
  };

  let formData = {
    email: 'someone@example.com',
    street_address: '1600 Amphitheatre Parkway',
    zip_code: '94043',
    city: 'Mountain View',
    state: 'CA',
    country: 'United States',
    credit_card_number: '4432801561520454',
    credit_card_expiration_month: '1',
    credit_card_expiration_year: '2026',
    credit_card_cvv: '672'
  };

  let encodedData = Object.entries(formData)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  let res = http.post('/cart/checkout', encodedData, { headers });

  check(res, {
    'checkout não retornou 422': (r) => r.status !== 422,
  });
}

function refreshFrontend() {
  http.get('/');
}

export default function () {
  let chance = Math.random();

  // Simula pesos parecidos com @task(x)
  if (chance < 0.5) {  // 10/20
    browseProduct();
  } else if (chance < 0.6) {  // +2/20
    changeCurrency();
  } else if (chance < 0.7) {  // +2/20
    addToCart();
  } else if (chance < 0.9) {  // +4/20
    viewCart();
  } else if (chance < 0.95) {  // +1/20
    checkout();
  } else {  // +1/20
    refreshFrontend();
  }

  sleep(randomIntBetween(1, 10));
}
