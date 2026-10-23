class XMLAnimationsAnimationPos extends XMLNode
{
  #x = 0;
  #y = 0;
  #offsety = 0;
  #opacity = 1;
  #interval = 200;
  
  constructor(xml)
  {
    super();
    this.#x = new XMLValue(xmlNodeGet(xml, 'x')??0, XMLValue.Type.FORMULA);
    this.#y = new XMLValue(xmlNodeGet(xml, 'y')??0, XMLValue.Type.FORMULA);
    this.#offsety = new XMLValue(xmlNodeGet(xml, 'offsety')??0, XMLValue.Type.INT);
    this.#opacity = new XMLValue(xmlNodeGet(xml, 'opacity')??1, XMLValue.Type.DOUBLE);
    this.#interval = new XMLValue(xmlNodeGet(xml, 'interval')??"200", XMLValue.Type.FORMULA);
  }
  
  get x() { return this.#x.value; }
  set x(value) { this.#x.value = value; }
  
  get y() { return this.#y.value; }
  set y(value) { this.#y.value = value; }
  
  get offsety() { return this.#offsety.value; }
  set offsety(value) { this.#offsety.value = value; }
  
  get opacity() { return this.#opacity.value; }
  set opacity(value) { this.#opacity.value = value; }
  
  get interval() { return this.#interval.value; }
  set interval(value) { this.#interval.value = value; }
}

class XMLAnimationsAnimation extends XMLNode
{  
  start = null;
  end = null;
  sequence = null;
  border = [];
  gravity = [];
  
  constructor(xml)
  {    
    super();
    super.addAttribute(
      "id", 
      xmlAttrGet(xml, 'id')??1, 
      XMLValue.Type.INT
    );
    super.addValue(
      "name", 
      xmlNodeGet(xml, 'name')??"noname_"+this.id, 
      XMLValue.Type.STRING
    );
    
    this.start = new XMLAnimationsAnimationPos(xml.querySelector('start'));
    this.end = new XMLAnimationsAnimationPos(xml.querySelector('end'));
    
    this.sequence = new XMLAnimationsSequence(xml.querySelector('sequence'));
  }

  get id() { return this.getValue("id"); }
  set id(value) { this.setValue("id", value); }
  
  get name() { return this.getValue("name"); }
  set name(value) { this.setValue("name", value); }
};
