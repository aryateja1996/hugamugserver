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
const port = 80
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
  console.log("hello");
  res.send('Hello World!')
})
const category = [
  "coffee",
  "maggie",
  "milkshakes",
  "mocktails",
  "thickshakes"
];
//List Here
app.get('/menu/:type', async (req, res) => {
  console.log("menu");
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
});

app.post('/order',async(req,res)=>{
  reqBody = req.body;
  console.log(req.body);
  const date = new Date()
 var finalDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  var data = {}
  data = {
    "date": finalDate,
    "price": parseInt(req.body["price"]),
    "category": req.body["category"],
    "itemName": req.body["itemName"],
    "paymentMode":req.body["paymentMode"]
  }
  console.log(data);
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
    counts[key] = counts[key]+1
  }
}
// Order Collection Population
  await firebaseDb.collection('order').doc().set(data).then(async()=>{
    
    counts['totalOrders'] = counts["totalOrders"] + 1;
    //Dashboard counts Population
    await firebaseDb.collection('dashboard').doc('counts').set(counts)
    res.send({
      "message":"Added Data"
    })
  })
})
app.get('/counts',async(req,res)=>{
  console.log("counts");
  var countsmain =  await firebaseDb.collection('dashboard').doc('counts').get();
  var counts = countsmain.data()
  res.send({counts})
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})