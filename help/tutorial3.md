

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
