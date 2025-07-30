    const express = require("express")
    const authMiddelware = require("./authMiddelware")
const db = require("./../model/index")

const User = db.User
    const  isAdmin = async (req , res , next) => {
        try{  

            const user = req.user 
            
            const checkUserAdmin = await  User.findOne({phone:user.phone})

            if(!checkUserAdmin){
                return res.status(404).json({message:"user not faund" })
            }
            if(checkUserAdmin.role !== "admin" ){
                return res.status(401).json({message:"شما اجازه ورود ندارید "})
            }

            next()
        }catch(error){
            console.error(error);
         res.status(500).json({message:"backEnd crash in check Admin access", error: error.message})

        }
    }

    module.exports = isAdmin