class OpenTabClass extends TabClass
{  
  constructor()
  {
    super("Open");
    
    let butt = _CN("button", {style:"width:30vw"}, ["Open file..."], this.div);
    butt.addEventListener("click", ()=>{this.openFileDialog();});
  }
  
  async openFileDialog()
  {
    let xmlString = "";
    
    try {
      const [fileHandle] = await window.showOpenFilePicker({
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
      xmlString = await file.text();
      
      console.log("File opened via API:", file.name);

    } catch (err) {
      console.log("Canceled by user");
      return;
    }
    
    XML.loadXML(xmlString);
  }
  
};

const OpenTab = new OpenTabClass();