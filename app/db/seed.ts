// app/db/seed.ts
import bcrypt from 'bcryptjs';
import { db } from './index';
import {  users } from './schema';
import { slides } from './schema/slides';
import { serviceCategories } from './schema/serviceCategories';

async function main() {
  console.log('🚀 Starting database seeding...');

  async function seedEssentialData_adminUser() {
    try {
       const hashedPass= await bcrypt.hash("Mh@123456",10);

      // نقش‌های ضروری
      const result = await db.insert(users).values([
        { 
           user_name: 'admin', password:hashedPass , role: "admin",     name:"محمود", family:"هنرمند", avatar:"default", is_active:true,
           mobile_number:"09153754329", mobile_number_isvalid:true, email:"a@a.com",email_isvalid:true,
          },
          {
            user_name:"mahmood", password:hashedPass,role:"user",     name:"منوت",family:"",avatar:"default",is_active:true ,
            mobile_number:"09153754329" , mobile_number_isvalid:true , email:"a@a.com", email_isvalid:true , 
            news_agency_active:true , news_agency_pin:hashedPass , store_active:true,store_pin:hashedPass , serviceman_active:true,serviceman_pin:hashedPass
          }
      ]).onConflictDoNothing({target: users.user_name }); // برگردونه رکورد درج شده رو
      
      console.log('✅ Data inserted:', result);
      return result;
    } catch (error) {
      console.error('❌ Error inserting data:', error);
      throw error; // خطا رو به بالا بفرست
    }
  }



  async function seedData_slides() {
    try {
      // slides  
      const result = await db.insert(slides).values([
        { name: 'S1', image_L:'S1_L.jpg', image_P:"S1_P.jpg",
          show_startDate:new Date() ,show_endDate:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ,
         order:0, isActive:true },
       { name: 'S2', image_L:'S2_L.jpg', image_P:"S2_P.jpg",
          show_startDate:new Date() ,show_endDate:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ,
          order:2,isActive:true },
        { name: 'S3', image_L:'S3_L.jpg', image_P:"S3_P.jpg",
          show_startDate:new Date() ,show_endDate:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ,
         order:1, isActive:false },
      ]).onConflictDoNothing({target: slides.name}); // برگردونه رکورد درج شده رو
      
      console.log('✅ Data inserted:', result);
      return result;
    } catch (error) {
      console.error('❌ Error inserting data:', error);
      throw error; // خطا رو به بالا بفرست
    }
  }






  async function seedData_serviceCategories() {
    try {
      // دسته بندی های بخش خدمات (بانک مشاغل)
      const result = await db.insert(serviceCategories).values([
        { name: 'تاسیسات ساختمان' },
        { name: 'ساختمان و بازسازی' },
        { name: 'تعمیرات لوازم خانگی' },
        { name: 'حمل و نقل و باربری' },
        { name: 'نرم‌افزار و IT' },
        { name: 'آموزش و تدریس' },
        { name: 'سلامت و درمان' },
        { name: 'زیبایی و آرایشگری' },
        { name: 'حقوقی و مشاوره' },
        { name: 'تبلیغات و بازاریابی' },
        { name: 'نظافت و قالیشویی' },
        { name: 'فروش عمده' },
      ]).onConflictDoNothing({ target: serviceCategories.name });

      console.log('✅ Service categories inserted:', result);
      return result;
    } catch (error) {
      console.error('❌ Error inserting service categories:', error);
      throw error;
    }
  }


  try {
    await seedEssentialData_adminUser(); // مهم: صبر کن تا کامل بشه
    await  seedData_slides();
    await seedData_serviceCategories();
    console.log('🎉seed data successfully !');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

main();