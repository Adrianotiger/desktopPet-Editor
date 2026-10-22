const ExtendedConsole = new class
{  
  #div = null;
  #timeFormat = "";
  #timeout = null;
  
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
    
    const originalLog = console.log;
    console.log = (...args) => {
      this.writeLog(args);
      originalLog.apply(console, args);
    };
    
    const originalError = console.error;
    console.error = (...args) => {
      this.writeError(args);
      originalError.apply(console, args);
    };
  }
  
  writeLog(txt)
  {
    clearTimeout(this.#timeout);
    this.#div.style.backgroundColor = "#333";
    this.#div.textContent = this.getTime() + txt;
    this.#timeout = setTimeout(()=>{this.#div.style.backgroundColor = "transparent";}, 800);
  }
  
  writeError(txt)
  {
    clearTimeout(this.#timeout);
    this.#div.style.backgroundColor = "#822";
    this.#div.textContent = this.getTime() + txt;
    this.#timeout = setTimeout(()=>{this.#div.style.backgroundColor = "transparent";}, 1500);
  }
  
  getTime()
  {
    const now = new Date();
    return `[${this.#timeFormat.format(now)}] - `;
  }
};

window.addEventListener("load", ()=>{ExtendedConsole.init();});