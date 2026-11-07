
class XMLAnimationsSpawn extends XMLNode
{  
  constructor(xml, path="animations.spawns")
  {
    path += ".spawn";
    super(xml, path);

    super.addAttribute(
      "id", 
      xmlAttrGet(xml, 'id')??1, 
      XMLValue.Type.INT
    );

    super.addAttribute(
      "probability", 
      xmlAttrGet(xml, 'probability')??100, 
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
    
    [...xml.querySelectorAll('next')].forEach(n=>{
      super.addNode(
        "next",
        new XMLAnimationsSpawnNext(n, path)
      );
    });
  }
  
  get id() { return this.getValue("id"); }
  set id(value) { this.setValue("id", value); }

  get probability() { return this.getValue("probability"); }
  set probability(value) { this.setValue("probability", value); }

  get x() { return this.getValue("x"); }
  set x(value) { this.setValue("x", value); }
  get xOriginal() { return this.values["x"].original; }

  get y() { return this.getValue("y"); }
  set y(value) { this.setValue("y", value); }
  get yOriginal() { return this.values["y"].original; }

  get next() {return this.getNode("next");}
  set next(value) {this.replaceNode("next", value);}
};
