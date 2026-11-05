# DesktopPet Editor Tutorials

This document collects the main learning material for the editor. It is intended to help you understand both the application interface and the XML structure it edits.

The editor works as a visual layer over a DesktopPet XML project. In practice, every tab in the app modifies part of the same underlying XML document, so the tabs and the XML nodes are closely related.

The tutorials are organized like this:

1. Tutorial 1: Using the application and its tabs
2. Tutorial 2: Understanding the XML nodes and project structure
3. Tutorial 3: What you can do with the editor

---

# Tutorial 1: Using the application

This first tutorial explains every tab and how to use it in the editor. Think of it as a quick user guide for the whole tool.

## 1. Opening the app

When you start the editor, the main interface shows a menu bar with sections such as File, Animations, Tools and Help.

You can:

- open an existing project file
- create a new project from a template
- save the current project
- inspect the edited XML
- open help and tutorial pages

## 2. File menu

The File menu contains the main project actions.

### Open

Use Open to open a project file (.xml) from your device or from a local pet folder.

The editor can work with:

- a single XML file
- a project folder containing a valid `animations.xml`

When a file is loaded, the editor rebuilds its internal XML data model and enables the editing sections.

### New

New creates a fresh project from the built-in template. This is useful when you want to start a new pet from scratch instead of editing an old one.

### Save

Save stores your current project. The editor writes the current XML data back to the file structure you opened or the project folder you are working with.

Tip: before saving, check the XML viewer to confirm the generated structure matches the intended animation logic.

---

<a id="header-tab"></a>

## 3. Header tab

The Header tab contains the metadata for your pet project.

Fields in this tab usually include:

- Author
- Title
- PetName
- Version
- Application
- Icon
- Info

### How to use it

- enter the author, title, and pet name for your project
- upload a 48x48 icon for the pet if needed
- write a short description in the info section
- set the project version.

The Header section is the identity of your pet. It is often the first thing a user sees when loading or using the pet.

### Notes

- The icon is stored as a base64 image string inside the XML.
- The Info text can contain a short description or notes about the pet and its reuse.

---

<a id="image-tab"></a>

## 4. Image / Spritesheet tab

This tab controls the sprite sheet used by the pet.

### Main fields

- Columns (`tilesx`)
- Rows (`tilesy`)
- Transparency key
- PNG image data

### How to use it

1. Load a base spritesheet image.
2. Set how many columns and rows the sprite sheet contains.
3. Adjust the transparency color if the sprite needs a transparent background.
4. Preview the sprite grid on the canvas.

The editor draws a grid over the image so you can see each frame cell clearly.

### Why it matters

Every animation frame is taken from this sprite sheet. If the rows/columns or transparency settings are wrong, the pet may appear broken, stretched, or visually incorrect.

---

<a id="spawns-tab"></a>

## 5. Spawns tab

The Spawn tab defines where and when pets appear in the environment.

Each spawn element represents one possible spawn condition for a pet.

### Main controls

- spawn position X and Y
- spawn animation reference
- probability
- next animation

### How to use it

- select an existing spawn from the list
- edit its X and Y position
- choose the animation it should start with
- add or remove spawns

A spawn is usually the "entry point" for a pet. It tells the system where the pet appears and which animation it should start with.

### Typical use

A simple pet might have:

- one spawn for the normal screen position
- one animation for idle movement
- a next transition to a walking or waiting state

---

<a id="animations-tab"></a>

## 6. Animations tab

This is the main animation gallery. Every animation in your pet is listed here.

### What you see

Each animation entry shows:

- its ID
- its name
- a miniature preview

### How to use it

- click an animation to open the detailed animation editor
- add new animations
- delete unnecessary ones
- rename animation entries

Animations are the heart of the pet. They describe movement, pose changes, loops, and transitions.

---

<a id="animation-editor"></a>

## 7. Animation editor

This is the most important editor in the app. It lets you create and edit a specific animation.

### Editor sections

The animation editor includes:

- animation key and name
- sequence editor
- start and end parameters
- repeat settings
- action at end of sequence
- frame list
- transition / next logic

### Main concepts

#### Start and end

Each animation has a start and end state. These values define how the animation behaves over time.

Parameters can include:

- X position
- Y position
- OffsetY
- Opacity
- Interval

#### Sequence

The sequence is the list of frames used by the animation. It controls:

- which sprite frames are shown
- the repeat count
- when to restart the loop
- the end action

#### Repeat

`repeat` controls how often the sequence is repeated. `repeatfrom` tells the engine where to restart the loop if a repeating sequence is used.

#### Action

The end action is what the animation does when the sequence ends. This can be a simple stop or a transition to another animation.

