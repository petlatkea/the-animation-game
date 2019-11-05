# IDEAS for future expansion

These are some of the ideas I'd like to implement in the future, if I get the time and energy.
They are in no way prioritized, this is just my sketchpad for ideas!

## Responsiveness 
Right now, it sucks. 

Should still be based on the height of a tile (70x70px), and everything should scale to allow 10 tiles on any screen height. That would be the scaling factor. Right now the JavaScript does a lot of the calculations - but if it could be based on CSS or 10vh, that would be a lot simpler.

Speed should also scale - it shouldn't be in px/sec, but in vhs/sec or something like that - again scaled with respect to 10 tiles screenheight.

HUD should also scale accordingly - but maybe a bit different - smaller on large screens, and larger on small.

## Graphics  
* Everything should be SVG. I've tried making some of the liquid animations from SVG spritesheets, but scaling problems make it look awful.
* Add background image to each level
* Add background objects (clouds)
* ?Add foreground objects (bushes, ice, rocks?)
* ?Add torches with light-effects

## Slides
* Make it so that opening a second slide, closes the first.
* Maybe block movement when showing slides.
* **DONE** *Add ``<code>`` blocks to slides, so code doesn't have to be screenshots.*

## Boxes
* Make two different kind of boxes, some are required, some are optional! (! vs O)
* Make required boxes keep keys - you need to open all required boxes, to get the key. (key-parts: N property on each required box)

## Animations
* unBlur the screen a bit earlier when counting down.
* make locks rattle when user hasn't got the correct key
* add jumping animation to player
* add "hard-landing" animation to player (bends down from exhaustion)

## Tiles
* Add half-height platforms
* Make liquids dangerous
* **Add moving platforms**
* Add cliffs and ledges with generics ( and ) - auto-add Ledge-end things
* Add arrows > and <
* Add hanging wires with **u** and **U**
* Add working slopes - make / work depending on the following material-type
* Add moving platforms
* Add working switches and buttons
* Add working lasers (using switches to turn on and off)
* Add ladders **H** - with climb-animation, and character cling.
* Add ropes and chains
* Add working springs - for extra jump-power
* Add doors, blocking pathways

## Items
* Add pickupable items - coins, stars, gems, make key an item


## Control
* Make sure the player can't jump that far up beyond the screen-top
* Make it so the player can't move (that much) when jumping
* Allow for double-jumps, maybe enable with power-up
* Make pause-button
* Maybe pause player when showing slides


## Signs
* Make signs pop up in the correct place
* Make signs be re-activable - maybe require key-press.

## Multiplayers
* Add ekstra players, with color-hue, that follows main player
