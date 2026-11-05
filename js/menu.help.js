class HelpMenuClass extends Submenu
{  
  constructor()
  {
    super("Help", "helptutorial");
    
    this.icons.push(new SubmenuIcon("helptutorial", "Tutorial", ()=>{}));
    
    this.icons.push(new SubmenuIcon("help", "Help", ()=>{}));

    this.icons.push(new SubmenuIcon("helpinfo", "Info", ()=>{}));

    this.icons.push(new SubmenuIcon("helpcredits", "Credits", ()=>{}));

    this.icons.push(new SubmenuIcon("helplicense", "License", ()=>{}));

    const helpPages = ["license", "credits", "info", "help", "tutorial"];
    document.body.addEventListener("menu", (ev)=>{
      if(helpPages.includes(ev?.detail?.action))
      {
        HelpTab.show({link:ev?.detail?.action, title:ev?.detail?.action});
      }
    });
    
  }
  
  
};

const HelpMenu = new HelpMenuClass();