### How to use it

- choose a frame sequence
- fine-tune the start and end positions
- set repeat and loop behavior
- connect the animation to next animations through transitions
- save and close when ready

---

<a id="childs-tab"></a>

## 8. Childs tab

The Childs tab manages child objects or secondary parts attached to the pet.

These are not always visible elements like separate pets. In many projects, a child is a small secondary object linked to the main animation system.

### What it controls

- child animation id
- child X and Y offsets
- child next relationship

### How to use it

- add a child entry
- assign it to an animation id
- position it relative to the main pet
- define its follow-up action

This is useful for accessories, attached effects, small companions, or floating objects that move with the main pet.

---

<a id="sounds-tab"></a>

## 9. Sounds tab

This tab lets you attach audio to the project.

Each sound entry includes:

- animation reference
- probability
- MP3 data embedded in base64 format

### How to use it

- add a sound
- upload an MP3 file
- assign the sound to an animation id
- set probability so the sound is played sometimes instead of always

This is useful for idle noises, movement sounds, or interaction cues.

---

<a id="xml-viewer-tab"></a>

## 10. XML Viewer tab

The XML Viewer is the raw view of the project file. It shows the generated XML document and lets you compare the original source and the current modified version.

### Main actions

- view the original XML
- view the current XML
- compare both versions side by side

### Why it matters

This is the best place to understand how the visual editor maps to XML. It also helps when debugging broken animations or mismatched node values.

---

## 11. Help menu

The Help menu contains references and documentation for the project.

Available pages usually include:

- Tutorial
- Help
- Info
- Credits
- License

This is the place where you can read the documentation and find project details.

---

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

---

# Tutorial 3: What is possible with this app

This third tutorial focuses on the creative possibilities of the editor.

The app is not just for editing an XML file. It is a visual workshop for making a DesktopPet feel alive.

## 1. Build a simple pet from scratch

You can create:

- a basic idle animation
- a walking animation
- a sleeping or waiting state
- a special reaction animation

Start with a simple sprite sheet, define the grid, and create a few short animations.

## 2. Design movement and behavior

Use animation loops and transitions to make a pet:

- blink
- stretch
- walk left and right
- bounce or react to the screen edge
- follow gravity or screen logic

The transitions between animations are what make the pet feel alive rather than static.

## 3. Add visual personality

A pet can have different moods and behaviors by varying:

- animation timing
- position movement
- opacity changes
- loop lengths
- spawn placement

This lets you make a pet feel lazy, playful, curious, or energetic.

## 4. Add props and children

With the Childs tab you can attach:

- floating accessories
- little decorations
- extra movement elements
- layered effects

This is useful for creating richer scenes without building an entirely separate pet.

## 5. Add sound reactions

You can attach audio to selected animations so the pet can:

- make small sounds when moving
- play a greeting noise
- react to screen events
- create a more lively and memorable result

## 6. Test and refine in the editor

The app gives you the tools to:

- preview animations
- inspect the XML output
- compare original and current versions
- fix broken transitions or coordinates

This helps you work iteratively: edit, preview, adjust, and save.

## 7. Reuse the project in compatible systems

Because the editor writes XML, the project can be reused by other DesktopPet tools or compatible projects that understand the format.

This makes the editor useful not only for production but also for experimenting with open pet definitions.

## 8. Best practices

- keep animation names short and clear
- organize frames logically
- test before finalizing a sprite sheet
- use repeat and transition settings carefully
- compare XML before final save
- keep backups of successful projects

## 9. In one sentence

This application is a visual editor for turning a sprite sheet and a set of animation rules into a living DesktopPet project that can be saved, refined, and reused.

---

# Quick workflow checklist

If you want a simple order to follow when creating a pet, use this:

1. Open or create a project
2. Fill header metadata
3. Upload or edit the sprite sheet
4. Create spawn entry points
5. Build idle and movement animations
6. Add transitions between animations
7. Add child elements if needed
8. Add sound elements if desired
9. Preview in the app
10. Save and inspect XML

---

# Summary

The DesktopPet Editor is a visual XML editor for building and managing animated pets. The interface is organized around tabs that correspond directly to sections of the XML model. The application is designed so you can work visually without needing to manually edit every XML tag by hand.

If you think in terms of the XML structure, the editor becomes much easier to use:

- Header = project metadata
- Image = sprite sheet and tiles
- Spawns = start points and entry states
- Animations = behaviors and movement
- Childs = attached elements
- Sounds = audio for behavior
- XML Viewer = raw final result

This is the core idea behind the project: edit the pet visually, while the app generates and updates the XML for you.
