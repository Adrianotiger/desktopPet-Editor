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

    const frames = [...xml.querySelectorAll('frame')];
    frames.forEach(f=>{
      super.addNode(
        "frame",
        new XMLValue(f.textContent, XMLValue.Type.INT)
      );
    });
    if(frames.length == 0) super.addNode("frame", null); // create empty array

    // action can be empty!
    super.addValue(
      "action", 
      xmlHasNode(xml, 'action')?xmlNodeGet(xml, 'action'):XMLValue.Action.NONE, 
      XMLValue.Type.ACTION
    );
    
    const nexts = [...xml.querySelectorAll('next')];
    nexts.forEach(n=>{
      super.addNode(
        "next",
        new XMLAnimationsNext(n)
      );
      //this.next.push(new XMLAnimationsNext(n));
    });
    if(nexts.length == 0) super.addNode("next", null); // create empty array
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
  set next(value) {this.replaceNode("next", value);}

  get repeatOriginal() { return this.values["repeat"].original; }
    
  
};
