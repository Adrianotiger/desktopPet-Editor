class FileMenuClass extends Submenu
{  
  constructor()
  {
    super("File", "fileopen");
    
    this.icons.push(new SubmenuIcon("openproject", "Open", ()=>{}));
    
    this.icons.push(new SubmenuIcon("filenew", "New", ()=>{}));

    this.icons.push(new SubmenuIcon("filesave", "Save", ()=>{}));

    this.icons.push(new SubmenuIcon("exportani", "Export", ()=>{}));

    Menu.disableSubmenu(['Save', 'Export']);
  }
  
  
};

const FileMenu = new FileMenuClass();