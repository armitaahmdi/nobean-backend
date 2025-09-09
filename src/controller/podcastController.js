
const db = require("./../model/index")
const { Op } = require("sequelize")

const podcast= db.Podcast 
const User = db.User


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

if (allPodcast.length === 0){
    return res.status(404).json({message:"پیدا نشد پادکستی "})
}

res.status(200).json({message: "پادکست های دریافتی ", podcasts: allPodcast}  )


}catch(error){
    console.error("خطا در دریافت " ,error)
    return res.status(500).json({message: " خطا در سرور"})
}
}
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    // پیدا کردن پادکست
    const findPodcast = await podcast.findByPk(id, {
      attributes: [
        "title",
        "excerpt_description",
        "description",
        "audioUrl",
        "image",
        "guest",
        "tags",
        "duration",
        "publishDate",
      ],
    });

    if (!findPodcast) {
      return res.status(404).json({ message: "این پادکست وجود ندارد" });
    }

    // گرفتن کامنت‌ها و ریپلای‌ها
    const comments = await Comment.findAll({
      where: {
        section_type: "podcast",
        section_id: id,
        parent_comment_id: null, // فقط کامنت‌های اصلی
      },
      include: [
        {
          model: User,
          attributes: ["id", "username"],
        },
        {
          model: Comment, // ریپلای‌ها
          as: "Replies",
          include: [
            {
              model: User,
              attributes: ["id", "username"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const result = {
      ...findPodcast.toJSON(),
      comments,
    };

    res.status(200).json({ message: "پادکست پیدا شد", podcast: result });
  } catch (error) {
    console.error("خطا در دریافت پادکست", error);
    return res.status(500).json({ message: "خطا در سرور" });
  }
};


exports.delete = async (req , res ) => {
try{
 const {id} = req.params 

if (!id || !Number.isInteger(+id)) 
{
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
exports.edit = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, image, audioUrl, guest, tags, publishDate } = req.body;

    // اعتبارسنجی ID
    if (!id || !Number.isInteger(+id)) {
      return res.status(400).json({ message: "آیدی وارد نشده" });
    }

    const podcastFinded = await podcast.findByPk(id);
    if (!podcastFinded) {
      return res.status(404).json({ message: "پادکستی با این مشخصات وجود ندارد" });
    }

    // اگر guest و tags رشته هستند، به آرایه تبدیل کن
    if (guest && !Array.isArray(guest)) guest = JSON.parse(guest);
    if (tags && !Array.isArray(tags)) tags = JSON.parse(tags);

    // آپدیت
    await podcastFinded.update({ title, image, audioUrl, guest, tags, publishDate });

    res.status(200).json({ message: "پادکست بروز رسانی شد", podcast: podcastFinded });

  } catch (error) {
    console.error("ادیت انجام نشد", error);
    res.status(500).json({
      message: "خطای سرور",
      error: error.message
    });
  }
};
