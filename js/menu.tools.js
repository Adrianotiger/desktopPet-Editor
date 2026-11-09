class ToolsMenuClass extends Submenu
{  
  constructor()
  {
    super("Tools", "tools");
    
    this.icons.push(new SubmenuIcon("filexml", "XML viewer", ()=>{}));
    

    Menu.disableSubmenu(['XML viewer']);
  }
  
  
};

const ToolsMenu = new ToolsMenuClass();