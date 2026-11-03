class DropDownClass
{
  div = null;
  selectedIndex = -1;
  items = [];

  constructor(parent)
  {
    this.div = _CN("div", {class:"formula_dropdown", style:"display:none;"}, [], parent);
  }

  update(items)
  {
    this.items = [];
    if(!items || !Array.isArray(items) || items?.length == 0)
    {
      this.div.style.display = "none";
    }
    else
    {
      this.div.style.display = "block";
      this.div.innerHTML = "";
      this.selectedIndex = 0;
      items.forEach((i, j)=>{
        const item = _CN("div", {}, [i], this.div);
        this.items.push(item);
        if(this.selectedIndex == j) item.style.border = "1px solid yellow";
      });
    }
  }

  down()
  {
    if(this.selectedIndex < this.items.length - 1)
    {
      this.selectedIndex++;
      this.items.forEach((item, j)=>{
        item.style.border = (this.selectedIndex == j ? "1px solid yellow" : "");
      });
    }
  }

  up()
  {
    if(this.selectedIndex > 0)
    {
      this.selectedIndex--;
      this.items.forEach((item, j)=>{
        item.style.border = (this.selectedIndex == j ? "1px solid yellow" : "");
      });
    }
  }

  enter()
  {
    if(this.selectedIndex >= 0 && this.selectedIndex < this.items.length)
      return this.items[this.selectedIndex].textContent;
    else 
      return "";
  }
}

class FormulaPreviewClass
{
  canv;
  screen = {w:1920, h:1080, x:100, y:100, i:null};
  area = {w:1920, h:1018, x:100, y:100};
  size = {w:2120, h:1218};
  origin = {x:100, y:100};
  image = {w:10, h:10, x:0, y:0, i:null};
  randInc = 0;

  constructor(div)
  {
    this.canv = _CN("canvas", {width:this.size.w, height:this.size.h, class:"formula_canv"}, [], div);
    this.screen.i = new Image();
    this.screen.i.addEventListener("load", ()=>{this.update();});
    this.screen.i.src = "images/win.jpg";
    this.image.w = XML.image.getFrameWidth();
    this.image.h = XML.image.getFrameHeight();
  }

  get screenW() { return this.screen.w; }
  get screenH() { return this.screen.h; }
  get areaW() { return this.area.w; }
  get areaH() { return this.area.h; }
  get imageW() { return this.image.w; }
  get imageH() { return this.image.h; }
  get random() {return Math.floor(Math.random() * 100); }
  get randS() {return (this.randInc++) % 100; }
  
  update(x, y)
  {
    this.image.x = this.screen.x + (x??0);
    this.image.y = this.screen.y + (y??0);

    const ctx = this.canv.getContext("2d");
    ctx.fillStyle = "#888";
    ctx.fillRect(0, 0, this.canv.width, this.canv.height);
    ctx.drawImage(this.screen.i, 100, 100);

    ctx.fillStyle = "Magenta";
    ctx.fillRect(this.image.x, this.image.y, this.image.w, this.image.h);
    
  }
}

