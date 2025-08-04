const express = require('express');
const app = express();
const sequelize = require('./config/db');
const  sessions = require("express-session")
const cors = require('cors');
const helmet = require("helmet")
const authRouter = require("./src/router/auth")
const testRouter = require("./src/router/testRouter")
require('dotenv').config();
const { swaggerUi, swaggerSpec } = require('./src/utils/swagger'); // مسیر درست بده
app.use(express.json())
app.use(helmet());

const corsOptions = {
  origin: 'https://be77517b64ae.ngrok-free.app', // همه دامنه‌ها مجاز
  methods: ['GET', 'POST', 'PATCH', 'DELETE'  , 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));



//app.options('*', cors(corsOptions));

app.use(sessions({
  secret:"sldkflsdfskdjflksjdfk",
  resave:false,
   saveUninitialized:true,
   cookie: { maxAge: 5 * 60 * 1000 }
}))



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use("/api/v1/tests", testRouter)
app.use("/api/v1/users", authRouter)



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
});
