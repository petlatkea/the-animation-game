"use strict";

window.addEventListener("load", start);
window.addEventListener("resize", calculateSizes);

const HTML = {};
const gravity = .3;
let TILESIZE = 1;


function start() {
  console.log("start");

  // easy selectors
  getSelectors();

  // build level
  buildLevel();


  // calculate sizes
  calculateSizes();

   // register keyboard
   document.addEventListener("keydown", key);
   document.addEventListener("keyup", key);

  // start animation loop
  requestAnimationFrame( animationLoop );
  // drop player
  resetPlayer();
  dropPlayer();
}

function calculateSizes() {
  TILESIZE = tiles[0][0].element.width;
  player.width = HTML.player.offsetWidth;
  player.regX = player.width / 2;
  player.height = HTML.player.offsetHeight;
  player.regY = player.height /2;

  // TODO: These custom calculations for the hitbox, should really be configurable somehow ...
  player.hitX = player.width/8*1.8;
  player.hitY = player.height/8*1.3;
  player.hitW = player.width/8*4;
  player.hitH = player.height/8 * 5.5;

}

function animationLoop() {
  requestAnimationFrame( animationLoop );

  movePlayer();

  handlePlayerCollisions();

  animatePlayer();

  // TODO: handle camera

  drawPlayer();
}

const player = {
  x: 0,
  y: 0,
  regX:  50,
  regY:  32,
  width:  100,
  height:  64,
  hitX:  32,
  hitW:  32,
  hitY:  4,
  hitH:  55,
  speedX:  0,
  speedY:  0,
  direction:  1,
  walkSpeed:  3,
  jumpPower:  12,
  alive:  true,
  hasKey:  false,
  
  // The sprite property has a setter to avoid resetting it to the same value over and over
  set sprite( spriteName ) {
    if( spriteName !== this._sprite ) {

      // remove old class from player.sprite
      HTML.player.classList.remove( this._sprite );
      // set new class
      HTML.player.classList.add( spriteName );

      this._sprite = spriteName;
    }
  },

  get sprite() {
    return this._sprite;
  }
}

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false
};

function key(evt) {
  const value = evt.type === "keydown";
  let preventDefault = true;

  if(evt.code=="ArrowUp") {
    keys.up = value;
  } else if(evt.code=="ArrowDown") {
      keys.down = value;
  } else if(evt.code=="ArrowLeft") {
      keys.left = value;
  } else if(evt.code=="ArrowRight") {
      keys.right = value;
  } else if(evt.code=="Space") {
      keys.space = value;
  } else {
    // no valid key
    preventDefault = false;
  }

  if( preventDefault ) {
    evt.preventDefault();
  }
}


function canMove( object, offsetX, offsetY ) {
  // // test if outside canvas
  if( object.x-object.regX+object.hitX+offsetX < 0 ||
      object.x-object.regX+object.hitX+object.hitW+offsetX >= HTML.stage.scrollWidth ||
      //object.y-object.regY+object.hitY+offsetY < 0 ||
      object.y-object.regY+object.hitY+object.hitH+offsetY > HTML.stage.scrollHeight ) {
      return false;
  } 
  
   // find the list of tile-coordinates that the object touches (from the given position)
  // find leftmost, rightmost, top and bottom tile
  let leftTile = Math.floor((object.x-object.regX+object.hitX+offsetX) / TILESIZE);
  let rightTile = Math.floor((object.x-object.regX+object.hitX+object.hitW+offsetX) / TILESIZE);
  let topTile = Math.floor((object.y-object.regY+object.hitY+offsetY) / TILESIZE);
  let bottomTile = Math.floor((object.y-object.regY+object.hitY+object.hitH+offsetY) / TILESIZE);

  let canMove = true;
  
  for( let x=leftTile; x <= rightTile; x++ ) {
      for( let y=topTile; y <= bottomTile; y++ ) {
        if( y < 0 || y >= tiles.length ) {
          canMove = canMove && true;
        } else {

        
          let tile = tiles[y][x];
       
          // ask if we can move to the specified position on this tile
          // TODO: Maybe x and y should be offset rather than absolutes ...
          canMove = canMove && canMoveToTile( object, tile, object.x-object.regX+offsetX-tile.x, object.y-object.regY+offsetY );
          // TODO: Can't move into boxes from below!
        }
      }
  }
  
  // // Check moving platforms!
  // platforms.forEach( platform => {
  //     // does player touch us?
  //     if( object.y-object.regY+object.hitY+object.hitH < platform.y-platform.regY &&
  //         predictiveHitTest(object, platform, offsetX, offsetY)  ) {
  //         canMove = canMove & false;
  //     }
  // });

  
  return canMove;
}

