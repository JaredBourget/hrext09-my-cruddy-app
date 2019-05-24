/*

 ### Basic Reqs
- [ ] Where to store data? (localstorage)
- [ ] How to caputure data? (web form)
- [ ] How to modify data? (update action, delete action)
- [ ] How to view data? (style?)
- [ ] UI/UX considerations (how are we going to use this)

*/

//localStorage interaction function
//get item
const myCart = {
  key: '',
  contents: [],
  init(){
      
      let _contents = localStorage.getItem(myCart.key);
      if(_contents){
          myCart.contents = JSON.parse(_contents);
      }else{
          
          myCart.contents = [];
          myCart.sync();
      }
  },
  async sync(){
      let _cart = JSON.stringify(myCart.contents);
      await localStorage.setItem(myCart.key, _cart);
  },
  find(id){
     //looks to see if item is in cart by id
      let match = myCart.contents.filter(item=>{
          if(item.id == id)
              return true;
      });
      if(match && match[0])
          return match[0];
  },
  add(id){
     

      if(myCart.find(id)){
          myCart.increase(id, 1);
      }else{
          let arr = rentals.filter(product=>{
              if(product.id == id){
                  return true;
              }
          });
          if(arr && arr[0]){
              let obj = {
                  id: arr[0].id,
                  title: arr[0].title,
                  qty: 1,
                  itemPrice: arr[0].price
              };
              myCart.contents.push(obj);
              

              myCart.sync();
          }
      }
  },
  increase(id, qty=1){
      
      myCart.contents = myCart.contents.map(item=>{
          if(item.id === id)
              item.qty = item.qty + qty;
          return item;
      });
    
      myCart.sync()
  },
  reduce(id, qty=1){
     
      myCart.contents = myCart.contents.map(item=>{
          if(item.id === id)
              item.qty = item.qty - qty;
          return item;
      });
      myCart.contents.forEach(async item=>{
          if(item.id === id && item.qty === 0)
              await myCart.remove(id);
      });
      //update localStorage
      myCart.sync()
  },
  remove(id){
      
      myCart.contents = myCart.contents.filter(item=>{
          if(item.id !== id)
              return true;
      });
      
      myCart.sync()
  },

  empty(){

      myCart.contents = [];
      
      myCart.sync()
  },
  sort(field='title'){
      
      let sorted = myCart.contents.sort( (a, b)=>{
          if(a[field] > b[field]){
              return 1;
          }else if(a[field] < a[field]){
              return -1;
          }else{
              return 0;
          }
      });
      return sorted;
      
  },
  logContents(prefix){
      console.log(prefix, myCart.contents)
  }
};

let rentals = [];

$(document).ready(function() {

  
  getProducts( showProducts, errorMessage );
  
  myCart.init();
  
  showCart();
  
});

function emptyCart() {
  window.localStorage.clear();
  myCart.sync();
};


function showCart(){
  let cartSection = document.getElementById('cart');
  cart.innerHTML = '';
  let sorted = myCart.sort('qty');
  sorted.forEach( item =>{
      let cartitem = document.createElement('div');
      cartitem.className = 'cart-item';
      
      let title = document.createElement('h3');
      title.textContent = item.title;
      title.className = 'title'
      cartitem.appendChild(title);
      
      let controls = document.createElement('div');
      controls.className = 'controls';
      cartitem.appendChild(controls);
      
      let plus = document.createElement('span');
      plus.textContent = '+';
      plus.setAttribute('data-id', item.id)
      controls.appendChild(plus);
      plus.addEventListener('click', incrementCart)
      
      let qty = document.createElement('span');
      qty.textContent = item.qty;
      controls.appendChild(qty);
      
      let minus = document.createElement('span');
      minus.textContent = '-';
      minus.setAttribute('data-id', item.id)
      controls.appendChild(minus);
      minus.addEventListener('click', decrementCart)
      
      let price = document.createElement('div');
      price.className = 'price';
      let cost = new Intl.NumberFormat('en-CA', 
                      {style: 'currency', currency:'CAD'}).format(item.qty * item.itemPrice);
      price.textContent = cost;
      cartitem.appendChild(price);
      
      cartSection.appendChild(cartitem);
  })
}

function incrementCart(event){
  event.preventDefault();
  let id = parseInt(event.target.getAttribute('data-id'));
  myCart.increase(id, 1);
  let controls = event.target.parentElement;
  let qty = controls.querySelector('span:nth-child(2)');
  let item = myCart.find(id);
  if(item){
      qty.textContent = item.qty;
  }else{
      document.getElementById('cart').removeChild(controls.parentElement);
  }
}

function decrementCart(event){
  event.preventDefault();
  let id = parseInt(event.target.getAttribute('data-id'));
  myCart.reduce(id, 1);
  let controls = event.target.parentElement;
  let qty = controls.querySelector('span:nth-child(2)');
  let item = myCart.find(id);
  if(item){
      qty.textContent = item.qty;
  }else{
      document.getElementById('cart').removeChild(controls.parentElement);
  }
}

function getProducts(success, failure){
  //request the list of products from the "server"
  const URL = "https://raw.githubusercontent.com/JaredBourget/hrext09-my-cruddy-app/master/app/rentals.json";
  fetch(URL, {
      method: 'GET',
      mode: 'cors'
  })
  .then(response=>response.json())
  .then(showProducts)
}

function showProducts( products ){
  rentals = products;
  
  let productSection = document.getElementById('products');
  productSection.innerHTML = "";
  
  products.forEach(product=>{
      let card = document.createElement('div');
      card.className = 'card';
      
      let img = document.createElement('img');
      img.alt = product.title;
      img.src = product.img;
      card.appendChild(img);
      
      
      let title = document.createElement('h2');
      title.textContent = product.title;
      card.appendChild(title);
      
      let desc = document.createElement('p');
      desc.textContent = product.desc;
      card.appendChild(desc);
       //add the price
       let price = document.createElement('p');
       let cost = new Intl.NumberFormat('en-CA', 
                               {style:'currency', currency:'CAD'}).format(product.price);
       price.textContent = cost;
       price.className = 'price';
       card.appendChild(price);
      //add the button to the card
      let btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Add Item';
      btn.setAttribute('data-id', product.id);
      btn.addEventListener('click', addItem);
      card.appendChild(btn);
      
      productSection.appendChild(card);
  })
}

function addItem(event){
  event.preventDefault();
  let id = parseInt(event.target.getAttribute('data-id'));
  console.log('add to cart item', id);
  myCart.add(id, 1);
  showCart();
}

function errorMessage(err){
  
  console.error(err);
}
