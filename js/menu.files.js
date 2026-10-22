class FileMenuClass extends Submenu
{  
  constructor()
  {
    super("File", "fileopen");
    
    this.icons.push(new SubmenuIcon("fileopen", "Open", ()=>{}));
    
    this.icons.push(new SubmenuIcon("filenew", "New", ()=>{}));
  }
  
  
};

const FileMenu = new FileMenuClass();