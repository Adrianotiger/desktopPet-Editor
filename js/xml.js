// This file is the XML bootstrap for the whole animation editor.
// It parses the raw XML document once, then turns each important section into JS objects
// (header/image/spawn/animation) so the rest of the app can work with typed data instead
// of raw DOM nodes. The subfiles such as xml.animation.js and xml.animation.sequence.js are
// loaded lazily after the base XML helpers are ready.
class XMLAnimationsClass
{
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
  
  // The editor loads the core XML helper scripts first, then the schema-specific ones.
  // This makes sure classes like XMLValue, XMLNode, XMLAnimationsAnimation, and
  // XMLAnimationsSequence are defined before the parser tries to instantiate them.
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
          let scripts2Load = [];
          this.#scripts.forEach(sm=>scripts2Load.push(`xml.${sm}`));
          loadScripts(scripts2Load, true);
        }
      });
    });
  }
  
  // This is the main import point: it takes a raw XML string from disk or the editor,
  // validates it, parses it into a DOM, then builds the in-memory animation model.
  loadXML(xmlString)
  {
    // Older XML files sometimes have a malformed namespace declaration, so this line
    // repairs the known incompatibility before parsing. Without it, some files would
    // fail to load even though the data itself is valid.
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
    
    // Pull the major sections out of the XML document. These are the parts the rest of
    // the app actually cares about: metadata, sprite image, spawn rules, and animations.
    const headerElement = xmlNodeGetNode(this.#xmlDoc, 'header');
    const imageElement = xmlNodeGetNode(this.#xmlDoc, 'image');
    const spawnsElement = xmlNodeGetNode(this.#xmlDoc, 'spawns');
    const animationsElement = xmlNodeGetNode(this.#xmlDoc, 'animations');
    const childsElement = xmlNodeGetNode(this.#xmlDoc, 'childs');
    const soundsElement = xmlNodeGetNode(this.#xmlDoc, 'sounds');
    
    // These are required for a valid pet definition; the editor will refuse to continue if
    // a file is missing the essential structure.
    if(!headerElement) {console.error("HEADER element missing"); return; }
    if(!imageElement) {console.error("IMAGE element missing"); return; }
    if(!spawnsElement) {console.error("SPAWNS element missing"); return; }
    if(!animationsElement) {console.error("ANIMATIONS element missing"); return; }
    
    this.#xmlString = xmlString;
    
    // Reset the parsed model and rebuild it using the dedicated classes in the rest of the
    // XML modules. This keeps the editing UI and the serialization logic in sync.
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

    // The rest of the editor is asynchronous; wait a little before firing the event so that
    // listeners can finish their own initialization and render the new pet data.
    setTimeout(()=>{
      document.body.dispatchEvent(xmlEvent);
    }, 200);
  }

  getAnimation(id)
  {
    let ret = null;
    this.animations.forEach(a=>{
      if(a.id == id) ret = a;
    });
    return ret;
  }
  setAnimation(id, newAni)
  {
    let ret = -1;
    this.animations.forEach((a, j)=>{
      if(a.id == id && ret < 0) {
        ret = j;
      }
    });
    if(ret >= 0) this.animations.splice(ret, 1, newAni);
    return ret >= 0;
  }
  insertAnimation(id)
  {
    const newNode = new DOMParser().parseFromString(
      `<animation id="${id}"><name>newani_${id}</name><start><x>0</x><y>0</y><interval>200</interval><offsety>0</offsety><opacity>1</opacity></start><end><x>0</x><y>0</y><interval>200</interval><offsety>0</offsety><opacity>1</opacity></end><sequence repeatfrom="0" repeat="0" action="none"></sequence></animation>`, 
      "text/xml"
    ).documentElement;
    const importedNode = this.#xmlDoc.importNode(newNode, true);
    XML.animations.push(new XMLAnimationsAnimation(importedNode));
  }
  
  getImage(index=-1)
  {
    if(index < 0)
      return this.#animations.image;
    else
      return this.#animations.image.getFrameImage(index);
  }

  createElement(nodeName)
  {
    return this.#xmlDoc.createElement(nodeName);
  }

  getXml()
  {
    const a = this.#animations;
    let ret = '<?xml version="1.0" encoding="utf-8"?>\n';
    ret += `<animations \n`;
    ret += `xmlns="${a.xmlns}" \n`;
    ret += `xmlns:xsi="${a.xsi}" \n`;
    ret += `xsi:schemaLocation="${a.schemaLocation}"> \n`;
    ret += a.header.getXml();
    ret += a.image.getXml();
    ["spawns", "animations", "childs", "sounds"].forEach(node=>{
      if(a[node])
      {
        ret += `<${node}>`;
        a[node].forEach(an=>{
          ret += an.getXml();
        });
        ret += `</${node}>`;
      }
    });
    ret += "</animations>\n";
  
    return ret;
  }

  get header() { return this.#animations.header }
  get image() { return this.#animations.image }
  get spawns() { return this.#animations.spawns }
  get animations() { return this.#animations.animations }
  get childs() { return this.#animations.childs }
  get sounds() { return this.#animations.sounds }
};