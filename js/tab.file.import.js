class ImportTabClass extends TabClass
{ 
  #divOptions = null;

  constructor()
  {
    super("Import");
  }

  show(params)
  {
    super.show(params);

    this.div.innerHTML = "";

    _CN("h1", {}, ["Import"], this.div);
    _CN("hr", {}, [], this.div);

    _CN("p", {style:"margin:20px;"}, ["Importing a XML will replace your current animation with the new one."], this.div);

    _CN("hr", {style:"width:80%;margin:10px auto;"}, [], this.div);
    
    let butt = _CN("button", {style:"width:30vw;margin:10px;"}, ["Load animations.xml..."], this.div);
    butt.addEventListener("click", ()=>{
      this.loadXml();
    });
    
    this.#divOptions = _CN("div", {}, [], this.div);

    _CN("b", {}, ["Coming next => Importers:"], this.div);
    _CN("ul", {}, [
      _CN("li", {}, ["Import single XML (all, only spritesheet, only xml)"]),
      _CN("li", {}, ["Import Minecraft spritesheet"]),
      _CN("li", {}, ["Import OpenPet zip"])
    ], this.div);
  }

  hide()
  {
    super.hide();
  }
  

  async loadXml()
  {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        suggestedName: 'animations.xml',
        id: 'e-sheep-openfolder',
        startIn: 'downloads',
        excludeAcceptAllOption: true,
        multiple: false,
        types: [{
          description: 'Animation file',
          accept: { 'text/xml': ['.xml', '.xml'] }
        }]
      });

      const file = await fileHandle.getFile();
      
      let xmlString = await file.text();
        
      console.log("File imported via API:", file.name);

      XML.loadXML(xmlString);

    } catch (err) {
      console.log("Canceled by user");
      return;
    }
  }
  
};

const ImportTab = new ImportTabClass();