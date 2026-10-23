class SubmenuIcon
{
  icon = "";
  title = "";
  div = null;
  constructor(icon, title, event)
  {
    this.icon = icon;
    this.title = title;
    
    this.div = _CN("div", {class:"icondiv"}, [_CN("img", {class:"icon", "data-icon":icon}), _CN("br"), _CN("span", {}, [title])]);
    this.div.addEventListener("click", ()=>{event();});
    this.div.addEventListener("click", ()=>{
      this.#clicked();
    });
  }
  
  async #clicked()
  {
    Menu.execute(this.title.toLowerCase());
  }
}

class Submenu
{
  icons = [];
  title = "";
  icon = "";
  constructor(title, icon)
  {
    this.title = title;
    this.icon = icon;
    
    Menu.addSubmenu(this);
  }
};

const Menu = new class
{
  div = null;
  #submenusItems = ["files", "animations"];
  #table = null;
  #menuMainDiv = null;
  #menuSubDiv = null;
  #submenus = [];
  
  constructor()
  {
  }
  
  init()
  {
    this.div = document.body.getElementsByClassName("menu")[0];
    this.#menuMainDiv = _CN("td", {style:"min-width:10%;white-space:nowrap;"});
    this.#menuSubDiv = _CN("td", {style:"width:80%;overflow-scrollX:auto;white-space:nowrap;"});
    this.#table = _CN("table", {}, [_CN("tr", {}, [this.#menuMainDiv, this.#menuSubDiv])], this.div);
    this.#submenusItems.forEach(sm=>{_CN("script", {src:`js/menu.${sm}.js`}, [], document.head)});
  }
  
  addSubmenu(submenu)
  {
    this.#submenus.push(submenu);
    
    let menu = _CN("div", {class:"icondiv"}, [
      _CN("img", {class:"icon", "data-icon":submenu.icon}),
      _CN("br"),
      _CN("span", {}, [submenu.title])
    ], this.#menuMainDiv);
    
    menu.addEventListener("click", ()=>{this.openSubMenu(submenu);});
  }
  
  openSubMenu(submenu)
  {
    this.#menuSubDiv.innerHTML = "<div style='width:3px;border:ridge 2px #555;height:30px;display:inline-block;' />";
    submenu.icons.forEach((smi, j)=>{
      setTimeout(()=>{
        this.#menuSubDiv.appendChild(smi.div);
      }, j*100)
    });
  }

  execute(action, params=null)
  {
    let detail = { action };
    if(params != null) detail.params = params;
    document.body.dispatchEvent(
      new CustomEvent("menu", {
        detail: detail, 
        bubbles: true,
        cancelable: true
      })
    );
  }
};

window.addEventListener("load", ()=>{
  Menu.init();
  setTimeout(()=>{
    Menu.execute("open");
  }, 500);
});