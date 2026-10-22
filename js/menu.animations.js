class AniMenuClass extends Submenu
{  
  constructor()
  {
    super("Anim.", "sheep");
    
    this.icons.push(new SubmenuIcon("sheep", "Header", ()=>{
      
    }));
    
    this.icons.push(new SubmenuIcon("sheep", "Spritesheet", ()=>{
      
    }));
    
    this.icons.push(new SubmenuIcon("sheep", "Spawns", ()=>{
      
    }));
    
    this.icons.push(new SubmenuIcon("sheep", "Animations", ()=>{
      
    }));
    
    this.icons.push(new SubmenuIcon("sheep", "Childs", ()=>{
      
    }));
  }
  
  
};

const AniMenu = new AniMenuClass();