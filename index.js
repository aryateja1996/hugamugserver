const firebase = require('./fb/index.js');
const express = require('express');
const cors = require('cors');
const firebaseAuth = firebase.auth();
const firebaseDb = firebase.firestore();
var app = express()

app.use(cors({
  origin: "*",
}))

app.use(express.json())

app.use(express.urlencoded({
    extended: false
}));
const port = require('./port.js')
app.use((req, res, next) => {
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  console.log(res.getHeaders());
  next();
});
app.get('/', (req, res) => {
  res.send('Hello World!')
console.log(Date());
console.log(Date().toLocaleString("en-IN", {timeZone: 'Asia/Kolkata'}));
})
const category = [
  "coffee",
  "tea",
  "maggie",
  "milkshakes",
  "mocktails",
  "thickshakes",
  "icecream",
  "beverages",
];

app.delete('/',async(req,res)=>{
  var countsmain =  await firebaseDb.collection('dashboard').doc('counts').get();
 var counts = countsmain.data()
 for (let i = 0; i < category.length; i++) {
  var key = category[i] + "Orders"
    counts[key] = 0
}
counts['cashPayments'] = 0;
counts['onlinePayments']=0;
counts['totalOrders']=0;
await firebaseDb.collection('dashboard').doc('counts').set(counts)
res.send("Deleted")
})
//List Here
app.get('/menu/:type?', async (req, res) => {

 if (req.params.type == null) {
  var menu = []
  var data = await firebaseDb.collection("menu").get().then(
    querySnapshot => {
      querySnapshot.docs.map(doc => {
        menu.push(doc.id)
      })}
      
  )
  res.send({"category":menu})
 } else {
  try {
    var type = req.params.type.toLowerCase(); 
    console.log(type); // Corrected the method call
    var data = await firebaseDb.collection("menu").doc(type).get();
    
    if (!data.exists) {
      return res.status(404).send({ message: "Menu not found for the specified type." });
    }

    res.send({
      "data":  data.data()
      
    });
  } catch (error) {
    console.error("Error fetching menu data:", error);
    res.status(500).send("Internal Server Error");
  }
 }
});
const name = 'mug'
app.post('/login',async(req,res)=>{
var data = {
  "email":req.body['email'],
  "password":req.body['password']
}
var listOfUsers = await firebaseAuth.listUsers()
contains= false;
user = listOfUsers['users']
for(var i = 0 ; i< user.length;i++){
  if (user[i]['email'] == data['email']) {
    contains = true;
  }
}
if (contains) {
  var trail = await firebaseAuth.getUserByEmail(data['email'])

var user = await firebaseDb.collection('users').doc(trail['uid']).get()
if (user.data()['pass'] == req.body['password']) {
  console.log("here");
  res.status(200).send({
    'name':user.data()['name'],
    "phone":user.data()['phone'],
    "isAdmin":user.data()['isAdmin'],
    "type":user.data()['type'],
    "uid":trail['uid'],
  })
} else {
  console.log("here");
  res.status(400).send({
    "error":"Invalid PassWord"
  })
}

} else {
  res.status(400).send({
    "error":"Invalid Email"
  })
}
})
app.post('/order',async(req,res)=>{
 
  const date = new Date()
 var finalDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
 var dateToday = `${date.toDateString()}`
  var data = {}
  data = {
    "date": finalDate,
    "price": parseInt(req.body["price"]),
    "quantity":parseInt(req.body['quantity']),
    "category": req.body["category"],
    "itemName": req.body["itemName"],
    "paymentMode":req.body["paymentMode"]
  }
 var countsmain =  await firebaseDb.collection('dashboard').doc('counts').get();
 var counts = countsmain.data()
if(data["paymentMode"] != null){
  if(data["paymentMode"].toLowerCase() === 'cash'){
    counts['cashPayments'] = counts["cashPayments"] + data["price"]
   }else if(data["paymentMode"].toLowerCase() === 'online'){
    counts['onlinePayments'] = counts["onlinePayments"] + data["price"]
   }
}
for (let i = 0; i < category.length; i++) {
  var key = category[i] + "Orders"
  if (data["category"].toLowerCase() == category[i]) {
    counts[key] = counts[key]+data['quantity']
  }
}
var orders = []
await firebaseDb.collection('order').doc(dateToday.toLocaleUpperCase()).collection('todayOrders').get()
    .then(querySnapshot => {
        querySnapshot.docs.map(doc => {
            // console.log('LOG 1', doc.data());
            orders.push(doc.data())
            // console.log("Oredrs", orders);
            return doc.data();
        });
    });
// console.log(orders , "Orders Length")
var docId = orders.length + 1
// console.log(docId, "Document Id ::")
// Order Collection Population
  await firebaseDb.collection('order').doc(dateToday.toLocaleUpperCase()).collection('todayOrders').doc(docId.toString()).set(data).then(async()=>{
    
// console.log(docId, "Document Id :: Inside")
    counts['totalOrders'] = counts["totalOrders"] + 1;
    //Dashboard counts Population
    await firebaseDb.collection('dashboard').doc('counts').set(counts)
    res.send({
      "message":"Added Data"
    })
  })
})

app.post('/orderList',async(req,res)=>{
  var filter = req.body['date'];
var orders = []
   await firebaseDb.collection('order').doc(filter).collection('todayOrders').get().then(querySnapshot => {
    querySnapshot.docs.map(doc => {
        orders.push(doc.data())
        return doc.data();
    });})
    res.send({"orders":orders})
})
app.get('/counts',async(req,res)=>{
  var countsmain =  await firebaseDb.collection('dashboard').doc('counts').get();
  var counts = countsmain.data()
  res.send({counts})
})



// Function to check if the date has changed
async function  checkDateChange (previouDate) {
  const currentDate = new Date();

  if (currentDate.toDateString() !== previousDate.toDateString()) {
    previousDate = currentDate;
    var countsmain =  await firebaseDb.collection('dashboard').doc('counts').get();
  var counts = countsmain.data()
    await firebaseDb.collection('report').doc(previouDate.toDateString()).set(counts)
    for (let i = 0; i < category.length; i++) {
      var key = category[i] + "Orders"
        counts[key] = 0
    }
    counts['cashPayments'] = 0;
    counts['onlinePayments']=0;
    counts['totalOrders']=0;
    await firebaseDb.collection('dashboard').doc('counts').set(counts)
  }

  // Update the previous date for the next check
 
}

// Initial setup
let previousDate = new Date();

// Check for date change every second (adjust the interval as needed)
setInterval(() => {
  checkDateChange(previousDate);
}, 1000);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})