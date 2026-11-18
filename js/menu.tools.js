class ToolsMenuClass extends Submenu
{  
  constructor()
  {
    super("Tools", "tools");
    
    this.icons.push(new SubmenuIcon("filexml", "XML viewer", ()=>{}));

    this.icons.push(new SubmenuIcon("filedot", "DOT viewer", ()=>{}));
    

    Menu.disableSubmenu(['XML viewer', 'DOT viewer']);
  }
  
  
};

const ToolsMenu = new ToolsMenuClass();