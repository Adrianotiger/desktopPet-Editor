class TabClass
{
  div = null;
  title = "";
  constructor(title)
  {
    this.title = title;
    this.div = _CN("div", {class:"infobox tabdiv"}, [], document.body.getElementsByClassName("tabcollection")[0]);
    
    document.body.addEventListener("menu", (ev)=>{if(ev?.detail?.action == title.toLowerCase()) Tabs.show(this, ev.detail.params);});
    Tabs.addTab(this);
  }
  
  hide()
  {
    this.div.style.opacity=0.5;
    this.div.style.pointerEvents="none";
    this.div.style.backgroundColor = "rgba(0,0,0,0.0)";
  }
  
  show()
  {
    this.div.style.zIndex = Tabs.index++;
    this.div.style.opacity = 1;
    this.div.style.pointerEvents = "inherit";
    this.div.style.backgroundColor = "rgba(0,30,50,0.8)";
  }
};

var Tabs = new class
{
  #div = null;
  #tabItems = ["open", "animations", "animation"];
  #tabs = [];
  static index = 0;
  
  constructor()
  {
  }
  
  init()
  {
    this.#div = document.body.getElementsByClassName("tabcollection");
    this.#tabItems.forEach(tab=>{
      _CN("script", {src:`js/tab.${tab}.js`}, [], document.head);
    });
  }
  
  addTab(tab)
  {
    tab.div.style.zIndex = Tabs.index++;
    this.#tabs.push(tab);
    this.show(null);
  }
  
  show(tab, params)
  {
    this.#tabs.forEach(t => { t.hide() });
    if(tab)
      tab.show(params);
  }
};

window.addEventListener("load", ()=>{Tabs.init();});