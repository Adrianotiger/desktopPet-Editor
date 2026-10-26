class XMLAnimationsImage extends XMLNode
{
  #tilesx = "";
  #tilesy = "";
  #png = "";
  #transparency = "Magenta";
  
  #_spritesheet = null;
  #_images = [];
  #_frameWidth = 1;
  #_frameHeight = 1;
  
  constructor(xml)
  {
    super(xml, "image");
    
    this.#tilesx = new XMLValue(xmlNodeGet(xml, 'tilesx')??1, XMLValue.Type.INT); 
    this.#tilesy = new XMLValue(xmlNodeGet(xml, 'tilesy')??1, XMLValue.Type.INT);
    
    this.#png = new XMLValue(xmlNodeGet(xml, 'png')??"iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGUlEQVR4nO3BMQEAAADCoPVP7WENoAAAAG4MIAABt9NlCQAAAABJRU5ErkJggg==", XMLValue.Type.STRING);
    
    this.#transparency = new XMLValue(xmlNodeGet(xml, 'transparency')??"Magenta", XMLValue.Type.STRING); 
    
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
  
  get tilesx() { return this.#tilesx.value; }
  set tilesx(value) { return this.#tilesx.value = value; }
  
  get tilesy() { return this.#tilesy.value; }
  set tilesy(value) { return this.#tilesy.value = value; }
  
  get png() { return this.#png.value; }
  set png(value) { return this.#png.value = value; }
  
  get transparency() { return this.#transparency.value; }
  set transparency(value) { return this.#transparency.value = value; }
  
};
