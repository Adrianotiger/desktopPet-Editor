class XMLAnimationsSequence
{
  #repeatfrom = 0;
  #repeat = "";
  frame = [];
  next = [];
  #action = "none";
  
  constructor(xml)
  {    
    this.#repeatfrom = new XMLValue(xmlAttrGet(xml, 'repeatfrom')??0, XMLValue.Type.INT);
    this.#repeat = new XMLValue(xmlAttrGet(xml, 'repeat')??"0", XMLValue.Type.FORMULA);
    this.#action = new XMLValue(xmlNodeGet(xml, 'action')??"none", XMLValue.Type.ACTION);
    this.frame = [];
    this.next = [];
    
    [...xml.querySelectorAll('frame')].forEach(f=>{
      this.frame.push(new XMLValue(f.textContent, XMLValue.Type.INT));
    });
    
    [...xml.querySelectorAll('next')].forEach(n=>{
      this.next.push(new XMLAnimationsNext(n));
    });
  }
  
  get repeatfrom() { return this.#repeatfrom.value; }
  set repeatfrom(value) { this.#repeatfrom.value = value; }
  
  get repeat() { return this.#repeat.value; }
  set repeat(value) { this.#repeat.value = value; }
  
  get action() { return this.#action.value; }
  set action(value) { this.#action.value = value; }
  
  
};
