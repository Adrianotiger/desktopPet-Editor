class SaveTabClass extends TabClass
{ 
	#currentFolder = 0;
  #localDiv = null;

  constructor()
  {
    super("Save");

    _CN("h1", {}, ["Save"], this.div);
    _CN("hr", {}, [], this.div);
    
    let butt = _CN("button", {style:"width:30vw;margin:10px;"}, ["Save animations.xml as..."], this.div);
    butt.addEventListener("click", ()=>{this.saveFileDialog();});

    _CN("hr", {style:"width:80%;margin:10px auto;"}, [], this.div);

    let buttSave = _CN("button", {style:"width:200px;"}, ["💾 Save"]);
    let buttSaveCopy = _CN("button", {style:"width:200px;"}, ["💾 Save as copy"]);
    _CN("table", {style:"margin:0 auto;padding:20px;"}, [_CN("tr", {}, [
      _CN("td", {}, [buttSave]),
      _CN("td", {}, [buttSaveCopy]),
    ])], this.div);
    
    buttSave.addEventListener("click", ()=>{
      this.saveAnimation(false);
    });
    buttSaveCopy.addEventListener("click", ()=>{
      this.saveAnimation(true);
    });

    this.#localDiv = _CN("div", {style:"margin:0 auto;"}, [], this.div);
  }

  show(params)
  {
    super.show(params);
    if(this.#currentFolder != OpenTab.projectFolder)
    {
      this.#currentFolder = OpenTab.projectFolder;
      // load new files
      this.showDirectory();
    }
  }

  hide()
  {
    super.hide();
  }
  
  async saveFileDialog()
  {    
    try {
      const [fileHandle] = await window.showSaveFilePicker({
        suggestname: 'animations.xml',
        id: 'e-sheep-openfolder',
        startIn: 'downloads',
        types: [{
          description: 'Animation file',
          accept: { 'text/xml': ['.xml', '.xml'] }
        }]
      });

      const writableStream = await fileHandle.createWritable();
      // 3. Write data and close the stream
      await writableStream.write(fileContentString);
      await writableStream.close();

      Msg.show({title:"File saved", content:"File successfully saved"});
    } catch (err) {
      console.log("Canceled by user");
      return;
    }
  }

	async showDirectory()
  {
    let folderFiles = [];
    let f2;
    this.#localDiv.innerHTML = "";
    let div = _CN("div", {class:"aniframeeditor", style:"height:30vh;width:60vw;padding-top:30px;overflow:scroll;margin:0 auto;background:rgba(255,255,255,0.5);"}, [], this.#localDiv);
    _CN("i", {}, ["Project items"], div);

    if(this.#currentFolder == null)
    {
      _CN("p", {}, ["You opened or imported a single file.", _CN("br"), "Open a project to see all files on it."], div);
      return;
    }

    const files = await this.#currentFolder.entries();
    while((f2 = await files.next()))
    {
      if(f2.done) break;
      if(f2.value[1].kind === "file") 
      {
        let filename = "";
        folderFiles.push(f2.value[1].name.toLowerCase());
        switch(f2.value[1].name.toLowerCase())
        {
          case "animations.xml": filename = "fileanimations"; break;
          case "readme.md": filename = "filereadme"; break;
          case "icon.png": filename = "fileicon"; break;
          default: filename = "fileunknown"; break;
        }
        if(filename != "fileunknown")
          _CN("span", {}, [_CN("img", {class:"icon icon64", "data-icon":filename}), _CN("br"), f2.value[1].name], div);
        else
          _CN("span", {}, [_CN("img", {class:"icon", "data-icon":filename}), _CN("br"), f2.value[1].name], div);
      }
    }

    if(folderFiles.indexOf("readme.md") < 0)
    {
      _CN("span", {style:"opacity:0.2"}, [_CN("img", {class:"icon icon64", "data-icon":"filereadme"}), _CN("br"), "README.md"], div);

      let divReadme = _CN("div", {}, ["File README.md is missing. You need it, if you want upload this project to GitHub.", _CN("br")], this.div);
      _CN("button", {}, ["Generate README.md"], divReadme).addEventListener("click", ()=>{
        this.#generateReadme();
      });
    }

    if(folderFiles.indexOf("icon.png") < 0)
    {
      _CN("span", {style:"opacity:0.2"}, [_CN("img", {class:"icon icon64", "data-icon":"fileicon"}), _CN("br"), "icon.png"], div);

      let divIcon = _CN("div", {}, ["Image icon.png is missing. You need it, if you want upload this project to GitHub.", _CN("br")], this.div);
      _CN("button", {}, ["Create image.png from xml"], divIcon).addEventListener("click", ()=>{
        this.#generateIcon();
      });
    }

  }

  saveAnimation(asCopy)
  {
    const xml = XML.getXml();
    if(asCopy)
    {
      let now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: '2-digit', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
      const [{ value: month },,{ value: day },,{ value: year },,{ value: hour },,{ value: minute }] = formatter.formatToParts(now);
      this.#save(`${year}${month}${day}${hour}${minute}.xml`, xml)
    }
    else
    {
      Msg.show({title:"WARNING!", content:"Are you crazy? The editor can't destroy your original XML until it works at 100%!"});
      //this.#save("animations.xml", xml);
    }
  }

  async #save(filename, fileContent)
  {
    try {
      const fileHandle = await this.#currentFolder.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(fileContent);
      await writable.close();

      this.showDirectory();

      console.log(`Successfully saved: ${filename}`);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  #generateReadme()
  {
    alert("not implemented yet");
  }

  #generateIcon()
  {
    alert("not implemented yet");
  }
  
};

const SaveTab = new SaveTabClass();