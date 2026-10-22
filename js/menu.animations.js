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
  }
  
  
};

const AniMenu = new AniMenuClass();