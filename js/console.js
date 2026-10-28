const ExtendedConsole = new class
{  
  #div = null;
  #p = null;
  #timeFormat = "";
  #timeout = null;
  #lastlogs = [];
  
  constructor()
  {
    this.#timeFormat = new Intl.DateTimeFormat('de-CH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  
  init()
  {
    this.#div = document.getElementsByClassName("console")[0];

    this.#p = _CN("p", {}, [], this.#div);
    const terminal = _CN("b", {}, ["💻"], this.#div);
    
    const originalLog = console.log;
    console.log = (...args) => {
      this.writeLog(args);
      const stack = new Error().stack;

      this.#lastlogs.push({type:"log", msg:args, stack:stack, time:this.getTime()});
      originalLog.apply(console, args);
    };
    
    const originalError = console.error;
    console.error = (...args) => {
      this.writeError(args);
      const stack = new Error().stack;
      const callerLine = stack ? stack.split('\n')[2].trim() : 'unknown';

      this.#lastlogs.push({type:"err", msg:args, stack:stack, time:this.getTime()});

      originalError.apply(console, [...args, `\n  📍 ${callerLine}`]);
      //originalError.apply(console, args);
    };

    terminal.addEventListener("click", ()=>{
      this.showLogs();
    });
  }
  
  writeLog(txt)
  {
    if(this.#timeout != null) return;
    
    this.#p.style.backgroundColor = "#9e9e9e";
    let outTxt = "";
    txt.forEach(t=>{
      if (t instanceof Element) {
        outTxt += 'Element:' + t.tagName + " - " + t.id + "\n";   // real DOM node
      } else if (typeof t === 'object' && t !== null) {
        outTxt += JSON.stringify(t) + "\n";                // or structuredClone, etc.
      } else {
        outTxt += String(t) + "\n";
      }
    });
    this.#p.textContent = this.getTime() + outTxt;
    this.#timeout = setTimeout(()=>{
      this.#p.style.backgroundColor = "transparent";
      this.#timeout=null;
    }, 800);
  }
  
  writeError(txt)
  {
    clearTimeout(this.#timeout);
    this.#p.style.backgroundColor = "var(--danger)";
    this.#p.textContent = this.getTime() + txt;
    this.#timeout = setTimeout(()=>{
      this.#p.style.backgroundColor = "transparent";
      this.#timeout=null;
    }, 1500);
  }
  
  getTime()
  {
    const now = new Date();
    return `[${this.#timeFormat.format(now)}] - `;
  }

  showLogs()
  {
    let div = _CN("div", {class:"consolemsg"});
    for(let j=this.#lastlogs.length-1;j>=Math.max(0,this.#lastlogs.length-20);j--)
    {
      const log = this.#lastlogs[j];
      let msg = "";
      let detail = null;
      let stack = null;
      if(Array.isArray(log.msg))
      {
        log.msg.forEach(logLine=>{
          if (logLine instanceof Element) {
            msg += 'Element:' + logLine.tagName + " - " + logLine.id + "\n";   // real DOM node
          } 
          else if (Array.isArray(logLine)) {
            msg += `Array: ${logLine.length} items`;
            detail = _CN("pre", {}, [JSON.stringify(logLine, null, " ")]);                // or structuredClone, etc.
          } 
          else if (typeof logLine === 'object' && logLine !== null) {
            msg += `Object: ${logLine.constructor?.name}`;
            detail = _CN("pre", {}, [JSON.stringify(logLine, null, " ")]);               // or structuredClone, etc.
          } 
          else {
            msg += String(logLine) + "\n";
          }
        });
      }
      if(log.type == "err") stack = _CN("pre", {}, [log.stack.replace(/https?:\/\/[^\s)]+\//g, '')]);
      let sdiv = _CN("div", {class:log.type}, [`[${log.type}|${log.time}] `, msg], div);
      if(detail)
      {
        let td1 = _CN("td", {style:"cursor:pointer;"}, ["detail ➤"]);
        let td2 = _CN("td", {style:"display:none;"}, [detail]);
        _CN("table", {}, [_CN("tr",{},[td1, td2])], sdiv);
        td1.addEventListener("click", ()=>{
          if(td2.style.display == "none") td2.style.display = "table-cell";
          else td2.style.display = "none";
        });
      }
      if(stack)
      {
        let td1 = _CN("td", {style:"cursor:pointer;"}, ["stack ➤"]);
        let td2 = _CN("td", {style:"display:none;"}, [stack]);
        _CN("table", {}, [_CN("tr",{},[td1, td2])], sdiv);
        td1.addEventListener("click", ()=>{
          if(td2.style.display == "none") td2.style.display = "table-cell";
          else td2.style.display = "none";
        });
      }

    }
    Msg.show({title:"Logs:", content:div, buttons:["OK"]});
  }
};

window.addEventListener("load", ()=>{ExtendedConsole.init();});