function predictiveHitTest( objA, objB, offsetAx=0, offsetAy=0 ) {
  if( objB.x-objB.regX+objB.hitX < objA.x-objA.regX+objA.hitX+objA.hitW+offsetAx &&
      objB.x-objB.regX+objB.hitX+objB.hitW > objA.x-objA.regX+objA.hitX+offsetAx &&
      objB.y-objB.regY+objB.hitY+objB.hitH > objA.y-objA.regY+objA.hitY+offsetAy &&
      objB.y-objB.regY+objB.hitY < objA.y-objA.regY+objA.hitY+objA.hitH+offsetAy ) {
      return true;
  } else {
      return false;
  }
}

function handlePlayerCollisions() {
  // handle all the tiles the player is touching
  // - reuse code from canMoveTo
  let leftTile = Math.floor((player.x-player.regX+player.hitX) / TILESIZE);
  let rightTile = Math.floor((player.x-player.regX+player.hitX+player.hitW) / TILESIZE);
  let topTile = Math.floor((player.y-player.regY+player.hitY) / TILESIZE);
  let bottomTile = Math.floor((player.y-player.regY+player.hitY+player.hitH) / TILESIZE);

  for( let x=leftTile; x <= rightTile; x++ ) {
      for( let y=topTile; y <= bottomTile; y++ ) {
          /* Maybe handle items later ...
          let item = items[y][x];
          
          if(item != null ) {
              if( predictiveHitTest(player,item) ) {
                  console.log("touch item! " + item.type);
                  if( item.type == "star" ) {
                      // play random bell-sound
                      let nr = Math.floor(Math.random()*4)+1;
                      createjs.Sound.play("sndBell"+nr);
                      // TODO: Remove with animation
                      
                      // remove star
                      stage.removeChild(item);
                      items[y][x] = null;
                  } else if( item.type == "keyBlue") {
                      createjs.Sound.play("sndKey");
                      stage.removeChild(item);
                      items[y][x] = null;
                      
                      player.hasKey = true;
                  }
              }
          } */
          
          if( 0 <= y && y < tiles.length ) {

            
            let tile = tiles[y][x];
            const distance = Math.hypot( (x*TILESIZE-TILESIZE/2) - (player.x-player.regX), (y*TILESIZE-TILESIZE/2) - (player.y-player.regY) );
            
            
            // handle touching this tile
            // remember - we were told that we COULD move here - now we have ...
            if( tile.type !== "empty") {
              touchTile( tile, distance );
            }
          }
      }
  }
}

function showSign( sign ) {
  if( !sign.sign.active ) {
    sign.sign.active = true;

    // set display values
    document.querySelector("#sign h1").innerHTML = sign.sign.heading;
    document.querySelector("#sign p").innerHTML = sign.sign.text;

    // TODO: Make sign-animation show up from where it is positioned on the screen!
    
    // show animation
    document.querySelector("#sign").classList.remove("hidden");
    document.querySelector("#sign").classList.add("show");

    // activate close-button
    document.querySelector("#sign button").addEventListener("click", closeSign);

    function closeSign( ) {
      document.querySelector("#sign").classList.remove("show");
      document.querySelector("#sign").classList.add("hide");

      // TODO: Make signs work again
    }


  }
}

function touchTile( tile, distance ) {
  switch( tile.type ) {
    case "empty":
    case "slope":
    case "filler":
    case "platform":
      // these types are ignored completely
    break;
    case "info": 
      console.log(distance);
      if( distance < TILESIZE/4 ) {
        if( tile.name === "sign" ) {
          showSign( tile );
        }
//        console.log("Hit info box!");
//        console.log( tile );
      }
      break;
    default: 
    
      console.log("touch " + tile.type);
      console.log(tile);
      console.log(distance);
  }
  
}

function canMoveToTile( object, tile, x, y ) {
  let canMove = true;

  switch( tile.block ) {
    case "platform":
      if( tile.type === "box"  ) {
        canMove = true;
      } else {
        canMove = false; // TODO: Unless it is a type = box, and we are moving from below!

      }
      break;
    case "empty":
    case "background":
    default:
        canMove = true;

  }

  return canMove;
}

