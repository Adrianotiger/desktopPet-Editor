class XMLAnimationsSequence extends XMLNode
{  
  constructor(xml)
  {    
    super(xml, "sequence");

    super.addAttribute(
      "repeatfrom", 
      xmlAttrGet(xml, 'repeatfrom')??0, 
      XMLValue.Type.INT
    );

    super.addAttribute(
      "repeat", 
      xmlAttrGet(xml, 'repeat')??0, 
      XMLValue.Type.FORMULA
    );

    super.addValue(
      "action", 
      xmlNodeGet(xml, 'action')??"none", 
      XMLValue.Type.ACTION
    );
    
    [...xml.querySelectorAll('frame')].forEach(f=>{
      super.addNode(
        "frame",
        new XMLValue(f.textContent, XMLValue.Type.INT)
      );
    });
    
    [...xml.querySelectorAll('next')].forEach(n=>{
      super.addNode(
        "next",
        new XMLAnimationsNext(n)
      );
      //this.next.push(new XMLAnimationsNext(n));
    });
  }
  
  get repeatfrom() { return this.getValue("repeatfrom"); }
  set repeatfrom(value) { this.setValue("repeatfrom", value); }
  
  get repeat() { return this.getValue("repeat"); }
  set repeat(value) { this.setValue("repeat", value); }

  get action() { return this.getValue("action"); }
  set action(value) { this.setValue("action", value); }

  get frame() {return this.getNode("frame");}
  set frame(value) {this.replaceNode("frame", value);}

  get next() {return this.getNode("next");}

  get repeatOriginal() { return this.values["repeat"].original; }
    
  
};
