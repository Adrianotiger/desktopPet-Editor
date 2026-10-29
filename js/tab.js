class TabClass
{
  div = null;
  title = "";
  isTop = false;

  constructor(title)
  {
    this.title = title;
    this.div = _CN("div", {class:"infobox tabdiv"}, [], document.body.getElementsByClassName("tabcollection")[0]);
    
    document.body.addEventListener("menu", (ev)=>{if(ev?.detail?.action == title.toLowerCase()) Tabs.show(this, ev.detail.params);});
    Tabs.addTab(this);
  }
  
  hide()
  {
    this.isTop = false;
    this.div.style.opacity=0.3;
    this.div.style.pointerEvents="none";
    this.div.style.backgroundColor = "rgba(0,0,0,0.0)";
  }
  
  show()
  {
    this.isTop = true;
    this.div.style.zIndex = Tabs.index++;
    this.div.style.opacity = 1;
    this.div.style.pointerEvents = "inherit";
    this.div.style.backgroundColor = "var(--tab-bg)";
  }
};

var Tabs = new class
{
  #div = null;
  #tabItems = ["open", "save", "header", "animations", "animation"];
  #tabs = [];
  index = 0;
  
  constructor()
  {
  }
  
  init()
  {
    this.#div = document.body.getElementsByClassName("tabcollection");
    let scripts2Load = [];
    this.#tabItems.forEach(sm=>scripts2Load.push(`tab.${sm}`));
    loadScripts(scripts2Load, true);
  }
  
  addTab(tab)
  {
    tab.div.style.zIndex = Tabs.index++;
    this.#tabs.push(tab);
    this.show(null);
  }
  
  show(tab, params)
  {
    let stopPropagation = false;
    this.#tabs.forEach(t => { 
      if(!stopPropagation && t.hide()===false) stopPropagation = true;
    });
    if(stopPropagation) return;

    if(tab)
      tab.show(params);
    if(Tabs.index > 500)
    {
      this.#tabs.forEach(t => { t.div.style.zIndex = parseInt(t.div.style.zIndex) - 500; });
      Tabs.index -= 500;
    }
  }

  removeTop()
  {
    let find = {z:-1000, t:null};
    let next = {z:-1000, t:null};
    this.#tabs.forEach(t => { 
      if(parseInt(t.div.style.zIndex) > find.z) 
        find = {z:parseInt(t.div.style.zIndex), t:t};
    });
    this.#tabs.forEach(t => { 
      if(parseInt(t.div.style.zIndex) > next.z && t.div.style.zIndex < find.z) 
        next = {z:parseInt(t.div.style.zIndex), t:t};
    });
    this.show(next.t);
  }
};

window.addEventListener("load", ()=>{Tabs.init();});