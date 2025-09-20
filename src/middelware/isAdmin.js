//     const express = require("express")
//     const authMiddelware = require("./authMiddelware")
// const db = require("./../model/index")

// const User = db.User
//     const  isAdmin = async (req , res , next) => {
//         try{  

//             const user = req.user 

//             const checkUserAdmin = await  User.findOne({phone:user.phone})

//             if(!checkUserAdmin){
//                 return res.status(404).json({message:"user not faund" })
//             }
//             if(checkUserAdmin.role !== "admin" ){
//                 console.log(checkUserAdmin.role );

//                 return res.status(401).json({message:"شما اجازه  ندارید "})
//             }

//             next()
//         }catch(error){
//             console.error(error);
//          res.status(500).json({message:"backEnd crash in check Admin access", error: error.message})

//         }
//     }

//     module.exports = isAdmin

const isAdmin = (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "کاربر احراز هویت نشده" });
        }

         // Special case: phone number 09198718211 is always admin
        if (user.phone === '09198718211') {
            console.log('Special admin access granted for phone:', user.phone);
            return next();
        }

        if (user.role !== "admin" && user.role !== "superadmin") {
            console.log("User role:", user.role);
            return res.status(401).json({ message: "شما اجازه ندارید" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "خطا در بررسی دسترسی ادمین", error: error.message });
    }
};

module.exports = isAdmin;