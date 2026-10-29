class FileMenuClass extends Submenu
{  
  constructor()
  {
    super("File", "fileopen");
    
    this.icons.push(new SubmenuIcon("openproject", "Open", ()=>{}));
    
    this.icons.push(new SubmenuIcon("filenew", "New", ()=>{}));

    this.icons.push(new SubmenuIcon("filesave", "Save", ()=>{}));

    Menu.disableSubmenu(['Save']);
  }
  
  
};

const FileMenu = new FileMenuClass();