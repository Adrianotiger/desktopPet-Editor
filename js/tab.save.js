class SaveTabClass extends TabClass
{ 
	#currentProject = 0;
  #localDiv = null;

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

    if(this.#currentProject != OpenTab.projectFolder)
    {
      this.#currentProject = OpenTab.projectFolder;
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

	async showDirectory()
  {
    this.#localDiv.innerHTML = "";
    if(this.#currentProject != null)
      _CN("h2", {}, [this.#currentProject.isLocal ? "Local project" : "Web project", " - ", this.#currentProject.folder.name], this.#localDiv);

    let div = _CN("div", {class:"aniframeeditor", style:"height:30vh;width:60vw;padding-top:30px;overflow:scroll;margin:0 auto;background:rgba(255,255,255,0.5);"}, [], this.#localDiv);
    _CN("i", {}, ["Project items"], div);

    if(this.#currentProject == null)
    {
      _CN("p", {}, ["You opened or imported a single file.", _CN("br"), "Open a project to see all files on it."], div);
      return;
    }

    if(this.#currentProject.isLocal)
    {
      this.#showDirectoryLocal(div);
    }
    else
    {
      this.#showDirectoryWeb(div);
    }
  }

  async #showDirectoryLocal(div)
  {
    const files = await this.#currentProject.folder.entries();
    var f2;
    var folderFiles = [];
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
      this.#save(`${year}${month}${day}.xml`, xml)
    }
    else
    {
      Msg.show({title:"WARNING!", content:"Are you crazy? The editor can't destroy your original XML until it works at 100%!"});
      //this.#save("animations.xml", xml);
    }
  }

  async #findValidName(filename, ext="0")
  {
    try 
    {
      let fileHandle = await this.#currentProject.folder.getFileHandle(filename.replace(".", `${ext}.`), { create: false });
      return await this.#findValidName(filename, parseInt(ext)+1); // file exists!
    } 
    catch (error) 
    {
      return filename.replace(".", `${ext}.`);
    }
  }

  async #save(filename, fileContent)
  {
    try {
      filename = await this.#findValidName(filename);

      const fileHandle = await this.#currentProject.folder.getFileHandle(filename, { create: true });
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
    const readme = `## ${XML.header.title}-Mate\n\n${XML.header.info.replace("[br]", "\n")}`;
    const dirHandle = this.#currentProject.folder;

    dirHandle.getFileHandle("README.md", { create: true }).then(async fileHandle=>{
      // 3. Open a writable stream, write data, and save to disk
      const writable = await fileHandle.createWritable();
      await writable.write(readme);
      await writable.close();

      this.#currentProject.mdFile = true;

      this.#currentProject = null;
      Menu.execute("save");
    });
  }

  #generateIcon()
  {
    const dirHandle = this.#currentProject.folder;
    const img = new Image();
    img.src = "data:image/x-icon;base64," + XML.header.icon;
    const canvas = _CN("canvas", {width:48, height:48});
    const ctx = canvas.getContext('2d');

    dirHandle.getFileHandle("icon.png", { create: true }).then(async fileHandle=>{
      await img.decode();
      
      ctx.drawImage(img, 0, 0, 48, 48);

      // 4. Convert the canvas output into a PNG Blob
      const pngBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create PNG blob from canvas.'));
        }, 'image/png');
      });

      this.#currentProject.icon  = pngBlob;
      this.#currentProject.imageFile = true;

      const writable = await fileHandle.createWritable();
      await writable.write(pngBlob);
      await writable.close();

      this.#currentProject = null;
      Menu.execute("save");
    });
  }
  
};

const SaveTab = new SaveTabClass();