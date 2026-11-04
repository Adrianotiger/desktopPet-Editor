class XMLAnimationsImage extends XMLNode
{ 
  #_spritesheet = null;
  #_images = [];
  #_frameWidth = 1;
  #_frameHeight = 1;
  
  constructor(xml)
  {
    super(xml, "image");
    
    super.addValue(
      "tilesx", 
      xmlNodeGet(xml, 'tilesx')??"1", 
      XMLValue.Type.INT
    );

    super.addValue(
      "tilesy", 
      xmlNodeGet(xml, 'tilesy')??"1", 
      XMLValue.Type.INT
    );

    super.addValue(
      "png", 
      xmlNodeGet(xml, 'png')??"iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGUlEQVR4nO3BMQEAAADCoPVP7WENoAAAAG4MIAABt9NlCQAAAABJRU5ErkJggg==", 
      XMLValue.Type.CDATA
    );

    super.addValue(
      "transparency", 
      xmlNodeGet(xml, 'transparency')??"Magenta", 
      XMLValue.Type.STRING
    );

    this.#convertBase64toPNG();
  }
  
  #convertBase64toPNG()
  {
    this.#_images = [];
    this.#_spritesheet = new Image();
    this.#_spritesheet.src = "data:image/png;base64," + this.png;
    
    this.#_spritesheet.addEventListener("load", ()=>{
      console.log("spritesheet loaded");
      
      this.#_frameWidth = this.#_spritesheet.width / this.tilesx;
      this.#_frameHeight = this.#_spritesheet.height / this.tilesy;
      
      for(let j=0;j<this.tilesy;j++)
      {
        for(let k=0;k<this.tilesx;k++)
        {
          this.#_images.push(new Image());
        }
      }
      
      for(let j=0;j<this.tilesy;j++)
      {
        for(let k=0;k<this.tilesx;k++)
        {
          const canvas = _CN("canvas", {width:this.#_frameWidth, height:this.#_frameHeight});
          const ctx = canvas.getContext('2d');
          const index = k + j * this.tilesx;
          ctx.drawImage(this.#_spritesheet, k*this.#_frameWidth, j*this.#_frameHeight, this.#_frameWidth, this.#_frameHeight, 0, 0, this.#_frameWidth, this.#_frameHeight);
          canvas.toBlob((blob) => {
            this.#_images[index].src = URL.createObjectURL(blob);
          }, 'image/png');
        }
      }
    });
  }
  
  getFrameWidth() {return this.#_frameWidth;}
  getFrameHeight() {return this.#_frameHeight;}
  getFrameImage(index) {return index < this.#_images.length ? this.#_images[index] : this.#_images[0];}
  
  get tilesx() { return this.getValue("tilesx"); }
  set tilesx(value) { this.setValue("tilesx", value); }
  
  get tilesy() { return this.getValue("tilesy"); }
  set tilesy(value) { this.setValue("tilesy", value); }
  
  get png() { return this.getValue("png"); }
  set png(value) { this.setValue("png", value); }

  get transparency() { return this.getValue("transparency"); }
  set transparency(value) { this.setValue("transparency", value); }
  
};
