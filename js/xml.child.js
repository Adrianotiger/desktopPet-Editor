
class XMLAnimationsChildNext extends XMLNode
{  
  constructor(xml, path)
  {        
    path += ".next";
    super(xml, path);

    super.addValue(
      "_", 
      xml.textContent??xml,  /* as it can be a node or just a value */
      XMLValue.Type.INT
    );
  }
    
  get value() { return this.getValue("_"); }
  set value(value) { this.setValue("_", value); }

};

class XMLAnimationsChild extends XMLNode
{  
  constructor(xml, path="animations.childs")
  {
    path += ".child";
    super(xml, path);

    super.addAttribute(
      "animationid", 
      xmlAttrGet(xml, 'animationid')??1, 
      XMLValue.Type.INT
    );

    super.addValue(
      "x", 
      xmlNodeGet(xml, 'x')??"0", 
      XMLValue.Type.FORMULA
    );

    super.addValue(
      "y", 
      xmlNodeGet(xml, 'y')??"0", 
      XMLValue.Type.FORMULA
    );
    
    // xmlNodeGet(xml, 'next') can be a node or just a value!
    super.addNode(
      "next",
      new XMLAnimationsChildNext(xmlNodeGet(xml, 'next'), path)
    );
  }
  
  get id() { return this.getValue("animationid"); }
  set id(value) { this.setValue("animationid", value); }

  get animationid() { return this.getValue("animationid"); }
  set animationid(value) { this.setValue("animationid", value); }

  get x() { return this.getValue("x"); }
  set x(value) { this.setValue("x", value); }
  get xOriginal() { return this.values["x"].original; }

  get y() { return this.getValue("y"); }
  set y(value) { this.setValue("y", value); }
  get yOriginal() { return this.values["y"].original; }

  get next() {return this.getNode("next");}
  set next(value) {this.replaceNode("next", value);}
};
