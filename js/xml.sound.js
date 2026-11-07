
class XMLAnimationsSound extends XMLNode
{  
  constructor(xml, path="animations.sounds")
  {
    path += ".sound";
    super(xml, path);

    super.addAttribute(
      "animationid", 
      xmlAttrGet(xml, 'animationid')??1, 
      XMLValue.Type.INT
    );

    super.addValue(
      "probability", 
      xmlNodeGet(xml, 'probability')??100, 
      XMLValue.Type.INT
    );

    super.addValue(
      "base64", 
      xmlNodeGet(xml, 'base64')??"", 
      XMLValue.Type.CDATA
    );

  }
  
  get id() { return this.getValue("animationid"); }
  set id(value) { this.setValue("animationid", value); }

  get animationid() { return this.getValue("animationid"); }
  set animationid(value) { this.setValue("animationid", value); }

  get probability() { return this.getValue("probability"); }
  set probability(value) { this.setValue("probability", value); }


  get base64() {return this.getValue("base64");}
  set base64(value) {this.setValue("base64", value);}
};
