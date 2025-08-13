const express = require('express');
const app = express();
const sequelize = require('./config/db');
const  sessions = require("express-session")
const cors = require('cors');
const helmet = require("helmet")
require('dotenv').config();


const authRouter = require("./src/router/auth")
const testRouter = require("./src/router/testRouter")
const productRouter = require("./src/router/productRouter")
const  podcastRouter  = require("./src/router/podcastRouter")
const { swaggerUi, swaggerSpec } = require('./src/utils/swagger'); // مسیر درست بده


app.use(express.json())
app.use(helmet());
app.use(cors());


const corsOptions = {
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // مثلا Postman یا curl
    if(origin === 'https://36b57023baaf.ngrok-free.app  ' || origin === 'http://localhost:8888'){
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}


app.use(sessions({
  secret:"sldkflsdfskdjflksjdfk",
  resave:false,
   saveUninitialized:true,
   cookie: { maxAge: 5 * 60 * 1000 }
}))



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1/tests", testRouter)
app.use("/api/v1/users", authRouter)
app.use("/api/v1/podcasts" , podcastRouter)
app.use("./api/v1/products" , productRouter)



sequelize.authenticate()
   .then(() => {
    console.log( ' connection success');
      return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('table compared');
  })
  .catch(err => console.error('   problem in connect to data base ', err));

app.listen(8888, () => {
  console.log('connect to port 8888');
})
