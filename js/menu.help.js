class HelpMenuClass extends Submenu
{  
  constructor()
  {
    super("Help", "helptutorial");
    
    this.icons.push(new SubmenuIcon("helptutorial", "App", ()=>{}));

    this.icons.push(new SubmenuIcon("helptutorial", "XML", ()=>{}));
    
    this.icons.push(new SubmenuIcon("help", "Help", ()=>{}));

    this.icons.push(new SubmenuIcon("helpinfo", "Info", ()=>{}));

    this.icons.push(new SubmenuIcon("helpcredits", "Credits", ()=>{}));

    this.icons.push(new SubmenuIcon("helplicense", "License", ()=>{}));

    const helpPages = {
      license:{link:"license", title:"License"}, 
      credits:{link:"credits", title:"Credits"},
      info: {link:"info", title:"Info"},
      help: {link:"help", title:"Help"},
      tutorial: {link:"tutorial", title:"Tutorial"},
      app:{link: "tutorialapp", title:"Tutorial App"},
      xml:{link: "tutorialxml", title:"Tutorial XML"}
    };
    document.body.addEventListener("menu", (ev)=>{
      if(Object.keys(helpPages).includes(ev?.detail?.action))
      {
        HelpTab.show(helpPages[ev.detail.action]);
      }
    });
    
  }
  
  
};

const HelpMenu = new HelpMenuClass();