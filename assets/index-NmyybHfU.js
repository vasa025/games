(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))e(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&e(l)}).observe(document,{childList:!0,subtree:!0});function s(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function e(n){if(n.ep)return;n.ep=!0;const a=s(n);fetch(n.href,a)}})();const i=4,C=2048;function v(){return Array(i*i).fill(0)}function $(o){const t=[];return o.forEach((s,e)=>{s===0&&t.push(e)}),t}function u(o,t=Math.random){const s=$(o);if(!s.length)return[...o];const e=s[Math.floor(t()*s.length)],n=[...o];return n[e]=t()<.9?2:4,n}function I(o){let t=o>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function G(o=new Date){const t=o.getFullYear(),s=String(o.getMonth()+1).padStart(2,"0"),e=String(o.getDate()).padStart(2,"0");return`${t}-${s}-${e}`}function O(o=new Date){const t=G(o).split("").reduce((n,a)=>n+a.charCodeAt(0),0),s=I(t);let e=v();return e=u(e,s),e=u(e,s),e}function M(o){const t=o.filter(n=>n!==0),s=[];let e=0;for(let n=0;n<t.length;n+=1){const a=t[n],l=t[n+1];if(l!==void 0&&a===l){const b=a*2;s.push(b),e+=b,n+=1}else s.push(a)}for(;s.length<o.length;)s.push(0);return{line:s,scoreGain:e}}function R(o,t){const s=Array.from({length:i},(c,h)=>Array.from({length:i},(r,d)=>o[h*i+d]));let e=!1,n=0;const a=c=>{const h=t==="left"?[...c]:[...c].reverse(),{line:r,scoreGain:d}=M(h);n+=d;const g=t==="left"?r:[...r].reverse();return g.some((y,m)=>y!==c[m])&&(e=!0),g};if(t==="left"||t==="right")return{board:s.map(r=>a(r)).flat(),moved:e,scoreGain:n};const l=Array.from({length:i},(c,h)=>{const r=Array.from({length:i},(E,w)=>s[w][h]),d=t==="up"?[...r]:[...r].reverse(),{line:g,scoreGain:y}=M(d);n+=y;const m=t==="up"?g:[...g].reverse();return m.some((E,w)=>E!==r[w])&&(e=!0),m});return{board:Array.from({length:i*i},(c,h)=>{const r=Math.floor(h/i),d=h%i;return l[d][r]}),moved:e,scoreGain:n}}function A(o){return o.some(t=>t>=C)}function B(o){if(o.some(t=>t===0))return!0;for(let t=0;t<i;t+=1)for(let s=0;s<i;s+=1){const e=t*i+s,n=o[e];if(s<i-1&&n===o[e+1]||t<i-1&&n===o[e+i])return!0}return!1}const T="tileflow-save-v1",x="tileflow-settings-v1";function N(){const o=new Map;return{getItem(t){return o.has(t)?o.get(t):null},setItem(t,s){o.set(t,String(s))},removeItem(t){o.delete(t)},clear(){o.clear()}}}function p(){return typeof window>"u"?N():window.localStorage}function k(){const t=p().getItem(T);if(!t)return null;try{return JSON.parse(t)}catch{return null}}function K(o){p().setItem(T,JSON.stringify(o))}function z(){p().removeItem(T)}function D(){const t=p().getItem(x);if(!t)return{theme:"dark",soundEnabled:!1,settingsOpen:!1};try{const s=JSON.parse(t);return{theme:s.theme||"dark",soundEnabled:!!s.soundEnabled,settingsOpen:!!s.settingsOpen}}catch{return{theme:"dark",soundEnabled:!1,settingsOpen:!1}}}function f(o){p().setItem(x,JSON.stringify(o))}const _={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"};function S(o=0){const t=v();return{board:u(u(t)),score:0,bestScore:o,moves:0,status:"playing",hasWon:!1,mode:"classic",history:[],stats:{totalMoves:0,totalMerges:0,highestTile:2,gamesStarted:1}}}class W{constructor(t){this.root=t,this.settings=D(),this.state=k()||S(this.settings.bestScore||0),this.settings.bestScore=this.state.bestScore,this.touchStart=null,this.audioContext=null,this.handleKey=this.handleKey.bind(this),this.handleResize=this.handleResize.bind(this),this.handleRootClick=this.handleRootClick.bind(this),this.handleTouchStart=this.handleTouchStart.bind(this),this.handleTouchEnd=this.handleTouchEnd.bind(this)}init(){document.addEventListener("keydown",this.handleKey),window.addEventListener("resize",this.handleResize),this.root.addEventListener("click",this.handleRootClick),this.root.addEventListener("touchstart",this.handleTouchStart,{passive:!0}),this.root.addEventListener("touchend",this.handleTouchEnd,{passive:!0}),this.applyTheme(),this.updateBestScore(),this.render()}destroy(){document.removeEventListener("keydown",this.handleKey),window.removeEventListener("resize",this.handleResize),this.root.removeEventListener("click",this.handleRootClick),this.root.removeEventListener("touchstart",this.handleTouchStart),this.root.removeEventListener("touchend",this.handleTouchEnd)}getStatusLabel(){return this.state.status==="won"?"You made it to 2048!":this.state.status==="lost"?"No more moves":"Keep flowing"}applyTheme(){document.documentElement.dataset.theme=this.settings.theme,f(this.settings)}updateBestScore(){this.state.bestScore>0&&(this.settings.bestScore=this.state.bestScore,f(this.settings))}persist(){const t={...this.state,history:this.state.history.slice(-12)};this.state.bestScore=Math.max(this.state.bestScore,this.state.score),K(t),this.updateBestScore()}playTone(t=420){if(!this.settings.soundEnabled||typeof window>"u")return;const s=window.AudioContext||window.webkitAudioContext;if(!s)return;this.audioContext=this.audioContext||new s;const e=this.audioContext.createOscillator(),n=this.audioContext.createGain();e.type="triangle",e.frequency.value=t,n.gain.value=.03,e.connect(n),n.connect(this.audioContext.destination),e.start(),e.stop(this.audioContext.currentTime+.06)}handleRootClick(t){const s=t.target.closest("[data-action]");if(!s)return;const e=s.dataset.action;if(e==="toggle-theme"){this.settings.theme=this.settings.theme==="dark"?"light":"dark",this.applyTheme(),this.render();return}if(e==="toggle-sound"){this.settings.soundEnabled=!this.settings.soundEnabled,f(this.settings),this.render();return}if(e==="new-game"){this.startNewGame("classic");return}if(e==="daily-game"){this.startNewGame("daily");return}if(e==="undo"){this.undo();return}if(e==="toggle-help"){this.settings.settingsOpen=!this.settings.settingsOpen,f(this.settings),this.render();return}if(e==="continue-game"){this.state.status="playing",this.persist(),this.render();return}e==="reset-progress"&&(z(),this.state=S(this.state.bestScore||0),this.persist(),this.render())}handleKey(t){const s=_[t.key];s&&(t.preventDefault(),this.applyMove(s))}handleTouchStart(t){const s=t.changedTouches[0];this.touchStart={x:s.clientX,y:s.clientY}}handleTouchEnd(t){if(!this.touchStart)return;const s=t.changedTouches[0],e=s.clientX-this.touchStart.x,n=s.clientY-this.touchStart.y,a=28;if(Math.abs(e)<a&&Math.abs(n)<a){this.touchStart=null;return}Math.abs(e)>Math.abs(n)?this.applyMove(e>0?"right":"left"):this.applyMove(n>0?"down":"up"),this.touchStart=null}handleResize(){this.root.style.setProperty("--board-size",`${Math.min(window.innerWidth*.82,420)}px`)}startNewGame(t="classic"){const s=t==="daily"?O():v(),e=S(this.state.bestScore||0);e.board=t==="daily"?s:u(u(v())),e.mode=t,e.stats.gamesStarted=this.state.stats.gamesStarted+1,this.state=e,this.persist(),this.render()}undo(){if(!this.state.history.length)return;const t=this.state.history.pop();this.state.board=t.board,this.state.score=t.score,this.state.moves=t.moves,this.state.status=t.status,this.state.hasWon=t.hasWon,this.persist(),this.render()}applyMove(t){if(this.state.status==="lost"||this.state.status==="won")return;const s={board:[...this.state.board],score:this.state.score,moves:this.state.moves,status:this.state.status,hasWon:this.state.hasWon},e=R(this.state.board,t);if(!e.moved){this.playTone(180);return}this.state.board=e.board,this.state.score+=e.scoreGain,this.state.moves+=1,this.state.history.push(s),e.scoreGain>0&&(this.state.stats.totalMerges+=1,this.playTone(520));const n=u(this.state.board);this.state.board=n;const a=Math.max(...this.state.board.filter(Boolean));this.state.stats.highestTile=Math.max(this.state.stats.highestTile,a||2),this.state.stats.totalMoves=this.state.moves,this.state.bestScore=Math.max(this.state.bestScore,this.state.score),this.state.hasWon=A(this.state.board),this.state.hasWon?this.state.status="won":B(this.state.board)?this.state.status="playing":this.state.status="lost",this.persist(),this.render()}render(){this.root.innerHTML=`
      <div class="app-shell">
        <header class="topbar">
          <div class="brand-wrap">
            <div class="brand-mark">T</div>
            <div>
              <p class="eyebrow">Flow puzzle</p>
              <h1>TileFlow</h1>
            </div>
          </div>

          <div class="toolbar">
            <button type="button" class="icon-button" data-action="toggle-theme" aria-label="Toggle theme">
              ${this.settings.theme==="dark"?"☀️":"🌙"}
            </button>
            <button type="button" class="icon-button" data-action="toggle-sound" aria-label="Toggle sound">
              ${this.settings.soundEnabled?"🔊":"🔇"}
            </button>
            <button type="button" class="icon-button" data-action="toggle-help" aria-label="Open settings">
              ☰
            </button>
          </div>
        </header>

        <main class="game-panel">
          <section class="hud" aria-label="Scoreboard">
            <div class="score-card">
              <span>Score</span>
              <strong>${this.state.score}</strong>
            </div>
            <div class="score-card">
              <span>Best</span>
              <strong>${this.state.bestScore}</strong>
            </div>
          </section>

          <section class="controls" aria-label="Game actions">
            <button type="button" class="primary-button" data-action="new-game">New game</button>
            <button type="button" class="secondary-button" data-action="daily-game">Daily</button>
            <button type="button" class="secondary-button" data-action="undo" ${this.state.history.length?"":"disabled"}>Undo</button>
          </section>

          <div class="board-shell">
            <div class="game-board" role="grid" aria-label="TileFlow board" aria-live="polite">
              ${Array.from({length:i*i},(t,s)=>{const e=this.state.board[s],n=e?`tile tile--${e}`:"tile tile--empty";return`
                  <div class="cell" data-index="${s}">
                    <div class="${n}">${e||""}</div>
                  </div>
                `}).join("")}
            </div>

            ${this.state.status!=="playing"?`
              <div class="state-overlay" aria-live="assertive">
                <div class="state-card">
                  <h2>${this.state.status==="won"?"Victory!":"Game over"}</h2>
                  <p>${this.getStatusLabel()}</p>
                  <button type="button" class="primary-button" data-action="${this.state.status==="won"?"continue-game":"new-game"}">
                    ${this.state.status==="won"?"Keep playing":"New game"}
                  </button>
                </div>
              </div>
            `:""}
          </div>
        </main>

        <aside class="sidebar ${this.settings.settingsOpen?"open":""}" aria-label="Settings and help">
          <div class="panel-header">
            <h3>Settings</h3>
            <button type="button" class="ghost-button" data-action="toggle-help">Close</button>
          </div>

          <div class="panel-section">
            <h4>How to play</h4>
            <p>Match numbered tiles and create new values by moving in any direction. Every tile can merge once per move.</p>
          </div>

          <div class="panel-section">
            <h4>Modes</h4>
            <ul>
              <li>Classic: fresh random board</li>
              <li>Daily: same seed every day</li>
            </ul>
          </div>

          <div class="panel-section stats-section">
            <h4>Stats</h4>
            <div class="stat-grid">
              <div>
                <span>Moves</span>
                <strong>${this.state.moves}</strong>
              </div>
              <div>
                <span>Best tile</span>
                <strong>${this.state.stats.highestTile}</strong>
              </div>
              <div>
                <span>Games</span>
                <strong>${this.state.stats.gamesStarted}</strong>
              </div>
              <div>
                <span>Mode</span>
                <strong>${this.state.mode}</strong>
              </div>
            </div>
          </div>

          <div class="panel-section">
            <button type="button" class="secondary-button full-width" data-action="reset-progress">Reset saved progress</button>
          </div>
        </aside>
      </div>
    `,this.handleResize()}}function Y(o){const t=new W(o);return t.init(),t}const L=document.querySelector("#app");if(!L)throw new Error("The app root element was not found.");Y(L);
