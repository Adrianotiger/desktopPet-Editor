class SaveProjectFolderLocalClass extends SaveProjectFolderClass
{
  #currentProject = 0;
  #backupOldFile = true;
  #localDiv = null;

  constructor(parentDiv)
  {
    super(parentDiv);
  }

  show()
  {
    let buttSave = _CN("button", {style:"width:200px;"}, ["💾 Save"]);
    let buttSaveCopy = _CN("button", {style:"width:200px;"}, ["💾 Save as copy"]);
    _CN("table", {style:"margin:0 auto;padding:20px;"}, [_CN("tr", {}, [
      _CN("td", {}, [buttSave]),
      _CN("td", {}, [buttSaveCopy]),
    ])], this.div);

    let checkBox = _CN("input", {type:"checkbox", style:"width:24px;height:24px;margin:10px;vertical-align:middle;"});
    _CN("div", {}, [checkBox, ," Make a backup of the original file (you will find it in the .trash folder)"], this.div);
    if(this.#backupOldFile) checkBox.checked = true;
    
    buttSave.addEventListener("click", ()=>{
      this.saveAnimation(false);
    });
    buttSaveCopy.addEventListener("click", ()=>{
      this.saveAnimation(true);
    });
    checkBox.addEventListener("click", ()=>{
      this.#backupOldFile = checkBox.checked;
    });

    this.#localDiv = _CN("div", {style:"margin:0 auto;"}, [], this.div);

    //if(this.#currentProject != OpenTab.projectFolder)
    {
      this.#currentProject = OpenTab.projectFolder;
      // load new files
      this.showDirectory();
    }
  }

  async showDirectory()
  {
    this.#localDiv.innerHTML = "";
    if(this.#currentProject != null)
      _CN("h2", {}, ["Local project", " - ", this.#currentProject.folder.name], this.#localDiv);

    let div = _CN("div", {class:"aniframeeditor", style:"height:30vh;width:60vw;padding-top:30px;overflow:scroll;margin:0 auto;background:rgba(255,255,255,0.5);"}, [], this.#localDiv);
    _CN("i", {}, ["Project items"], div);


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
    else
    {
      let divIcon = _CN("div", {}, ["Re-generate icon from the xml-icon.", _CN("br")], this.div);
      _CN("button", {}, ["Replace image.png using xml-icon"], divIcon).addEventListener("click", ()=>{
        this.#generateIcon();
      });
    }
  }

  // Only available as local project
  async saveAnimation(asCopy)
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
      let filename = await this.#findValidName(`${year}${month}${day}.xml`);
      this.#save(filename, xml, false)
    }
    else
    {
      this.#save("animations.xml", xml, this.#backupOldFile);
    }
  }

  async #findValidName(filename, ext="0", folderHandle=this.#currentProject.folder)
  {
    try 
    {
      ext = ext.padStart(4, "0");
      await folderHandle.getFileHandle(filename.replace(".", `${ext}.`), { create: false });
      return await this.#findValidName(filename, `${parseInt(ext)+1}`, folderHandle); // file exists!
    } 
    catch (error) 
    {
      return filename.replace(".", `${ext}.`);
    }
  }

  async #save(filename, fileContent, old2Trash=true)
  {
    try {
      if(old2Trash)
      {
        let filename2 = await this.#findValidName(filename);
        if(filename2 != filename)
        {
          const trashHandle = await OpenTab.rootFolder.getDirectoryHandle('.trash', { create: true });

          let filename3 = await this.#findValidName(filename, "0", trashHandle);

          const fileHandleOld = await this.#currentProject.folder.getFileHandle(filename);
          await fileHandleOld.move(trashHandle, filename3);
        }
      }
      /*
      else
      {
        filename = await this.#findValidName(filename);
      }*/

      const fileHandle = await this.#currentProject.folder.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(fileContent);
      await writable.close();

      console.log(`Successfully saved: ${filename}`);
      this.#resetView();
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

      this.#resetView();
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

      this.#resetView();
    });
  }

  #resetView()
  {
    this.#currentProject = null;
    Menu.execute("save");
  }

}