function animatePlayer() {
  switch( player.sprite ) {
    case "idle":
        if( player.speedX != 0 ) {
          player.sprite = "walking";
        }
    case "walking":
        if( player.jumping ) {
          player.sprite = "jumping";
        } else if( player.speedX === 0 ) {
          player.sprite = "idle";
        }
      break;
    case "jumping":
        // we were jumping!
        // are we still falling?
        if( player.speedY > 0 || canMove(player,0,1) ) {
          player.sprite = "falling";
          player.fallFrom = player.y;
          // TODO: Play long-jump sound
//             if( player.jumpsound != null && player.jumpsound.playState == "playFinished") {
//                 createjs.Sound.play("sndJump_long");
//                 player.jumpsound = null;
// //                        console.log("Player jumpsound: " + player.jumpsound.playState);
//             }
          // don't change anything
      } else {
        // no longer jumping
        player.sprite = "landing";
        console.log("landing"); 
      }
      break;
    case "falling":
      if( ! canMove(player,0,1) ) {
        player.sprite = "landing";
        console.log("landing");
      }
      break;
    case "landing":

        if( player.y - player.fallFrom > 500 ) { // TODO: Bedre tal her - i forhold til jump-height
          // Only dust if falling from very high up!
          HTML.playerEffect.classList.add("dust"); // TODO: Function for effects
        }
        HTML.player.querySelector(".sprite").addEventListener("animationend", landed);
  
        function landed() {
          HTML.player.querySelector(".sprite").removeEventListener("animationend", landed);
          HTML.playerEffect.classList.remove("dust");
          player.sprite = "idle";
        }
        
      break;
    
  }

  // change direction depending on speed
  if( player.speedX != 0 ) {
    HTML.player.style.transform = `scaleX(${player.direction})`;
  }

}    





function movePlayer() {
  if( keys.space && player.jumping == false && !canMove(player,0,1) ) {
    player.speedY = -player.jumpPower;
    player.jumping = true;
  }


  if( keys.left ) {
    player.speedX--;
    player.direction = -1;
    if( player.speedX < -player.walkSpeed ) {
        player.speedX = -player.walkSpeed;
    }
  } else if( keys.right ) {
      player.speedX++;
      player.direction = 1;
      if( player.speedX > player.walkSpeed ) {
          player.speedX = player.walkSpeed;
      }
  } else {
      if( player.speedX > 0 ) {
          player.speedX--;
      } else if( player.speedX < 0 ) {
          player.speedX++;
      }
  }


  // test if we can't move sideways
  if(player.speedX != 0 && !canMove(player, player.speedX, 0) ) {
    console.log("Cant move!");
    // we can't move the full distance, but maybe we can move a little closer ...
    while(canMove(player, Math.sign(player.speedX), 0)) {
        // move a pixel closer
        player.x += Math.sign(player.speedX);
    };
    // and then don't move any more
    player.speedX = 0;
}

  player.speedY += gravity;
      
  // test if we can't move down (or up?)
  if(player.speedY != 0 && !canMove(player, 0, player.speedY) ) {
  //        console.log("Cant move down!");
      // we can't move the full distance, but maybe we can move a little closer ...
      while(canMove(player, 0, Math.sign(player.speedY))) {
          // move a pixel closer
          player.y += Math.sign(player.speedY);
      };
      // and then don't move any more
      player.speedY = 0;
      player.jumping = false;
  }  

  // finish with actually moving
  player.x += player.speedX;
  player.y += player.speedY;

}

function drawPlayer() {
  HTML.player.style.left = player.x-player.regX + "px";
  HTML.player.style.top = player.y-player.regY + "px";

  const hitbox = document.querySelector("#player .hitbox");
  hitbox.style.width = player.hitW +"px";
  hitbox.style.height = player.hitH +"px";
  hitbox.style.left = player.hitX + "px";
  hitbox.style.top = player.hitY + "px";

  
}

function getSelectors() {
  HTML.screen = document.querySelector("#screen");
  HTML.stage = document.querySelector("#stage");
  HTML.platforms = document.querySelector("#platforms");
  HTML.player = document.querySelector("#player");
  HTML.playerEffect = document.querySelector("#player .effect");
}

function resetPlayer() {
  HTML.player.className = "";
  player.x = TILESIZE;
  player.y = 0;
}

function dropPlayer() {
  player.sprite = "falling";
  player.fallFrom = player.y;
//  HTML.player.classList.add("falling");
//  HTML.player.addEventListener("animationend", landed);
}

function landing() {
  console.log("landed");
//  HTML.player.removeEventListener("animationend", landed);
//  setCurrentPlayerPosition();
//  HTML.player.classList.remove("falling");
  HTML.player.classList.add("landing");
  HTML.playerEffect.classList.add("dust");
  HTML.player.querySelector(".sprite").addEventListener("animationend", standing);
}



function standing() {
  HTML.player.querySelector(".sprite").removeEventListener("animationend", standing);

  HTML.player.classList.remove("landing");
  HTML.player.classList.add("standing");
  HTML.player.classList.add("idle");
}

