class XMLAnimationsClass
{
  xsd = "https://raw.githubusercontent.com/Adrianotiger/desktopPet/master/Resources/animations.xsd";
  xsi = "http://www.w3.org/2001/XMLSchema-instance"
  xmlns = "https://esheep.petrucci.ch/";
  schemaLocation = "https://esheep.petrucci.ch/ https://raw.githubusercontent.com/Adrianotiger/desktopPet/master/Resources/animations.xsd";
  header = null;
  image = null;
  spawns = [];
  animations = [];
  childs = [];
  sounds = [];
  
  constructor()
  {
  }
};

const XML = new class
{
  #xmlString = "";
  #xmlDoc = null;
  
  #animations = new XMLAnimationsClass();
  
  #mainscripts = ["value", "node"];
  #scripts = ["header", "image", "spawn", "spawn.next", "animation", "animation.sequence", "animation.next", "checks"];
  
  constructor()
  {
    let loaded = 0;
    this.#mainscripts.forEach(ms=>{
      _CN("script", {src:`js/xml.${ms}.js`}, [], document.head).addEventListener("load",()=>{
        loaded++;
        if(loaded >= this.#mainscripts.length)
        {
          this.#scripts.forEach(s=>{
            _CN("script", {src:`js/xml.${s}.js`}, [], document.head);
          });
        }
      });
    });
  }
  
  loadXML(xmlString)
  {
    // solve a known bug on old xmls:
    xmlString = xmlString.replace('xmlns:xsd="https://esheep.petrucci.ch/ https://raw.githubusercontent.com/Adrianotiger/desktopPet/master/Resources/animations.xsd"', 'xmlns:xsd="https://raw.githubusercontent.com/Adrianotiger/desktopPet/master/Resources/animations.xsd"');
    
    const parser = new DOMParser();
    this.#xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    const parserError = this.#xmlDoc.querySelector("parsererror");
    if (parserError) 
    {
      console.error("Error reading XML:", parserError.textContent);
      return;
    }
    console.log(this.#xmlDoc);
    
    const headerElement = xmlNodeGetNode(this.#xmlDoc, 'header');
    const imageElement = xmlNodeGetNode(this.#xmlDoc, 'image');
    const spawnsElement = xmlNodeGetNode(this.#xmlDoc, 'spawns');
    const animationsElement = xmlNodeGetNode(this.#xmlDoc, 'animations');
    const childsElement = xmlNodeGetNode(this.#xmlDoc, 'childs');
    const soundsElement = xmlNodeGetNode(this.#xmlDoc, 'sounds');
    
    if(!headerElement) {console.error("HEADER element missing"); return; }
    if(!imageElement) {console.error("IMAGE element missing"); return; }
    if(!spawnsElement) {console.error("SPAWNS element missing"); return; }
    if(!animationsElement) {console.error("ANIMATIONS element missing"); return; }
    
    this.#xmlString = xmlString;
    
    this.#animations = new XMLAnimationsClass();
    this.#animations.header = new XMLAnimationsHeader(headerElement);
    this.#animations.image = new XMLAnimationsImage(imageElement);
    this.#animations.spawns = [];
    spawnsElement.querySelectorAll('spawn').forEach(se=>{
      this.#animations.spawns.push(new XMLAnimationsSpawn(se));
    });
    this.#animations.animations = [];
    animationsElement.querySelectorAll('animation').forEach(an=>{
      this.#animations.animations.push(new XMLAnimationsAnimation(an));
    });
    
    console.log(this.#animations);
    
    const xmlEvent = new CustomEvent("xml", {
      detail: { action:"load" }, 
      bubbles: true,
      cancelable: true
    });

      // leave time to async functions to end
    setTimeout(()=>{
      document.body.dispatchEvent(xmlEvent);
    }, 200);
  }
  
  getAnimations()
  {
    return this.#animations.animations;
  }
  
  getImage(index=-1)
  {
    if(index < 0)
      return this.#animations.image;
    else
      return this.#animations.image.getFrameImage(index);
  }
};