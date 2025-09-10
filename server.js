require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('./config/db');
const  sessions = require("express-session")
const cors = require('cors');
const helmet = require("helmet")
require("./src/utils/cronjobs/createOldCart");

app.get('/' , (req , res ) => {
  res.send( "api is running")
})

const authRouter = require("./src/router/auth")
const testRouter = require("./src/router/testRouter")
const productRouter = require("./src/router/productRouter")
const  podcastRouter  = require("./src/router/podcastRouter")
const cartRouter= require("./src/router/cartRouter")
const commentRouter = require("./src/router/commentRouter")
const categoryRouter = require("./src/router/categoryRouter")
const { swaggerUi, swaggerSpec } = require('./src/utils/swagger'); // مسیر درست بده


app.use(express.json())
app.use(helmet());

const corsOptions = {
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // مثلا Postman یا curl
     const allowedOrigins = [
      'https://36b57023baaf.ngrok-free.app',
      'http://localhost:8888',
      'http://localhost:5173',
      'https://nobean.ir',
      'https://www.nobean.ir',
      'https://api.nobean.ir'
    ];
    
    if(allowedOrigins.includes(origin)){
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requestd-With'],
  credentials: true
}

app.use(cors(corsOptions));

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
app.use("/api/v1/products" , productRouter)
app.use("/api/v1/carts", cartRouter)
app.use("/api/v1/comments" , commentRouter)
app.use("/api/v1/categories", categoryRouter)

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
