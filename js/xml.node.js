class XMLNode
{
  values = {};
  nodes = {};
  attributes = [];

  constructor()
  {

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

  check()
  {
    let errors = [];
    Object.keys(this.nodes).forEach(k=>{
      errors = errors.concat(t.nodes[k].check());
    });

    Object.keys(this.values).forEach(k=>{
      const v = this.values[k];
      const err = v.check();
      if(err) errors.push({node:this, name:k, value:v, msg:err});
    });

    return errors;
  }
};
