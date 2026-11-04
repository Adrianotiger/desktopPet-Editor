class ToolsMenuClass extends Submenu
{  
  constructor()
  {
    super("Tools", "tools");
    
    this.icons.push(new SubmenuIcon("filexml", "XML viewer", ()=>{}));
    

  }
  
  
};

const ToolsMenu = new ToolsMenuClass();