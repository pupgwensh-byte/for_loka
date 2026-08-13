MALOKA — 20TH BIRTHDAY WEBSITE
================================

تاريخ التعارف: 13/04/2026
تاريخ ميلاد ملوكا: 10/05/2007
عيد الميلاد العشرين: 10/05/2027

الملفات:
- index.html         الصفحة الأساسية + الرسالة السرية
- birthday.html      عيد الميلاد العشرين + 20 صورة
- styles.css
- app.js
- main-song.mp3      أغنية الصفحة الأساسية
- birthday-song.mp3  أغنية عيد الميلاد
- assets/photos/     الصور العشرين

رفع GitHub Pages:
ارفع محتويات هذا المجلد كما هي في جذر الـ Repository.
لا ترفع ملف ZIP نفسه فقط.
بعدها Settings > Pages > Deploy from a branch > main / root.

الصور مدمجة داخل الموقع، لذلك ستظهر على أي جهاز يفتح رابط GitHub Pages.


FIXED IMAGE VERSION
===================
- The 20 birthday photos are embedded directly inside birthday.html as Base64.
- This prevents broken image paths on GitHub Pages.
- assets/photos is retained only as a backup.
- Upload all root files normally. Even if the assets folder is missed, the gallery images inside birthday.html still render.
