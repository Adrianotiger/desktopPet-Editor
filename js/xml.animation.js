class XMLAnimationsAnimationPos extends XMLNode
{  
  constructor(xml, title)
  {
    super(xml, title);

    super.addValue(
      "x", 
      xmlNodeGet(xml, 'x')??0, 
      XMLValue.Type.FORMULA
    );

    super.addValue(
      "y", 
      xmlNodeGet(xml, 'y')??0, 
      XMLValue.Type.FORMULA
    );

    super.addValue(
      "interval", 
      xmlNodeGet(xml, 'interval')??200, 
      XMLValue.Type.FORMULA
    );

    super.addValue(
      "offsety", 
      xmlNodeGet(xml, 'offsety')??0, 
      XMLValue.Type.INT
    );

    super.addValue(
      "opacity", 
      xmlNodeGet(xml, 'opacity')??0, 
      XMLValue.Type.DOUBLE
    );
  }
  
  get x() { return this.getValue("x"); }
  set x(value) { this.setValue("x", value); }
  
  get y() { return this.getValue("y"); }
  set y(value) { this.setValue("y", value); }
  
  get offsety() { return this.getValue("offsety"); }
  set offsety(value) { this.setValue("offsety", value); }
  
  get opacity() { return this.getValue("opacity"); }
  set opacity(value) { this.setValue("opacity", value); }
  
  get interval() { return this.getValue("interval"); }
  set interval(value) { this.setValue("interval", value); }
}

class XMLAnimationNextCollection extends XMLNode
{
  constructor(xml, nodeName)
  {
    super(xml, nodeName);

    if(xml != null)
    {
      [...xml.querySelectorAll('next')].forEach(n=>{
        super.addNode(
          "next",
          new XMLAnimationsNext(n)
        );
      });
    }
  }

  get next() { return this.getNode("next"); }
}

class XMLAnimationsAnimation extends XMLNode
{  
  constructor(xml)
  {    
    super(xml, "animation");
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

    super.addNode(
      "start",
      new XMLAnimationsAnimationPos(xml.querySelector('start'), "start")
    );
    super.addNode(
      "end",
      new XMLAnimationsAnimationPos(xml.querySelector('end'), "end")
    );
    super.addNode(
      "sequence",
      new XMLAnimationsSequence(xml.querySelector('sequence'))
    );

    super.addNode(
      "border",
      new XMLAnimationNextCollection(xml.querySelector('border')??XML.createElement("border"), "border")
    );

    super.addNode(
      "gravity",
      new XMLAnimationNextCollection(xml.querySelector('gravity')??XML.createElement("gravity"), "gravity")
    );
  }

  get id() { return this.getValue("id"); }
  set id(value) { this.setValue("id", value); }
  
  get name() { return this.getValue("name"); }
  set name(value) { this.setValue("name", value); }

  get start() { return this.getNode("start")[0]; }
  get end() { return this.getNode("end")[0]; }
  get sequence() { return this.getNode("sequence")[0]; }

  get border() { return this.getNode("border")[0]; }
  get gravity() { return this.getNode("gravity")[0]; }
};
