class XMLAnimationsSpawn extends XMLNode
{
  id = 1;
  probability = 100;
  x = "";
  y = "";
  next = [];
  
  constructor(xml)
  {    
    super();
    this.id = new XMLValue(xmlAttrGet(xml, 'id')??1, XMLValue.Type.INT);
    
    this.probability = new XMLValue(xmlAttrGet(xml, 'probability')??1, XMLValue.Type.INT);
    
    this.x = new XMLValue(xmlNodeGet(xml, 'x')??0, XMLValue.Type.STRING);
    this.y = new XMLValue(xmlNodeGet(xml, 'y')??0, XMLValue.Type.STRING);
    
    this.next = [];
    
    [...xml.querySelectorAll('next')].forEach(next=>{
      this.next.push(new XMLAnimationsSpawnNext(next));
    });
  }
  
};
