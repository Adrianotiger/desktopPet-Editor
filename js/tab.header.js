class HeaderTabClass extends TabClass
{
  #icon = null;

  constructor()
  {
    super("Header");

    loadScripts(["../3thparty/qweneditor", "../3thparty/qwenicon"], true);
  }

  show()
  {
    super.show();

    this.div.innerHTML = "";
    _CN("h1", {}, ["Header"], this.div);
    _CN("hr", {style:"width:60%;margin:10px auto;"}, [], this.div);
    this.#createDiv();
  }
  
  hide()
  {
    super.hide();
  }
  
  #createDiv()
  {
    const header = XML.header;
    const table = _CN("table", {style:"text-align:left;width:80%;margin:0 auto;white-space:nowrap;"}, [], this.div);
    let inputs = [];
    let input;

    input = _CN("input", {type:"text", name:"Author", placeholder:"Your name", value:header.author});
    inputs.push(input);

    input = _CN("input", {type:"text", name:"Title", placeholder:"Project title", value:header.title});
    inputs.push(input);

    input = _CN("input", {type:"text", name:"PetName", placeholder:"Name of your pet", value:header.petname});
    inputs.push(input);

    input = _CN("input", {type:"text", name:"Version", placeholder:"Project version", value:header.version});
    inputs.push(input);

    input = _CN("input", {type:"text", name:"Application", placeholder:"For Application", value:header.application, readonly:true});
    inputs.push(input);

    let tdIcon = null;

    inputs.forEach((inp, j)=>{
      let tr = _CN("tr", {}, [
        _CN("td", {}, [inp.name + ": "]), 
        _CN("td", {}, [inp]),
        _CN("td", {}, [inp.placeholder])
      ], table);
      if(j == 0)
      {
        tdIcon = _CN("td", {rowspan:inputs.length, style:"width:50%;text-align:center;"}, ["Icon:", _CN("br")], tr);
      }
    });

    let inputIcon = _CN("input", {type:"hidden", name:"Icon", value:header.icon});
    inputs.push(inputIcon);

    // placeholder
    const divIcon = _CN("div", {style:"margin:30px;"}, [], tdIcon);
    this.#icon = new IconConverter(48);
    this.#icon.openIcon(header.icon).then(i=>{
      _CN("img", {src:i.src, style:"background-color:#fff;border-radius:5px;"}, [], divIcon);
    }).catch(e=>{
      Msg.show({title:"Icon error", content:"The provided icon is not valid! Please upload another image"});
    });
    _CN("button", {}, ["Upload new icon"], tdIcon).addEventListener("click", ()=>{
      this.#uploadNewIcon(divIcon, inputIcon);
    });

    let textarea = _CN("div", {id:"infotext"}, []);
    _CN("tr", {}, [
      _CN("td", {colspan:4}, ["Info:", _CN("br"), textarea])
    ], table);
    
    let inputInfo = _CN("input", {type:"hidden", name:"Info", value:header.info});
    inputs.push(inputInfo);

    const editor = new SimpleEditor(textarea, { 
      theme: 'light',
      markdown: true,
      toolbar: true,
      /*buttons: ['bold','italic','underline','heading','list','link','linebreak','undo'],*/
      buttons: ['link','linebreak','undo'],
      maxheight:"30vh",
      onChange: ()=>{
        inputInfo.value = editor.getContent();
        this.updateNode(inputInfo);
      }
    });
    editor.setContent(header.info);

    setTimeout(()=>{
      inputs.forEach((i)=>{
        i.addEventListener("change", ()=>{
          console.log("Input changed: " + i.name);
          this.updateNode(i);
        });
      });
    }, 500);
  }

  #uploadNewIcon(div, inp)
  {
    Msg.show({
      title:"Upload icon", 
      content:_CN("p", {}, [
        "The uploaded image has to be a valid image (PNG, JPG, BMP or ICO) and should have a resolution of 48x48.",
        _CN("br"),
        "Bigger images will be scaled and/or clipped to 48x48."
      ])
    }, async ()=>{
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          id: 'e-sheep-openicon',
          startIn: 'downloads',
          excludeAcceptAllOption: true,
          multiple: false,
          types: [{
            description: 'Image file',
            accept: { 
              'image/png': ['.png', '.png'],
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/bmp': ['.bmp', '.bmp'],
              'image/x-icon': ['.ico', '.ico']
            }
          }]
        });

        const file = await fileHandle.getFile();
        const blob = await this.#icon.convertIcon(file);

        let img = null;
        const imgs = div.getElementsByTagName("img");
        if(imgs && imgs.length > 0) img = imgs[0];
        else img = _CN("img", {}, [], div);

        const base64 = await this.#icon.blobToBase64(blob);

        img.src = base64;
        inp.value = base64.substring(base64.indexOf(",")+1);

        this.updateNode(inp);

      } catch (err) {
        console.error("Error loading icon", err);
      }
    });
  }

  updateNode(input)
  {
    const node = input.name.toLowerCase();
    const value = input.value;
    if(!XML.header[node])
    {
      console.error(`Node '${node}' not found in the header XML!`);
      return;
    }
    XML.header[node] = value;
  }
  
};

const HeaderTab = new HeaderTabClass();