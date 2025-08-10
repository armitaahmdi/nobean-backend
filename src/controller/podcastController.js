const express = require("express")
const db = require("./../model/index")
const { Op } = require("sequelize")

const podcast= db.Podcast 


exports.createPodcast = async (req , res ) => {
    try{ 

        const {title ,excerpt_description,description,audioUrl ,image ,guest ,tags ,duration ,} = req.body
        
        const validatTitle = await  podcast.findOne({where:{title:title}})

        if(validatTitle){
            return res.status(401).json({message: " این تایتل برای یک پادکست دیگه ای انتخاب شده "})
        }
        const  result  = await  podcast.findOne({where:{ 
             [Op.and ]:[ 
                 {title:title },
                  {audioUrl:audioUrl}
                ]
                }
            })
        
        if (result) {
            return res.status(403).json({message:" این پادکست قبلا آپلود شده "})
        }
        
        const  add = await podcast.create({title ,excerpt_description,description,audioUrl ,image ,guest ,tags ,duration })
        
        res.status(201).json({message:" پادکست باموفقیت ایجاد شد "  , data: add})
    }catch(error){
         console.error("خطا در ایجاد پادکست:", error);
    return res.status(500).json({ message: "خطا در سرور رخ داد" });
    }


}

exports.getAll = async (req , res ) => {
try{
 const allPodcast = await podcast.findAll({
  
  order: [['createdAt', 'DESC']],
  attributes:["title" , "image" , "audioUrl" ,"guest" ,"tags","publishDate"]
});

if(!allPodcast){
    return res.status(404).json({message:"پیدا نشد پادکستی "})
}

res.status(200).json({message: "پادکست های دریافتی ", podcasts: allPodcast}  )


}catch(error){
    console.error("خطا در دریافت " ,error)
    return res.status(500).json({message: " خطا در سرور"})
}
}

exports.getOne = async (req , res ) => {
try{
    const {id} = req.params
    const findPodcast = await podcast.findByPk(id, {
    attributes: [ "title" ,"excerpt_description","description","audioUrl" ,"image" ,"guest" ,"tags" ,"duration" ,"publishDate"]
    });

    if(!findPodcast){
        return res.status(404).json({message: "این پادکست وجود نداره "})
    }

    res.status(200).json({message: " پادکست پیدا شد "  ,findPodcast })
}catch(error){
    console.error("خطا در دریافت " ,error)
    return res.status(500).json({message: " خطا در سرور"})
}
}

exports.delete = async (req , res ) => {
try{
 const {id} = req.params 

 if (isNaN(id)) {
  return res.status(400).json({ message: "آی‌دی معتبر نیست" });
}


 const findDelete = await podcast.destroy({
    where:{id}
 })

 if(!findDelete){
    return res.status(404).json({message:"این پادکست وجود ندارد "})
 }
 res.status(200).json({message:" با موفقیت پاک شد "  ,deletedCount: findDelete})

}catch(error){
    console.error("پادکست حذف نشد "  ,  error)
    res.status(500).json({message:"سرور ارور خورد "})
}

}

exports.edite = async (req , res ) => {
try{
    const {id}=req.params
    if(isNaN(id)){
        return res.status(400).json({message: "آیدی وارد نشده "})
    }

    const podcastFinded = await podcast.findByPk(id)

 if(!podcastFinded){
    return res.status(404).json({message: "پادکستی با این مشخصات وجود ندارد"})
 }

 await podcastFinded.update(req.body)

 res.status(200).json({message:"پادکست بروز رسانی شد " ,podcast: podcastFinded})

}catch(error){
    console.error("ادیت انجام نشد " , error)
   res.status(500).json({
  message: "خطای سرور",
  error: error.message
});

}
}