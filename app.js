(() => {
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];

  // Scroll reveals
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, {threshold:.12});
  $$(".reveal").forEach(el => observer.observe(el));

  // Days since meeting
  const meeting = new Date("2026-04-13T00:00:00");
  const knownDays = $("#daysKnown");
  if (knownDays) {
    const updateKnown = () => {
      const now = new Date(), diff = Math.max(0, now - meeting);
      $("#daysKnown").textContent = Math.floor(diff / 86400000);
      $("#hoursKnown").textContent = Math.floor(diff / 3600000).toLocaleString("ar-EG");
      $("#minutesKnown").textContent = Math.floor(diff / 60000).toLocaleString("ar-EG");
    };
    updateKnown(); setInterval(updateKnown, 60000);
  }

  // Birthday countdown
  const cd = $("#birthdayCountdown");
  if (cd) {
    const updateCountdown = () => {
      const now = new Date();
      let target = new Date(now.getFullYear(), 9, 5, 0, 0, 0);
      if (target < now && !(now.getMonth() === 9 && now.getDate() === 5)) {
        target = new Date(now.getFullYear()+1, 9, 5, 0, 0, 0);
      }
      let d = target - now;
      if (now.getMonth() === 9 && now.getDate() === 5) d = 0;
      $("#cdDays").textContent = Math.max(0, Math.floor(d/86400000));
      $("#cdHours").textContent = Math.max(0, Math.floor(d/3600000)%24);
      $("#cdMinutes").textContent = Math.max(0, Math.floor(d/60000)%60);
      $("#cdSeconds").textContent = Math.max(0, Math.floor(d/1000)%60);
    };
    updateCountdown(); setInterval(updateCountdown,1000);
  }

  // Music player
  $$(".music-player").forEach(player => {
    const audio = new Audio(player.dataset.audio);
    audio.loop = true;
    const btn = $(".music-btn", player);
    const label = $(".music-copy span", player);
    btn.addEventListener("click", async () => {
      try{
        if (audio.paused) {
          await audio.play();
          player.classList.add("playing");
          btn.textContent = "❚❚";
          label.textContent = "شغالة دلوقتي";
        } else {
          audio.pause();
          player.classList.remove("playing");
          btn.textContent = "▶";
          label.textContent = "اضغطي للتشغيل";
        }
      } catch(e) { label.textContent = "اضغطي مرة تانية"; }
    });
  });

  // Secret hold interaction
  const heart = $("#holdHeart");
  if (heart) {
    let timer = null;
    const start = (e) => {
      e.preventDefault();
      heart.classList.add("holding");
      timer = setTimeout(() => {
        const msg = $("#secretMessage");
        msg.classList.add("open");
        msg.setAttribute("aria-hidden","false");
        heart.classList.remove("holding");
        heart.style.display = "none";
        if (navigator.vibrate) navigator.vibrate([70,40,120]);
      }, 2000);
    };
    const stop = () => { clearTimeout(timer); heart.classList.remove("holding"); };
    ["mousedown","touchstart"].forEach(ev => heart.addEventListener(ev,start,{passive:false}));
    ["mouseup","mouseleave","touchend","touchcancel"].forEach(ev => heart.addEventListener(ev,stop));
  }

  // Sparkles
  const canvas = $("#sparkles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w,h,pts=[];
    function resize(){
      w = canvas.width = innerWidth * devicePixelRatio;
      h = canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = innerWidth+"px"; canvas.style.height = innerHeight+"px";
      pts = Array.from({length: Math.min(55, Math.floor(innerWidth/18))}, () => ({
        x:Math.random()*w,y:Math.random()*h,r:(Math.random()*1.4+.25)*devicePixelRatio,
        a:Math.random()*.45+.08,s:(Math.random()*.18+.04)*devicePixelRatio
      }));
    }
    function draw(){
      ctx.clearRect(0,0,w,h);
      pts.forEach(p => {
        p.y -= p.s; if(p.y < -8){p.y=h+8;p.x=Math.random()*w}
        ctx.beginPath(); ctx.fillStyle=`rgba(255,225,235,${p.a})`;
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    resize(); draw(); addEventListener("resize",resize);
  }

  // IndexedDB photo storage
  const grid = $("#photoGrid");
  if (grid) {
    const DB_NAME = "maloka-memories";
    const STORE = "photos";
    let db;

    const openDB = () => new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE); };
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
    });
    const getPhoto = (key) => new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,"readonly"), req=tx.objectStore(STORE).get(key);
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
    });
    const setPhoto = (key,val) => new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,"readwrite"), req=tx.objectStore(STORE).put(val,key);
      req.onsuccess=()=>resolve(); req.onerror=()=>reject(req.error);
    });
    const delPhoto = (key) => new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,"readwrite"), req=tx.objectStore(STORE).delete(key);
      req.onsuccess=()=>resolve(); req.onerror=()=>reject(req.error);
    });
    const clearPhotos = () => new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,"readwrite"), req=tx.objectStore(STORE).clear();
      req.onsuccess=()=>resolve(); req.onerror=()=>reject(req.error);
    });

    const compressImage = (file) => new Promise((resolve,reject)=>{
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const max = 1600, scale = Math.min(1, max/Math.max(img.width,img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width*scale); c.height = Math.round(img.height*scale);
        c.getContext("2d").drawImage(img,0,0,c.width,c.height);
        c.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob); }, "image/jpeg", .86);
      };
      img.onerror=reject; img.src=url;
    });

    function slotHTML(i){
      return `<div class="photo-slot" data-slot="${i}">
        <label class="empty" for="photo-${i}">
          <span class="num">${String(i).padStart(2,"0")}</span>
          <strong>ضيفي صورة</strong>
          <small>صورة رقم ${i} من 19</small>
        </label>
        <img alt="ذكرى رقم ${i}" hidden>
        <span class="year-badge">YEAR ${String(i).padStart(2,"0")}</span>
        <input id="photo-${i}" type="file" accept="image/*">
        <div class="photo-actions">
          <label for="photo-${i}">تغيير</label>
          <button type="button" class="remove-photo">حذف</button>
        </div>
      </div>`;
    }
    grid.innerHTML = Array.from({length:19},(_,i)=>slotHTML(i+1)).join("");

    const renderSlot = async (i) => {
      const slot = $(`[data-slot="${i}"]`, grid), img = $("img",slot), empty=$(".empty",slot);
      const blob = await getPhoto(i);
      if(blob){
        const url=URL.createObjectURL(blob);
        if(img.dataset.url) URL.revokeObjectURL(img.dataset.url);
        img.dataset.url=url; img.src=url; img.hidden=false; empty.hidden=true; slot.classList.add("has-photo");
      } else {
        if(img.dataset.url) URL.revokeObjectURL(img.dataset.url);
        img.hidden=true; empty.hidden=false; slot.classList.remove("has-photo");
      }
    };
    const updateProgress = async () => {
      let count=0;
      for(let i=1;i<=19;i++) if(await getPhoto(i)) count++;
      $("#uploadedCount").textContent=count;
      $("#photoProgress").style.width=`${(count/19)*100}%`;
    };

    openDB().then(async d=>{
      db=d;
      for(let i=1;i<=19;i++) await renderSlot(i);
      await updateProgress();

      $$("input[type=file]",grid).forEach(input=>{
        input.addEventListener("change", async e=>{
          const file=e.target.files[0]; if(!file) return;
          const i=Number(e.target.closest(".photo-slot").dataset.slot);
          const blob=await compressImage(file);
          await setPhoto(i,blob); await renderSlot(i); await updateProgress();
          e.target.value="";
        });
      });
      $$(".remove-photo",grid).forEach(btn=>{
        btn.addEventListener("click",async()=>{
          const i=Number(btn.closest(".photo-slot").dataset.slot);
          await delPhoto(i); await renderSlot(i); await updateProgress();
        });
      });
      $("#clearAllPhotos").addEventListener("click",async()=>{
        if(confirm("متأكدة إنك عايزة تمسحي الـ19 صورة من الجهاز ده؟")){
          await clearPhotos();
          for(let i=1;i<=19;i++) await renderSlot(i);
          await updateProgress();
        }
      });
    }).catch(()=> {
      $("#uploadedCount").parentElement.innerHTML="<span>المتصفح ده لا يدعم حفظ الصور محليًا.</span>";
    });
  }
})();