class SubmenuIcon
{
  icon = "";
  title = "";
  div = null;
  #disable = false;

  constructor(icon, title, event)
  {
    this.icon = icon;
    this.title = title;
    
    this.div = _CN("div", {class:"icondiv"}, [_CN("img", {class:"icon", "data-icon":icon}), _CN("br"), _CN("span", {}, [title])]);
    this.div.addEventListener("click", ()=>{
      if(this.#disable) return;
      event();
    });
    this.div.addEventListener("click", ()=>{
      if(this.#disable) return;
      this.#clicked();
    });
  }

  set disable(value)
  {
    this.#disable = value;
    if(value)
    {
      this.div.style.filter = "sepia(0.8)";
      this.div.style.opacity = 0.6;
    }
    else
    {
      this.div.style.filter = "sepia(0)";
      this.div.style.opacity = 1.0;
    }
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
    _CN("table", {}, [_CN("tr", {}, [this.#menuMainDiv, this.#menuSubDiv])], this.div);
    let scripts2Load = [];
    this.#submenusItems.forEach(sm=>scripts2Load.push(`menu.${sm}`));
    loadScripts(scripts2Load, false);
  }
  
  addSubmenu(submenu)
  {
    this.#submenus.push(submenu);
    
    let menu = _CN("div", {class:"icondiv"}, [
      _CN("img", {class:"icon", "data-icon":submenu.icon}),
      _CN("br"),
      _CN("span", {}, [submenu.title])
    ], this.#menuMainDiv);
    
    // auto load first submenu
    if(this.#submenus.length == 1) setTimeout(()=>{this.openSubMenu(submenu);}, 500);
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

  disableSubmenu(itemArray)
  {
    itemArray.forEach((i)=>{
      let found = false;
      this.#submenus.forEach(sm=>{
        sm.icons.forEach(smi=>{
          if(smi.title == i)
          {
            smi.disable = true;
            found = true;
          }
        });
      });
      if(!found) console.error(`Submenu '${i}' can't be enabled, as it doesn't exists.`);
    });
  }

  enableSubmenu(itemArray)
  {
    itemArray.forEach((i)=>{
      let found = false;
      this.#submenus.forEach(sm=>{
        sm.icons.forEach(smi=>{
          if(smi.title == i)
          {
            smi.disable = false;
            found = true;
          }
        });
      });
      if(!found) console.error(`Submenu '${i}' can't be enabled, as it doesn't exists.`);
    });
  }
};

window.addEventListener("load", ()=>{
  Menu.init();
  setTimeout(()=>{
    Menu.execute("open");
  }, 500);
});