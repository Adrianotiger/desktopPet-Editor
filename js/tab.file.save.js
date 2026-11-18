
class SaveProjectFolderClass
{
  div = null;

  constructor(parentDiv)
  {
    this.div = parentDiv;
  }

  show() {}
  showDirectory() {}
  async saveAnimation() {}

}

class SaveTabClass extends TabClass
{ 
	#currentProject = 0;
  #localDiv = null;

  #localFolder = null;
  #webFolder = null;

  constructor()
  {
    super("Save");
  }

  show(params)
  {
    super.show(params);

    this.div.innerHTML = "";

    _CN("h1", {}, ["Save"], this.div);
    _CN("hr", {}, [], this.div);
    
    let butt = _CN("button", {style:"width:30vw;margin:10px;"}, ["Save animations.xml as..."], this.div);
    butt.addEventListener("click", ()=>{this.saveFileDialog();});

    _CN("hr", {style:"width:80%;margin:10px auto;"}, [], this.div);

    loadScripts(["tab.file.save.local", "tab.file.save.web"], true).then(()=>{
      if(this.#localFolder == null) this.#localFolder = new SaveProjectFolderLocalClass(this.div);
      if(this.#webFolder == null) this.#webFolder = new SaveProjectFolderWebClass(this.div);

      if(OpenTab.projectFolder != null)
      {
        if(OpenTab.projectFolder.isLocal) this.#localFolder.show();
        else this.#webFolder.show();
      }
    });

    if(OpenTab.projectFolder == null)
    {
      _CN("p", {}, ["You opened a single animations.xml file. If you open a project, you can save your project by 1 click."], this.div)
    }
  }

  hide()
  {
    super.hide();
    this.#currentProject = null;
  }
  
  async saveFileDialog()
  {    
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: 'animations.xml',
        id: 'e-sheep-openfolder',
        startIn: 'downloads',
        types: [{
          description: 'Animation file',
          accept: { 'text/xml': ['.xml', '.xml'] }
        }]
      });

      const xml = XML.getXml();
      const writableStream = await fileHandle.createWritable();
      // 3. Write data and close the stream
      await writableStream.write(xml);
      await writableStream.close();

      Msg.show({title:"File saved", content:"File successfully saved"});
    } catch (err) {
      console.log("Canceled by user", err);
      return;
    }
  }


  #showDirectoryWeb(div)
  {
    const files = ["readme.md", "icon.png", "animations.xml"];
    files.forEach(f2=>
    {
      let filename = "";
      switch(f2)
      {
        case "animations.xml": filename = "fileanimations"; break;
        case "readme.md": filename = "filereadme"; break;
        case "icon.png": filename = "fileicon"; break;
        default: filename = "fileunknown"; break;
      }
      _CN("span", {}, [_CN("img", {class:"icon", "data-icon":filename}), _CN("br"), f2], div);
    });
  }


  
  
};

const SaveTab = new SaveTabClass();