const Formula = new class
{
  Keywords = Object.freeze({
    screenW: "screenW",
    screenH: "screenH",
    areaW: "areaW",
    areaH: "areaH",
    imageW: "imageW",
    imageH: "imageH",
    random: "random",
    randS: "randS"
  });

  constructor()
  {
    
  }

  show(inputOrigin, nodeTitle, node)
  {
    let title = `Node ${nodeTitle}`;
    let content = _CN("div", {class:"formula_div"});
    let buttons = [" 💾 Save ", " ❌ Cancel "]
    let input = _CN("input", {type:"text", value:inputOrigin.value}, [], content);
    let help = _CN("div", {class:"formula_help"}, [], content);
    let dropdown = new DropDownClass(content);

    let values = {x:node.xOriginal, y:node.yOriginal};
    
    Msg.show({title, content, buttons}, ()=>{
      inputOrigin.value = input.value;
    });

    this.#fillHelp(help);
    let preview = new FormulaPreviewClass(help);
    let errorDiv = _CN("div", {class:"formula_error"}, [], content);

    input.addEventListener("input", (ev)=>{
      const lastWord = this.#lastWord(input);
      let items = [];
      if (lastWord.length > 0) {
        items = Object.keys(this.Keywords).filter(k => 
          k.toLowerCase().startsWith(lastWord.toLowerCase()) && 
          k.toLowerCase() !== lastWord.toLowerCase()
        );
      }
      dropdown.update(items);
    });

    input.addEventListener("keydown", (ev)=>{
      //console.log(ev);
      if(ev.key.length > 1 || ev.key == " ")
      {
        switch(ev.key)
        {
          case "ArrowLeft": return;
          case "ArrowRight": return;
          case "Backspace": return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        switch(ev.key)
        {
          case "ArrowDown": dropdown.down(); break;
          case "ArrowUp": dropdown.up(); break;
          case "Enter": 
            this.#insertText(input, dropdown.enter()); 
            dropdown.update([]);
            values[inputOrigin.name] = this.evaluateFormula(input, errorDiv, preview);
            preview.update(values.x, values.y);
            break;
          default:
            console.log(ev); break;
        }
        return false;
      }
    });

    setTimeout(()=>{
      input.selectionStart = input.value.length;
      input.focus();
      if(values.x) values.x = this.evaluateFormula(values.x, errorDiv, preview);
      if(values.y) values.y = this.evaluateFormula(values.y, errorDiv, preview);
      
      values[inputOrigin.name] = this.evaluateFormula(input, errorDiv, preview);
      preview.update(values.x, values.y);
    }, 500);
  }

  #lastWord(inp)
  {
    const val = inp.value;
    const pos = inp.selectionStart;
    let start = pos;
    while (start > 0 && /[a-zA-Z]/.test(val[start - 1]))
      start--;
    return val.substring(start, pos);
  }

  #insertText(inp, text)
  {
    if(text.length == 0) return;

    const pos = inp.selectionStart;
    const val = inp.value;
    const lastWord = this.#lastWord(inp);
    
    // Replace the partial word with the selected keyword
    const newVal = inp.value.substring(0, pos - lastWord.length) + text + inp.value.substring(pos);
    inp.value = newVal;
    inp.selectionStart = inp.selectionEnd = pos - lastWord.length + text.length;
  }

  #fillHelp(div)
  {
    const table = _CN("table", {}, [], div);
    _CN("tr", {}, [_CN("th", {colspan:2}, ["Accepted keywords"])], table);
    _CN("tr", {}, [
      _CN("td", {}, [_CN("span", {}, ["screenW"])]),
      _CN("td", {}, ["Windows screen width"])
    ], table);
    _CN("tr", {}, [
      _CN("td", {}, [_CN("span", {}, ["screenH"])]),
      _CN("td", {}, ["Windows screen height"])
    ], table);
    _CN("tr", {}, [
      _CN("td", {}, [_CN("span", {}, ["areaW"])]),
      _CN("td", {}, ["Screen width without taskbar"])
    ], table);
    _CN("tr", {}, [
      _CN("td", {}, [_CN("span", {}, ["areaH"])]),
      _CN("td", {}, ["Screen height without taskbar"])
    ], table);
    _CN("tr", {}, [
      _CN("td", {}, [_CN("span", {}, ["imageW"])]),
      _CN("td", {}, ["Animation frame width"])
    ], table);
    _CN("tr", {}, [
      _CN("td", {}, [_CN("span", {}, ["imageH"])]),
      _CN("td", {}, ["Animation frame height"])
    ], table);
    _CN("tr", {}, [
      _CN("td", {}, [_CN("span", {}, ["random"])]),
      _CN("td", {}, ["Random value from 0 to 99"])
    ], table);
    _CN("tr", {}, [
      _CN("td", {}, [_CN("span", {}, ["randS"])]),
      _CN("td", {}, ["Like random, but with the same value for the entire spawn"])
    ], table);
  }

  evaluateFormula(inp, errorDiv, preview)
  {
    this.showError(errorDiv, "");
    let formula = (typeof inp == "string") ? inp.trim() : inp.value.trim();
    
    // 1. Check for invalid characters
    if (!/^[a-zA-Z0-9\s\+\-\*\/\(\)\.]+$/.test(formula)) {
      this.showError(errorDiv, "Invalid characters in formula.");
      return;
    }
    
    // 2. Check for balanced parentheses
    let balance = 0;
    for (let char of formula) {
      if (char === '(') balance++;
      if (char === ')') balance--;
      if (balance < 0) {
        this.showError(errorDiv, "Unbalanced parentheses.");
        return;
      }
    }
    if (balance !== 0) {
      this.showError(errorDiv, "Missing closing parenthesis.");
      return;
    }
    
    // 3. Prepare for JS eval (Translate C# (int) cast to JS Math.trunc)
    let jsFormula = formula.replace(/\(int\)/g, 'Math.trunc');
    
    // 4. Inject actual variable values
    const vals = Object.keys(this.Keywords);
    vals.forEach(key=> {
      let regex = new RegExp(`\\b${key}\\b`, 'g');
      jsFormula = jsFormula.replace(regex, preview[key]);
    });
    
    // 5. Execute safely
    try {
      let result = new Function('return ' + jsFormula)();
      return result;
      //jsResultEl.textContent = result;
      //jsResultEl.classList.remove('error-text');
      
      // C# integer casting truncates towards zero, exactly like JS Math.trunc
      //csharpResultEl.textContent = result; 

    } catch (e) {
      this.showError(errorDiv, "Syntax error in formula.");
    }
    return null;
  }

  showError(errorDiv, text)
  {
    if(text == "")
    {
      errorDiv.style.background = "black";
      errorDiv.style.color = "white";
      errorDiv.textContent = "Formula is correct";
      return;
    }
    errorDiv.style.background = "#600";
    errorDiv.style.color = "#f60";
    errorDiv.textContent = text;
  }
}