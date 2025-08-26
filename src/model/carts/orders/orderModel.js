const { DataTypes } = require("sequelize");
const { sequelize } = require("../..");

module.exports = (sequelize , DataTypes) =>{
    const order = sequelize.define("order" ,{
        id:{
            type:DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement:true
        },
        user_id:{
         type:DataTypes.BIGINT,
         allowNull:false
         
        },
       totalprice:{
      type:DataTypes.FLOAT,
      allowNull:false
    },
status: {
  type: DataTypes.ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'canceled'),
  defaultValue: 'pending'
}
    })
    return order
}