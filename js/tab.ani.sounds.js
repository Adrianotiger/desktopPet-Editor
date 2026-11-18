
class SoundsTabClass extends TabClass
{
  #buttons = [];
  #nextId;
  #canvas = [];
  #soundsDiv = null;
  #soundDiv = null;
  #currentSound = null;
  #deleteAdded = false;

  constructor()
  {
    super("Sounds");
  }
  
  async loadSounds()
  {
    this.div.innerHTML = "";
    this.#buttons = [];
    this.#currentSound = null;

    this.#deleteAdded = false;

    _CN("h1", {}, ["Sounds"], this.div);
    _CN("hr", {style:"width:80%;margin:10px auto;"}, [], this.div);
    
    const img = XML.getImage();
    const w = (XML.getImage().getFrameWidth() + 10)+'px';
    const h = (XML.getImage().getFrameHeight() + 10 + 34)+'px';

    this.#nextId = 1;

    this.#canvas.forEach(c=>{c.animate(false);});
    this.#canvas = [];

    this.#soundsDiv = _CN("div", {style:"width:30vw;height:60vh;overflow-y:auto;margin-left:3vw;padding:2vw;float:left;"}, [], this.div);
    this.#soundDiv = _CN("div", {style:"width:50vw;padding:2vw;display:inline-block;"}, [], this.div);
        
    XML.sounds.forEach(sound=>{
      const ani = XML.getAnimation(sound.animationid);
      const canv = new AniCanvasClass(ani, img.getFrameWidth(), img.getFrameHeight());
      const i = _CN("i", {}, [`[${sound.id}]`]);
      const s = _CN("span", {}, [`# ${sound.id}`]);
      const b = _CN("button", {class:"anidiv", style:`--box-width:${w};--box-height:${h}`}, [canv.getCanvas(), i, s], this.#soundsDiv);
      
      if(sound.id >= this.#nextId) this.#nextId = sound.id + 1;

      this.#buttons.push({
        b: b, 
        c: canv
      });

      this.#canvas.push(canv);
      
      b.addEventListener("click", ()=>{
        this.editSound(sound);
      });
    });

    this.#canvas.forEach(c=>{c.animate(true);});
  }

  editSound(sound)
  {
    let inputs = [];
    let input = null;
    this.#currentSound = sound;

    if(!this.#deleteAdded)
    {
      TabMenu.addIcon("editdelete", "Remove sound", ()=>{
        XML.deleteSound(this.#currentSound.id);
        Menu.execute("sounds");
      });
      this.#deleteAdded = true;
    }

    this.#soundDiv.innerHTML = "";

    _CN("h2", {}, [`Sound #${sound.id}`, _CN("br")], this.#soundDiv);

    _CN("div", {style:"margin-top:20px;"}, ["Probability (0-100):"], this.#soundDiv);
    input = _CN("input", {type:"number", value:sound.probability, placeholder:'100', name:"probability"}, [], this.#soundDiv);
    inputs.push(input);

    _CN("div", {style:"margin-top:20px;"}, ["Loop (0 = no loop):"], this.#soundDiv);
    input = _CN("input", {type:"number", value:sound.loop, placeholder:'0', name:"loop"}, [], this.#soundDiv);
    inputs.push(input);

    input = _CN("input", {type:"hidden", value:sound.base64, name:"base64"}, [], this.#soundDiv);
    inputs.push(input);

    const audio = _CN("audio", {controls:true, style:"display:block;margin:0 auto;"}, [
      _CN("source", {src:"data:audio/mp3;base64,"+sound.base64, type:"audio/mp3"})
    ], this.#soundDiv);

    let divInfo = _CN("div", {}, [], this.#soundDiv);
    
    _CN("button", {}, ["📤 Upload MP3 📤"], this.#soundDiv).addEventListener("click", ()=>{
      this.#uploadMP3(audio, input);
    });

    setTimeout(()=>{
      let blob = this.base64ToBlob(sound.base64);
      _CN("div", {}, ["Size on XML: " + (parseInt(sound.base64.length/102.4)/10) + "kb"], divInfo);
      _CN("div", {}, ["MP3 size: " + (parseInt(blob.size/102.4)/10) + "kb"], divInfo);

      inputs.forEach((i)=>{
        i.addEventListener("change", ()=>{
          console.log("Input changed: " + i.name);
          this.updateNode(i);
        });
      });
    }, 500);

  }

  updateNode(input)
  {
    const node = input.name.toLowerCase();
    const value = input.value;
    if(!XML.getSound(this.#currentSound.id)[node])
    {
      console.error(`Node '${node}' not found in the sound XML!`);
      return;
    }
    XML.getSound(this.#currentSound.id)[node] = value;
  }
  
  show()
  {
    super.show();

    TabMenu.addIcon("editadd", "Add sound", ()=>{
      XML.insertSound(this.#nextId);
      this.loadSounds();
    });

    this.loadSounds();
  }
  
  hide()
  {
    try{this.#canvas?.forEach(c=>{c.animate(false);});}catch(e){};

    super.hide();
  }

  base64ToBlob(rawBase64) 
  {
    const byteCharacters = atob(rawBase64);

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'audio/mp3' });
  }
  
  #uploadMP3(audio, input)
  {
    let msgp = _CN("p", {}, [
      "The uploaded sound has to be a valid audio:",
      _CN("br"),
      _CN("ul", {}, [
        _CN("li", {}, ["Accepted: MP3"]),
        _CN("li", {}, ["Not over 200kb"])
      ])
    ]);
    Msg.show({
      title:"Upload audio", 
      content:msgp
    }, async ()=>{
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          id: 'e-sheep-opensound',
          startIn: 'downloads',
          excludeAcceptAllOption: true,
          multiple: false,
          types: [{
            description: 'Sound file',
            accept: { 
              'audio/mp3': ['.mp3', '.mp3']
            }
          }]
        });

        const file = await fileHandle.getFile();
        const reader = new FileReader();
        reader.readAsDataURL(file);

        const div = _CN("div", {}, ["Uploaded file: " + (parseInt(file.size/102.4)/10) + "kb"], input.parentNode);

        reader.addEventListener("load", ()=>{
          const base64 = reader.result;

          audio.src = base64;
          input.value = base64.split(",")[1];
          this.updateNode(input);

          _CN("div", {}, ["On XML: " + (parseInt(base64.length/102.4)/10) + "kb"], div);
        });

      } catch (err) {
        console.error("Error loading mp3", err);
      }
    });
  }
  
};

const SoundsTab = new SoundsTabClass();