class XMLNode
{
  values = {};
  nodes = {};
  attributes = [];
  #nodeName = "";
  #xml = null;

  constructor(originalXml, name)
  {
    this.#xml = originalXml;
    this.#nodeName = name;
    if(!originalXml) throw Error("Invalid XML param");
    if(!name) throw Error("No name set");
  }

  addValue(key, value, type)
  {
    this.values[key] = new XMLValue(value, type); 
  }

  addAttribute(key, value, type)
  {
    this.values[key] = new XMLValue(value, type); 
    this.attributes.push(key);
  }

  addNode(key, node)
  {
    // node already exists
    if(!this.nodes[key])
      this.nodes[key] = [];

    this.nodes[key].push(node);
  }

  replaceNode(key, node)
  {
    this.nodes[key] = node;
  }

  getValue(key)
  {
    return this.values[key].value;
  }

  setValue(key, value)
  {
    if(!Object.keys(this.values).includes(key))
    {
      console.error(`Key ${key} not found in node`);
      return;
    }
    this.values[key].value = value;
  }

  getNode(key)
  {
    return this.nodes[key];
  }

  check()
  {
    let errors = [];
    Object.keys(this.nodes).forEach(k=>{
      this.nodes[k].forEach(tn=>{
        const err = tn.check();
        if(err && err.length > 0) errors = errors.concat(tn.check());
      });
    });

    Object.keys(this.values).forEach(k=>{
      const v = this.values[k];
      const err = v.check();
      if(err) errors.push({node:this, name:k, value:v, msg:err});
    });

    return errors;
  }

  clone()
  {
    if(!this.#xml) throw new Error(`Cannot clone ${this.constructor.name} without its source XML`);
    return new this.constructor(this.#xml.cloneNode(true));
  }

  getXml(original = false)
  {
    if(original) return this.#xml;

    let ret = `<${this.#nodeName}`;
    this.attributes.forEach(a=>{
      ret += ` ${a}="${this.values[a].original}"`;
    });
    ret += `>`;
    Object.keys(this.nodes).forEach(k=>{
      this.nodes[k].forEach(nk=>{
        if(nk instanceof XMLValue) ret += `<${k}>${nk.original}</${k}>`;
        else ret += nk.getXml(false);
      });
    });
    Object.keys(this.values).forEach(k=>{
      if(this.attributes.indexOf(k) < 0) // only if not in the attributes
      {
        if(k=="_") ret += `${this.values[k].original}`;
        else ret += `<${k}>${this.values[k].original}</${k}>`;
      }
    });
    ret += `</${this.#nodeName}>`;
    return ret;
  }

};
