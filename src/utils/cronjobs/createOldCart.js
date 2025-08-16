const cron = require("node-cron");
const db = require("../../model/index"); // مسیر مدل‌هات
const { Op } = require("sequelize");

// هر روز ساعت 3 صبح
cron.schedule("0 3 * * *", async () => {
  try {
    console.log("🧹 در حال پاکسازی Cartهای قدیمی...");

    // cart هایی که بیشتر از 7 روز پیش آپدیت شدن رو حذف کنیم
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    await db.Cart.destroy({
      where: {
        updatedAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    console.log("✅ Cartهای قدیمی با موفقیت حذف شدند");
  } catch (err) {
    console.error("❌ خطا در Cron Job:", err);
  }
});
