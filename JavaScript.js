
    /* ------------------------ Background particles (simple) ------------------------ */
    const bgCanvas = document.getElementById('bgCanvas');
    const bgCtx = bgCanvas.getContext('2d');
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    function resizeBg(){
      dpr = Math.max(1, window.devicePixelRatio || 1);
      bgCanvas.width = Math.floor(bgCanvas.clientWidth * dpr);
      bgCanvas.height = Math.floor(bgCanvas.clientHeight * dpr);
      bgCtx.scale(dpr, dpr);
    }
    const particles = [];
    function createParticles(){
      particles.length = 0;
      const count = Math.floor((window.innerWidth/80));
      for(let i=0;i<count;i++){
        particles.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight*0.6, r:Math.random()*2+0.5, vx:(Math.random()-0.5)*0.15, vy:(Math.random()*0.2)+0.02, alpha:0.1+Math.random()*0.6});
      }
    }
    function drawBg(time){
      bgCtx.clearRect(0,0,bgCanvas.width/dpr,bgCanvas.height/dpr);
      // subtle moving gradient
      const g = bgCtx.createLinearGradient(0,0,0,bgCanvas.height/dpr);
      g.addColorStop(0,'rgba(6,21,34,0.7)');
      g.addColorStop(1,'rgba(4,10,22,0.4)');
      bgCtx.fillStyle = g;
      bgCtx.fillRect(0,0,bgCanvas.width/dpr,bgCanvas.height/dpr);
      for(const p of particles){
        p.x += p.vx * (1 + Math.sin(time/3000));
        p.y += p.vy;
        if(p.x < -10) p.x = window.innerWidth+10;
        if(p.x > window.innerWidth+10) p.x = -10;
        if(p.y > window.innerHeight) p.y = -30;
        bgCtx.beginPath();
        bgCtx.globalAlpha = p.alpha;
        bgCtx.fillStyle = 'rgba(255,255,255,0.9)';
        bgCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
        bgCtx.fill();
      }
      bgCtx.globalAlpha = 1;
      requestAnimationFrame(drawBg);
    }

    function initBg(){
      resizeBg();
      createParticles();
      requestAnimationFrame(drawBg);
    }

    window.addEventListener('resize',()=>{resizeBg();createParticles();});

    /* ------------------ Countdown to Jan 1, 2026 UTC+0 ------------------ */
    const target = new Date('2026-01-01T00:00:00Z');
    function updateCountdown(){
      const now = new Date();
      let diff = Math.max(0, target - now);
      const sec = Math.floor(diff/1000)%60;
      const min = Math.floor(diff/60000)%60;
      const hr = Math.floor(diff/3600000)%24;
      const days = Math.floor(diff/86400000);
      document.getElementById('secs').textContent = String(sec).padStart(2,'0');
      document.getElementById('mins').textContent = String(min).padStart(2,'0');
      document.getElementById('hours').textContent = String(hr).padStart(2,'0');
      document.getElementById('days').textContent = String(days).padStart(2,'0');
    }
    setInterval(updateCountdown,1000);
    updateCountdown();

    /* --------------------- Fireworks (canvas) --------------------- */
    const fwCanvas = document.getElementById('fireworksCanvas');
    const fwCtx = fwCanvas.getContext('2d');
    function resizeFW(){
      fwCanvas.width = Math.floor(fwCanvas.clientWidth * dpr);
      fwCanvas.height = Math.floor(fwCanvas.clientHeight * dpr);
      fwCtx.scale(dpr,dpr);
    }
    let fwParticles = [];
    let fwRockets = [];

    function Rocket(x,y,vx,vy,color){
      this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.color = color;
    }
    function Particle(x,y,vx,vy,color,life){
      this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.color=color;this.life=life;this.age=0;this.size=2+Math.random()*2;
    }

    function spawnFirework(x,y){
      const vx = (Math.random()-0.5)*3;
      const vy = -6 - Math.random()*5;
      const color = `hsl(${Math.floor(Math.random()*360)},90%,60%)`;
      fwRockets.push(new Rocket(x, fwCanvas.clientHeight + 10, vx, vy, color));
    }

    function explode(x,y,color){
      const count = 30 + Math.floor(Math.random()*40);
      for(let i=0;i<count;i++){
        const angle = Math.random()*Math.PI*2;
        const speed = Math.random()*4 + 1.5;
        const vx = Math.cos(angle)*speed;
        const vy = Math.sin(angle)*speed;
        fwParticles.push(new Particle(x,y,vx,vy,color, 60 + Math.random()*40));
      }
    }

    function stepFW(){
      fwCtx.clearRect(0,0,fwCanvas.width/dpr,fwCanvas.height/dpr);
      // update rockets
      for(let i=fwRockets.length-1;i>=0;i--){
        const r = fwRockets[i];
        r.x += r.vx; r.y += r.vy; r.vy += 0.12; // gravity
        fwCtx.beginPath(); fwCtx.globalAlpha = 0.9; fwCtx.fillStyle = r.color; fwCtx.arc(r.x, r.y, 2.5,0,Math.PI*2); fwCtx.fill();
        if(r.vy >= -1.5){ // explode
          explode(r.x, r.y, r.color);
          fwRockets.splice(i,1);
        }
      }
      // particles
      for(let i=fwParticles.length-1;i>=0;i--){
        const p = fwParticles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.vx *= 0.998; p.vy *= 0.998; p.age++;
        const t = p.age / p.life;
        fwCtx.beginPath(); fwCtx.globalAlpha = Math.max(0,1-t); fwCtx.fillStyle = p.color; fwCtx.arc(p.x, p.y, p.size*(1-t), 0, Math.PI*2); fwCtx.fill();
        if(p.age > p.life) fwParticles.splice(i,1);
      }

      requestAnimationFrame(stepFW);
    }

    /* interaction */
    document.getElementById('launchFireworks').addEventListener('click', ()=>{
      for(let i=0;i<6;i++) spawnFirework(Math.random()*fwCanvas.clientWidth, 0);
    });

    // keyboard L to launch
    window.addEventListener('keydown', e=>{ if(e.key.toLowerCase()==='l'){ document.getElementById('launchFireworks').click(); } });

    /* Confetti (DOM-based simple) */
    let confettiOn = false;
    const confettiPieces = [];
    function toggleConfetti(){
      confettiOn = !confettiOn;
      if(confettiOn) startConfetti();
    }
    document.getElementById('toggleConfetti').addEventListener('click',()=>{ toggleConfetti(); });

    function startConfetti(){
      const root = document.body;
      const count = 60;
      for(let i=0;i<count;i++){
        const el = document.createElement('div');
        el.className = 'spark';
        el.style.left = Math.random()*100 + '%';
        el.style.top = (-10-Math.random()*30)+'%';
        el.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
        el.style.width = (6+Math.random()*8)+'px';
        el.style.height = el.style.width;
        el.style.background = `hsl(${Math.random()*360},80%,60%)`;
        el.style.position='fixed'; el.style.zIndex=9999; el.style.opacity=0.95;
        root.appendChild(el);
        const fall = el.animate([
          { transform: `translateY(0) rotate(0deg)`, opacity:1 },
          { transform: `translateY(${window.innerHeight+200}px) rotate(${Math.random()*720}deg)`, opacity:0.95 }
        ],{ duration:3000+Math.random()*3000, easing:'cubic-bezier(.2,.7,.2,1)' });
        fall.onfinish = ()=>{ el.remove(); }
      }
      if(confettiOn) setTimeout(startConfetti, 800);
    }

    // share button (web share if available)
    document.getElementById('shareBtn').addEventListener('click', ()=>{
      const s = {
        title:'Happy New Year 2026',
        text:'Wishing you a brilliant 2026! 🎉',
        url:location.href
      };
      if(navigator.share) navigator.share(s).catch(()=>alert('Share cancelled'));
      else navigator.clipboard.writeText(`${s.title} - ${s.text} ${s.url}`).then(()=>alert('Link copied to clipboard'));
    });

    /* init everything */
    function initAll(){
      initBg();
      resizeFW();
      requestAnimationFrame(stepFW);
    }
    window.addEventListener('load', initAll);
    window.addEventListener('resize', ()=>{ resizeFW(); });

    // small safety: if page hidden, pause heavy loops (rudimentary)
    document.addEventListener('visibilitychange', ()=>{
      if(document.hidden){ /* could pause animations */ }
    });
