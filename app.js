(() => {
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, {threshold:.10});
  $$(".reveal").forEach(el => observer.observe(el));

  const meeting = new Date("2026-04-13T00:00:00");
  if ($("#daysKnown")) {
    const updateKnown = () => {
      const diff = Math.max(0, new Date() - meeting);
      $("#daysKnown").textContent = Math.floor(diff / 86400000);
      $("#hoursKnown").textContent = Math.floor(diff / 3600000).toLocaleString("ar-EG");
      $("#minutesKnown").textContent = Math.floor(diff / 60000).toLocaleString("ar-EG");
    };
    updateKnown(); setInterval(updateKnown, 60000);
  }

  const countdown = $("#birthdayCountdown");
  if (countdown) {
    const target = new Date(countdown.dataset.target);
    const tick = () => {
      const diff = Math.max(0, target - new Date());
      $("#cdDays").textContent = Math.floor(diff / 86400000);
      $("#cdHours").textContent = Math.floor(diff / 3600000) % 24;
      $("#cdMinutes").textContent = Math.floor(diff / 60000) % 60;
      $("#cdSeconds").textContent = Math.floor(diff / 1000) % 60;
    };
    tick(); setInterval(tick, 1000);
  }

  $$(".music-player").forEach(player => {
    const audio = new Audio(player.dataset.audio);
    audio.loop = true;
    const btn = $(".music-btn", player);
    const label = $(".music-copy span", player);
    btn.addEventListener("click", async () => {
      try {
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
      } catch (e) { label.textContent = "اضغطي مرة تانية"; }
    });
  });

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

  const cards = $$(".memory-card");
  const lightbox = $("#lightbox");
  if (cards.length && lightbox) {
    const image = $("#lightboxImage");
    const indexLabel = $("#lightboxIndex");
    let current = 0;
    const show = (i) => {
      current = (i + cards.length) % cards.length;
      image.src = cards[current].dataset.lightbox;
      indexLabel.textContent = `${String(current+1).padStart(2,"0")} / ${cards.length}`;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden","false");
      document.body.classList.add("lightbox-open");
    };
    const close = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden","true");
      document.body.classList.remove("lightbox-open");
    };
    cards.forEach((card,i) => card.addEventListener("click", () => show(i)));
    $(".lightbox-close",lightbox).addEventListener("click",close);
    $(".lightbox-nav.next",lightbox).addEventListener("click",()=>show(current+1));
    $(".lightbox-nav.prev",lightbox).addEventListener("click",()=>show(current-1));
    lightbox.addEventListener("click",(e)=>{ if(e.target===lightbox) close(); });
    document.addEventListener("keydown",(e)=>{
      if(!lightbox.classList.contains("open")) return;
      if(e.key==="Escape") close();
      if(e.key==="ArrowLeft") show(current+1);
      if(e.key==="ArrowRight") show(current-1);
    });
    let touchX = null;
    lightbox.addEventListener("touchstart",e=>{touchX=e.touches[0].clientX},{passive:true});
    lightbox.addEventListener("touchend",e=>{
      if(touchX===null) return;
      const dx=e.changedTouches[0].clientX-touchX;
      if(Math.abs(dx)>50) show(current+(dx<0?1:-1));
      touchX=null;
    },{passive:true});
  }
})();