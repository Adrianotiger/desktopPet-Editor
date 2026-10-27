class OpenTabClass extends TabClass
{  
  #folderHandler = null;
	#currentFolder = null;
  #projects = [];
  #db = null;
  #localDiv = null;

  constructor()
  {
    super("Open");
    
    let butt = _CN("button", {style:"width:30vw"}, ["Open file..."], this.div);
    butt.addEventListener("click", ()=>{this.openFileDialog();});

    this.#localDiv = _CN("div", {style:"margin:0 auto;"}, [], this.div);
    _CN("p", {}, ["Local folder is a folder accessible by the browser. This is the root folder, every subfolder is another animation project containing a animations.xml file."], this.#localDiv);
    let buttLocal = _CN("button", {style:"width:30vw;"}, ["Open local Pet folder..."], this.#localDiv);
    this.loadLocalPath(false);
    setTimeout(()=>{
      if(!this.#folderHandler)
      {
        _CN("p", {}, ["After pressing the button, select the root folder to use for your projects."], this.#localDiv);
      }
    }, 200);
    
    buttLocal.addEventListener("click", ()=>{
      this.loadLocalPath(true);
    });
  }
  
  async openFileDialog()
  {    
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

      this.openFile(file);

    } catch (err) {
      console.log("Canceled by user");
      return;
    }
  }

  async openFile(file)
  {
    let xmlString = await file.text();
      
    console.log("File opened via API:", file.name);

    XML.loadXML(xmlString);
  }

  async loadLocalPath(clicked)
  {
    if(!this.#folderHandler)
		{
			await this.#openHandlers();	
		}
    if(!this.#folderHandler)
		{
      if(!clicked) return;
			await this.#checkFolderHandler();
		}

    if(await this.#verifyPermission(this.#folderHandler, false))
		{
			this.#projects = [];
			var folders = await this.#folderHandler.entries();
			var f, f2;
			while((f = await folders.next()))
			{
				if(f.done) break;
				
				if(f.value[1].kind === "directory")
				{	
					let fqty = 0;
					var files2 = await f.value[1].entries();
					while((f2 = await files2.next())) 
					{						
						if(f2.done) break;
						fqty++;
					}
					this.#projects.push({f:f.value[1], qty:fqty});
				}
			}
			console.log(this.#projects);
			
			this.showDirectories();
		}
		else
		{
			console.log("No permission on file: ", this.#folderHandler);
		}

  }

	showDirectories()
  {
    let f2;
    this.#localDiv.innerHTML = "";
    let div = _CN("div", {class:"aniframeeditor", style:"height:60vh;width:60vw;overflow:scroll;margin:0 auto;"}, [], this.#localDiv);
    _CN("i", {}, ["Open Project"], div);
    this.#projects.forEach(async p=>{
      let s = _CN("span", {}, [_CN("img", {class:"icon", "data-icon":"folder"}), _CN("br"), p.f.name], div);
      p.files = [];
      p.xml = false;
      p.image = false;
      p.readme = false;
      const files2 = await p.f.entries();
      while((f2 = await files2.next()))
      {
        if(f2.done) break;
        if(f2.value[1].kind === "file") 
        {
          p.files.push(f2.value[1]);
          switch(f2.value[1].name.toLowerCase())
          {
            case "animations.xml": p.xml = f2.value[1]; break;
            case "readme.md": p.readme = f2.value[1]; break;
            case "icon.png": p.image = f2.value[1]; break;
          }
        }
      }
      if(p.xml)
      {
        if(p.image)
        {
          s.getElementsByTagName("img")[0].src = URL.createObjectURL( await p.image.getFile() );
        }

        s.addEventListener("click", async ()=>{
          this.openFile(await p.xml.getFile());
        });
      }
      else
      {
        s.style.opacity = 0.2;
      }
    });
    console.log(this.#projects);
  }


  // File and Folder handlers can be saved only in Databases!
  #openHandlers()
  {
		return new Promise((res, rej)=>{
			let request = indexedDB.open("eventsFileHandlers", 1);

			request.onupgradeneeded = (event)=> {
				console.warn("Database upgraded: ", event);
				this.#db = event.target.result;
				var objStore = this.#db.createObjectStore("folder", { keyPath: "indkey" });
				objStore.createIndex("indval", "indval", { unique: false });
				res(event);
			};
			request.onsuccess = (event)=> {
				this.#db = event.target.result;

				console.log("Database loaded: ", event);

				var transaction = this.#db.transaction("folder", "readonly");
				var objectStore = transaction.objectStore("folder");
				var request2 = objectStore.openCursor();
				request2.onsuccess = (e) => {
					var cursor = e.target.result;
					if(cursor) {
						this.#folderHandler = cursor.value.indval;
						cursor.continue();
					}
					res(event);
				};
			};
			request.onerror = (event)=> {
				console.error("Database error: ", event);
				rej(event);
			};
		});
  }

  // check if a handler exists
  async #checkFolderHandler()
  {
    if(this.#folderHandler === null)
    {
      if(typeof window.showDirectoryPicker === 'undefined')
      {
        Msg.show({title:"Browser error", content:"You need a new browser for this! It works only on PC-based browsers", buttons:["OK"]});
        return;
      }
      this.#folderHandler = await window.showDirectoryPicker();
      console.log(this.#folderHandler);
      if(this.#db !== null)
      {
        var transaction = this.#db.transaction(["folder"], "readwrite");
        var objStore = transaction.objectStore("folder");
        var request = objStore.get("1");
        request.onsuccess = (e)=>{
          var data = e.target.result;
          if(typeof data === 'undefined')
          {
            objStore.add({indkey:"1", indval:this.#folderHandler});
          }
          else
          {
            data.indval = this.#folderHandler;
            var requestUpdate = objStore.put(data);
          }
        };
        request.onerror = (e)=>{
          console.error("Unable to save to DB.");
        };
      }
    }
  }

  async #verifyPermission(fileHandle, withWrite) 
	{
		const opts = {};
		if (withWrite) opts.mode = "readwrite";
		
		if(!fileHandle) return false;
		if ((await fileHandle.queryPermission(opts)) === "granted") return true;
		if ((await fileHandle.requestPermission(opts)) === "granted") return true;

		return false;
	}
  
};

const OpenTab = new OpenTabClass();