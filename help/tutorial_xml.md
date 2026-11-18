
# Tutorial 2: Understanding the XML nodes

This second tutorial explains the main XML structure used by the editor. It is the XML version of the same project you edit visually.

The root tag is usually:

```xml
<animations>
```

Inside it, the editor expects the following main sections:

- header
- image
- spawns
- animations
- childs
- sounds

---

## 1. Root node: `animations`

The root document describes a complete set of pet data.

Example:

```xml
<animations xmlns="https://esheep.petrucci.ch/">
  ...
</animations>
```

This root element groups all pet data together: metadata, sprite sheet, spawn states, animations, additional children, and sound data.

---

## 2. Header node

The header contains general project information.

```xml
<header>
  <author>Your name</author>
  <title>Project name</title>
  <petname>Pet name</petname>
  <version>1.0</version>
  <info>Project description</info>
  <application>1</application>
  <icon><![CDATA[...]]></icon>
</header>
```

### Fields

- `author`: creator of the project
- `title`: internal or visible project title
- `petname`: pet name shown by the application
- `version`: version number of the project
- `info`: short description or credits
- `application`: application type / project target
- `icon`: image encoded as base64 or binary data

This is the metadata of your pet project and is the same data you edit in the Header tab.

---

## 3. Image node

The image node defines the sprite sheet and its grid.

```xml
<image>
  <tilesx>4</tilesx>
  <tilesy>2</tilesy>
  <transparency>Magenta</transparency>
  <png>...</png>
</image>
```

### Fields

- `tilesx`: number of columns in the spritesheet
- `tilesy`: number of rows in the spritesheet
- `transparency`: transparency color used by the pet
- `png`: image data in base64 format

### Why it matters

The sprite sheet is the visual source for every animation frame. The grid size must match the sprite layout or the pet will appear incorrectly.

---

## 4. Spawn node

A spawn defines a possible location and state where the pet appears.

```xml
<spawn id="1" probability="100">
  <x>0</x>
  <y>0</y>
  <next probability="100">1</next>
</spawn>
```

### Fields

- `id`: unique identifier of the spawn
- `probability`: chance or priority for this spawn
- `x`: horizontal start position
- `y`: vertical start position
- `next`: the next animation or state after the spawn

### Meaning

A spawn is not just a visual position. It is also a state machine entry point. It tells the pet where to appear and what animation to start with.

---

## 5. Animation node

The animation node is the main behavior block. It defines a full movement or action sequence.

```xml
<animation id="1">
  <name>idle</name>
  <start> ... </start>
  <end> ... </end>
  <sequence repeat="0" repeatfrom="0" action="none">
    <frame>0</frame>
    <frame>1</frame>
    <frame>2</frame>
  </sequence>
  <border>
    <next probability="100" only="none">2</next>
  </border>
  <gravity>
    <next probability="100" only="none">3</next>
  </gravity>
</animation>
```

### Fields

- `id`: unique animation id
- `name`: readable animation name
- `start`: start values for the animation
- `end`: end values for the animation
- `sequence`: the ordered list of frames used in the animation
- `border`: transition rules near screen edges
- `gravity`: transition rules for gravity-related states

---

## 6. Start and end nodes

The `start` and `end` blocks control animation motion and timing.

```xml
<start>
  <x>0</x>
  <y>0</y>
  <offsety>0</offsety>
  <opacity>1</opacity>
  <interval>200</interval>
</start>
```

### Meaning

These values define the beginning and ending characteristics of an animation.

- `x` and `y`: position values
- `offsety`: vertical offset for the frame
- `opacity`: transparency level
- `interval`: time between frames or motion changes

The editor interpolates between the start and end values during the animation. This is how smooth movement is created.

---

## 7. Sequence node

The sequence node is a collection of frames and loop settings.

```xml
<sequence repeat="0" repeatfrom="0" action="none">
  <frame>0</frame>
  <frame>1</frame>
  <frame>2</frame>
  <next probability="100">4</next>
</sequence>
```

### Fields

- `repeat`: how many times to repeat the sequence
- `repeatfrom`: frame index where the loop should restart
- `action`: final behavior at the end of the sequence
- `frame`: list of sprite frame numbers
- `next`: follow-up transition after the sequence

### Notes

- Frame numbers refer to cells in the sprite sheet.
- `repeat` and `repeatfrom` are important for idle or looping animations.
- The action may be used to stop, continue, or route to another animation.

---

## 8. Next node

Next transitions connect one animation, spawn, or child node to another.

```xml
<next probability="70" only="none">2</next>
```

### Fields

- `probability`: chance that this direction is selected
- `only`: optional restriction for this transition
- text content: target animation, spawn, or child id

The editor uses `next` elements to create state transitions and branching logic.

This is how pets can move from idle to walking, from walking to bounce, or from sleeping to awake states.

---

## 9. Child node

A child is an attached or secondary element linked to the main pet.

```xml
<child animationid="8">
  <x>imageX</x>
  <y>imageY</y>
  <next>1</next>
</child>
```

### Fields

- `animationid`: parent animation or child connection id
- `x`: horizontal offset
- `y`: vertical offset
- `next`: follow-up animation or logic

This is useful for accessories, overlays, or extra animated parts that are controlled by the main pet state.

---

## 10. Sound node

A sound node embeds audio for a specific animation or pet state.

```xml
<sound animationid="3">
  <probability>50</probability>
  <base64>...</base64>
</sound>
```

### Fields

- `animationid`: animation this sound belongs to
- `probability`: random chance for playback
- `base64`: MP3 content encoded as base64

This lets a pet react with sound in a controlled and lightweight way.
