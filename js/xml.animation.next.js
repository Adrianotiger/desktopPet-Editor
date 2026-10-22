class XMLAnimationsNext
{
  #probability = 10;
  #only = "none";
  #value = 1;
  
  constructor(xml)
  {    
    this.#probability = new XMLValue(xmlAttrGet(xml, 'probability')??0, XMLValue.Type.INT);
    this.#only = new XMLValue(xmlAttrGet(xml, 'only')??"none", XMLValue.Type.STRING);
    this.#value = new XMLValue(xml.textContent, XMLValue.Type.INT);
  }
  
  get probability() { return this.#probability.value; }
  set probability(value) { this.#probability.value = value; }
  
  get only() { return this.#only.value; }
  set only(value) { this.#only.value = value; }
  
  get value() { return this.#value.value; }
  set value(value) { this.#value.value = value; }
  
};
