const express = require('express');
const app = express();
const sequelize = require('./config/db');
const  sessions = require("express-session")
const cors = require('cors');
const authRouter = require("./src/router/auth")
const testRouter = require("./src/router/testRouter")

const { swaggerUi, swaggerSpec } = require('./src/utils/swagger'); // مسیر درست بده
app.use(express.json())


app.use(cors());
app.use(sessions({
  secret:"sldkflsdfskdjflksjdfk",
  resave:false,
   saveUninitialized:true,
   cookie: { maxAge: 5 * 60 * 1000 }
}))



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use("/tests", testRouter)
app.use("/users", authRouter)




    





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
