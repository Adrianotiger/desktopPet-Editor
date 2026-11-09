class ImageTabClass extends TabClass
{
  #spritesheet = null;
  #canvas = null;
  #inputs = [];
  #log = "";

  constructor()
  {
    super("Image");

    loadScripts(["../3thparty/pako", "../3thparty/upng"], true);
  }

  show()
  {
    super.show();

    this.div.innerHTML = "";
    _CN("h1", {}, ["Spritesheet"], this.div);
    _CN("hr", {style:"width:60%;margin:10px auto;"}, [], this.div);
    this.#createDiv();
  }
  
  hide()
  {
    super.hide();
  }
  
  #createDiv()
  {
    const image = XML.image;
    const table = _CN("div", {style:"width:80%;margin:0 auto;display:flex;flex-wrap:wrap;justify-content:center;gap:5px 20px;"}, [], this.div);
    this.#inputs = [];
    let input;
    let flexElements = ["Columns", "Rows", "Transparency-Key", "Skins"];

    INPUT.setContainer(this.div);
    INPUT.setNode(image);

    //input = _CN("input", {type:"number", name:"tilesx", min:1, placeholder:"1", value:image.tilesx});
    //this.#inputs.push(input);
    this.#inputs.push(INPUT.createInput("tilesx", "1"));

    //input = _CN("input", {type:"number", name:"tilesy", min:1, placeholder:"1", value:image.tilesy});
    //this.#inputs.push(input);
    this.#inputs.push(INPUT.createInput("tilesy", "1"));

    //input = _CN("input", {type:"text", name:"transparency", placeholder:"Magenta", value:image.transparency});
    //this.#inputs.push(input);
    this.#inputs.push(INPUT.createInput("transparency", "Magenta"));

    this.#inputs.push(INPUT.createInput("skins", "1"));

    flexElements.forEach((fe, j)=>{
      _CN("span", {}, [
        _CN("h3", {}, [fe]),
        this.#inputs[j]
      ], table);
    });

    this.#canvas = _CN("canvas", {width:800, height: 600});

    _CN("div", {style:"max-width:90vw;overflow:auto;"}, [
      this.#canvas, 
      _CN("hr"),
      INPUT.getHelp("png")
    ], this.div);
    
    this.#spritesheet = new Image();
    this.#spritesheet.addEventListener("load", ()=>{
      this.updateCanvas();
    });
    this.#spritesheet.src = `data:image/png;base64,${image.png}`;

    input = _CN("input", {type:"hidden", name:"png", placeholder:"", value:image.png});
    this.#inputs.push(input);

    TabMenu.addIcon("edituploadimage", "Upload spritesheet", ()=>{
      this.#uploadNewSpritesheet(input);
    });

    setTimeout(()=>{
      this.#inputs.forEach((i)=>{
        i.addEventListener("change", ()=>{
          this.updateNode(i);
          console.log("Input changed: " + i.name);
        });
      });
    }, 500);
  }

  #uploadNewSpritesheet(inputImage)
  {
    let msgp = _CN("p", {}, [
      "The uploaded image has to be a valid image:",
      _CN("br"),
      _CN("ul", {}, [
        _CN("li", {}, ["Accepted: PNG"]),
        _CN("li", {}, ["Valid spritesheet: grid tiled images"])
      ])
    ]);
    Msg.show({
      title:"Upload spritesheet", 
      content:msgp
    }, async ()=>{
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          id: 'e-sheep-openspritesheet',
          startIn: 'downloads',
          excludeAcceptAllOption: true,
          multiple: false,
          types: [{
            description: 'Image file',
            accept: { 
              'image/png': ['.png', '.png']
            }
          }]
        });

        const file = await fileHandle.getFile();
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.addEventListener("load", ()=>{
          const base64 = reader.result;

          this.#spritesheet.src = base64;

          //console.log(`Original PNG: ${parseInt(base64.length/102.4)/10} kb`);

          this.#log = `Original PNG: ${parseInt(base64.length/102.4)/10}kb`;

          setTimeout(async ()=>{
            const ctx = this.#canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, this.#canvas.width, this.#canvas.height);

            const colors = 256; 
            const rgba = new Uint8Array(imageData.data.buffer);
            const quantized = UPNG.quantize([rgba], colors);

            const compressedArrayBuffer = UPNG.encode(quantized.bufs, this.#canvas.width, this.#canvas.height, 0);

            const indexedPngBlob = new Blob([compressedArrayBuffer], { type: 'image/png' });

            const arrayBuffer = await indexedPngBlob.arrayBuffer();
            const byteArray = new Uint8Array(arrayBuffer);
            const base64String = byteArray.toBase64(); 

            this.#spritesheet.src = "data:image/png;base64," + base64String;

            inputImage.value = base64String;
            this.updateNode(inputImage);

            //console.log(`Compressed 256 PNG: ${parseInt(base64String.length/102.4)/10} kb`);
            this.#log += ` Compressed 256 PNG: ${parseInt(base64String.length/102.4)/10}kb`;
          }, 1000);
        });

      } catch (err) {
        console.error("Error loading icon", err);
      }
    });
  }

  updateCanvas()
  {
    this.#canvas.width = this.#spritesheet.width;
    this.#canvas.height = this.#spritesheet.height;

    const ctx = this.#canvas.getContext('2d');
    ctx.drawImage(this.#spritesheet, 0, 0);

    // draw grid
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (let x = 0; x <= this.#canvas.width; x += this.#spritesheet.width / this.#inputs[0].value) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.#canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= this.#canvas.height; y += this.#spritesheet.height / this.#inputs[1].value) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.#canvas.width, y);
      ctx.stroke();
    }

    console.log(this.#log + ` tile: ${this.#spritesheet.width / this.#inputs[0].value}x${this.#spritesheet.height / this.#inputs[1].value} px`);
  }

  updateNode(input)
  {
    const node = input.name.toLowerCase();
    const value = input.value;
    if(!XML.image[node])
    {
      console.error(`Node '${node}' not found in the header XML!`);
      return;
    }
    XML.image[node] = value;
    this.updateCanvas();
  }
  
};

const ImageTab = new ImageTabClass();