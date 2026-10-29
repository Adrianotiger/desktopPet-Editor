// Converts the <start> / <end> fragments of an animation into a small JS object.
// The rest of the app can treat these values as structured data instead of raw XML,
// while still keeping the original XML available for export/save operations.
class XMLAnimationsAnimationPos extends XMLNode
{  
  constructor(xml, title)
  {
    super(xml, title);

    // X/Y and interval are stored as formulas so the editor can accept expressions
    // such as "screenW/2" or "imageW-10" instead of only fixed numbers.
    // The null-coalescing fallback keeps older XML files valid even when a tag is missing.
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

// Some animation branches contain multiple <next> transitions (for example, a border
// or gravity path that can branch to different follow-up states). This wrapper stores
// each child <next> node as a collection so the editor can enumerate them uniformly.
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

  get next() {return this.getNode("next");}
  set next(value) {this.replaceNode("next", value);}
}

// Represents one full <animation> entry from the XML file.
// The editor is built around these objects because they expose a convenient JS API
// for the UI, while still being able to serialize back to XML later.
class XMLAnimationsAnimation extends XMLNode
{  
  constructor(xml)
  {    
    super(xml, "animation");

    // The id is a useful key when the UI wants to fetch a specific animation by number.
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
    
    // Each animation defines a start and end pose, plus a sequence of frames.
    // These sections are expected to exist; their constructors wrap the source XML and
    // will reject missing nodes rather than silently creating empty ones.
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

    // Border and gravity are not simple scalar values; they are collections of <next>
    // transitions that may lead to different follow-up animations.
    super.addNode(
      "gravity",
      new XMLAnimationNextCollection(xml.querySelector('gravity')??XML.createElement("gravity"), "gravity")
    );
    
    super.addNode(
      "border",
      new XMLAnimationNextCollection(xml.querySelector('border')??XML.createElement("border"), "border")
    );

  }

  get id() { return this.getValue("id"); }
  set id(value) { this.setValue("id", value); }
  
  get name() { return this.getValue("name"); }
  set name(value) { this.setValue("name", value); }

  // Accessors are intentionally simple: the rest of the code can write
  // animation.start.x, animation.sequence.repeat, etc., without worrying about XML DOM details.
  get start() { return this.getNode("start")[0]; }
  get end() { return this.getNode("end")[0]; }
  get sequence() { return this.getNode("sequence")[0]; }

  get border() { return this.getNode("border")[0]; }
  get gravity() { return this.getNode("gravity")[0]; }
};