function setCurrentPlayerPosition() {
  
  // finds the translated position for the player, and sets top and left to x and y, so the translate can be reset
  const transformvalue = HTML.player.computedStyleMap().get("transform");
  for( let t of transformvalue ) {
    if( t instanceof CSSTranslate ) {
      HTML.player.style.left = t.x.value + t.x.unit;
      HTML.player.style.top = t.y.value + t.y.unit;
      break;
    }
  }
}

let tiles = [];

function buildLevel() {
  // load string description
  const leveldata = platforms;

  HTML.stage.style.setProperty("--rows", leveldata.length);
  HTML.stage.style.setProperty("--cols", leveldata[0].length);

  // clear tiles
  tiles = [];

  // create a div for each character
  for( let y=0; y < leveldata.length; y++ ) {
    tiles[y] = [];

    const line = leveldata[y];
    let last = null;
    for( let x=0; x < line.length; x++ ) {
      const code = line[x];

      const prev = line[x-1];
      const next = line[x+1];

      // create tile object
      const tile = Object.create( TileTypes[code] );
      tile.x = x;
      tile.y = y;

      // create element
      const div = document.createElement("div");
      div.classList.add("tile");
      const element = document.createElement("img");
      element.classList.add("tile");

     
      // check for custom fillers
      if( tile.type === "filler" ) {
        // find last tile
        if( prev ) {
          switch( prev ) {
            case "/": tile.image = "grassHillLeft2";
                      break;
            case "#": if( next === "\\" ) {
              tile.image = "grassHillRight2";
                      } else {
                        tile.image = "grassCenter";
                      }
                      break;
          }
        }
      }

       // find image
       let image = tile.image;


      // TODO: More left and right with platforms
      if ( tile.type === "platform" && !(image.endsWith("Right") || image.endsWith("Left")) ) {
          image += "Mid";
      }


      element.src = "Tiles/"+image+".png";
      element.alt = tile.name;
      element.classList.add(tile.name);

      last = code;
      
      /*
        // space - unless something else required by last
        if( last ) {
          switch( last ) {
            case "/": tile.src = "Tiles/grassHillLeft2.png";
                      tile.alt = "grass";
                      last = "#";
                      break;
            case "#": if( next === "\\" ) {
                        tile.src = "Tiles/grassHillRight2.png";
                        tile.alt = "grass";
                        last = "#";  
                      } else {
                        tile.src = "Tiles/grassCenter.png";
                        tile.alt = "grass";
                        last = "#";
                      }
                      break;
          }
        } else {
          tile.src = "Tiles/space.png";
          tile.alt = " ";

          last = code;
        }
*/


      

      tile.element = element;
      tiles[y][x] = tile;
      div.append(element);
      HTML.platforms.append(div);

      
    }
  }
  
  // find signs
  signs.forEach( sign => {
    // find the tile for this sign
    const tile = tiles[sign.y][sign.x];
    tile.sign = sign;

    // create text element
    const span = document.createElement("span");
    span.innerHTML = sign.short;
    tile.element.parentElement.append(span);
  })

  // TODO: Prepare info-boxes

}

const TileTypes = {
  " ": { type: "empty",
         block: "empty",
         image: "space"},
  "#": { type: "filler"},
  "G": { name: "grass",
         block: "background",
         type: "platform",
         image: "grass"},
  "/": { name: "grassHill",
         block: "background",
         type: "slope",
         direction: "up",
         image: "grassHillLeft"},
  "\\": { name: "grassHill",
         block: "background",
         type: "slope",
         direction: "down",
         image: "grassHillRight"},
  "X": { name: "box",
         block: "platform",
         type: "box",
         image: "boxAlt"},
  "O": { name: "box",
         type: "box",
         block: "platform",
         image: "boxCoin_disabled"},
  "!": { name: "box",
         block: "platform",
         type: "box",
         image: "boxItem_disabled"},
  "=": { name: "sign",
         block: "background",
         type: "info",
         image: "sign"},
  "S": { name: "sand",
         block: "platform",
         image: "sand"},
  "R": { name: "rock",
         type: "platform",
         block: "platform",
         image: "castle"}
}

const platforms =["                           ",
                  "                           ",
                  "              !            ",
                  "                           ",
                  "                           ",
                  "         !  XOXOX          ",
                  "                           ",
                  "  /GG\\                     ",
                  " /####\\  =                 ",
                  "RRRRRRRRRRRRRRRRRRRRRRRRRRR"
];

const signs = [
  { "x": 9, "y": 8, "short": "Jump", "heading": "Did you know that", "text": "You can press 'space' to jump.<br>Use it to jump onto platforms, and into boxes.", "active": false }
]