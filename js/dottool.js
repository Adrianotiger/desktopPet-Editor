class DotTool
{
  constructor(xml)
  {
    if(!xml || !Array.isArray(xml.spawns) || !Array.isArray(xml.animations))
      throw new TypeError("DotTool requires an XML animation model with spawns and animations");

    this.xml = xml;
  }

  createTree()
  {
    const nodes = [];
    const edges = [];
    const animationsById = new Map(
      this.xml.animations.map(animation=>[String(animation.id), animation])
    );
    const nodeId = (type, id) => `${type}_${String(id).replace(/[^a-zA-Z0-9_]/g, "_")}`;

    this.xml.spawns.forEach(spawn=>{
      nodes.push({
        id: nodeId("spawn", spawn.id),
        type: "spawn",
        xmlId: spawn.id,
        probability: spawn.probability,
        label: `Spawn ${spawn.id} (${spawn.probability}%)`
      });
    });

    this.xml.animations.forEach(animation=>{
      nodes.push({
        id: nodeId("animation", animation.id),
        type: "animation",
        xmlId: animation.id,
        name: animation.name,
        label: `${animation.name} (#${animation.id})`
      });
    });

    const addTransition = (from, targetId, type, transition=null)=>{
      const targetKey = String(targetId);
      let target = animationsById.get(targetKey);
      let to = nodeId("animation", targetId);

      if(!target)
      {
        to = nodeId("missing_animation", targetId);
        if(!nodes.some(node=>node.id === to))
        {
          nodes.push({
            id: to,
            type: "missing-animation",
            xmlId: targetId,
            label: `Missing animation #${targetId}`
          });
        }
      }

      const probability = transition?.probability;
      const only = transition?.only;
      const label = type === "spawn" ? "start" :
        `${type} (${probability}%, only: ${only ?? "none"})`;

      edges.push({
        from,
        to,
        type,
        targetAnimationId: targetId,
        ...(probability === undefined ? {} : {probability}),
        ...(only === undefined ? {} : {only}),
        label
      });
    };

    this.xml.spawns.forEach(spawn=>{
      const from = nodeId("spawn", spawn.id);
      (spawn.next ?? []).forEach(next=>{
        if(next) addTransition(from, next.value, "spawn");
      });
    });

    this.xml.animations.forEach(animation=>{
      const from = nodeId("animation", animation.id);
      [
        ["sequence", animation.sequence?.next],
        ["border", animation.border?.next],
        ["gravity", animation.gravity?.next]
      ].forEach(([type, transitions])=>{
        (transitions ?? []).forEach(next=>{
          if(next) addTransition(from, next.value, type, next);
        });
      });
    });

    return {name: "animations", directed: true, nodes, edges};
  }

  toDot(tree=this.createTree())
  {
    if(!tree || !Array.isArray(tree.nodes) || !Array.isArray(tree.edges))
      throw new TypeError("toDot requires a tree with nodes and edges");

    const quote = value=>`"${String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, "\\n")}"`;
    const lines = [
      "digraph animations {",
      "  graph [rankdir=LR];",
      '  node [fontname="Arial"];'
    ];
    const edgeColors = {
      sequence: "#1f77b4",
      border: "#d62728",
      gravity: "#2ca02c"
    };
    const nodesWithNext = new Set(tree.edges.map(edge=>edge.from));

    tree.nodes.forEach(node=>{
      const shape = node.type === "spawn" ? "oval" : "box";
      let style = "";
      if(node.type === "missing-animation")
        style = ", color=red, fontcolor=red";
      else if(node.type === "animation" && !nodesWithNext.has(node.id))
        style = ', style=filled, fillcolor="#fff2cc", color="#d6a400"';
      lines.push(`  ${node.id} [shape=${shape}, label=${quote(node.label)}${style}];`);
    });

    tree.edges.forEach(edge=>{
      const color = edgeColors[edge.type];
      const colorAttribute = color ? `, color="${color}", fontcolor="${color}"` : "";
      lines.push(`  ${edge.from} -> ${edge.to} [label=${quote(edge.label)}${colorAttribute}];`);
    });
    lines.push("}");
    return lines.join("\n");
  }

  downloadDot(filename="animations.dot")
  {
    if(typeof document === "undefined" || typeof URL === "undefined" || !URL.createObjectURL)
      throw new Error("Downloading a DOT file requires a browser");

    const blob = new Blob([this.toDot()], {type:"text/vnd.graphviz;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 0);
    return blob;
  }
}
