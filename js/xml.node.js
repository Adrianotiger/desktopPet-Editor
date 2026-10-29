class XMLNode
{
  // Keep the parsed contents in separate collections: values/attributes are wrapped
  // as XMLValue objects, while child elements are stored as XMLNode (or XMLValue) lists.
  values = {};
  nodes = {};
  attributes = [];
  // The source DOM node is retained so this model can be cloned or returned unchanged.
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
    // XMLValue preserves the source text while exposing a typed value to the editor.
    this.values[key] = new XMLValue(value, type); 
  }

  addAttribute(key, value, type)
  {
    // Attributes share the same value handling as elements; this list marks which
    // entries must be written into the opening tag during serialization.
    this.values[key] = new XMLValue(value, type); 
    this.attributes.push(key);
  }

  addNode(key, node)
  {
    // Store children as lists because XML can contain multiple elements with the same tag.
    if(!this.nodes[key])
      this.nodes[key] = [];

    if(node) this.nodes[key].push(node);
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
    // Only keys initialized by the node's constructor can be edited through this API.
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
    // Validate recursively so callers can check an entire XML tree from its root.
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
    // Reconstruct this same model type from a deep copy, keeping the clone independent
    // from changes made to the original DOM tree.
    return new this.constructor(this.#xml.cloneNode(true));
  }

  getXml(original = false)
  {
    // Use the original DOM node when requested; otherwise rebuild the element from the
    // model's values and children so edited content can be exported.
    if(original) return this.#xml;

    // no node and no values... Empty tag can (or better NEED TO) be removed!
    if(Object.keys(this.values).length == 0 && 
      Object.keys(this.nodes).length == 0 &&
      this.attributes.length == 0) 
        return "";

    let ret = `<${this.#nodeName}`;
    this.attributes.forEach(a=>{
      ret += ` ${a}="${this.values[a].original}"`;
    });
    ret += `>`;

    Object.keys(this.values).forEach(k=>{
      if(this.attributes.indexOf(k) < 0) // only if not in the attributes
      {
        // "_" is the convention for text directly inside an element, such as <next>42</next>.
        if(k=="_") ret += `${this.values[k].original}`;
        else ret += `<${k}>${this.values[k].original}</${k}>`;
      }
    });

    Object.keys(this.nodes).forEach(k=>{
      this.nodes[k].forEach(nk=>{
        // A child may be plain text content (XMLValue) or another structured XMLNode.
        if(nk instanceof XMLValue) ret += `<${k}>${nk.original}</${k}>`;
        else ret += nk.getXml(false);
      });
    });
    
    ret += `</${this.#nodeName}>`;
    return ret;
  }

};
