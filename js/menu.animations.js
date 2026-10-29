class AniMenuClass extends Submenu
{  
  constructor()
  {
    super("Anim.", "sheep");
    
    this.icons.push(new SubmenuIcon("editheader", "Header", ()=>{
      
    }));
    
    this.icons.push(new SubmenuIcon("editspritesheet", "Spritesheet", ()=>{
      
    }));
    
    this.icons.push(new SubmenuIcon("editspawns", "Spawns", ()=>{
      
    }));
    
    this.icons.push(new SubmenuIcon("editanimations", "Animations", ()=>{
      
    }));
    
    this.icons.push(new SubmenuIcon("editchilds", "Childs", ()=>{
      
    }));

    this.icons.push(new SubmenuIcon("editsounds", "Sounds", ()=>{
      
    }));

    document.body.addEventListener("xml", ev=>{
      if(ev?.detail?.action == "load") {
        Menu.openSubMenu(this);
        Menu.enableSubmenu(['Header', 'Spritesheet', 'Spawns', 'Animations', 'Childs', 'Sounds']);
      }
    });

    Menu.disableSubmenu(['Header', 'Spritesheet', 'Spawns', 'Animations', 'Childs', 'Sounds']);
  }
  
  
};

const AniMenu = new AniMenuClass();