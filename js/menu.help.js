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

  }
  
  
};

const HelpMenu = new HelpMenuClass();