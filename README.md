## Spritesheet Unpacker
### Unpack sprites from PNG spritesheet(atlas) with _nodejs_

This script extracts all frames from a PNG spritesheet according to its JSON-file
and puts them into the folder created next to it. 

Usage: `node unpack [filename.png[, filename.json[, output_foldername]]]`

Assumes that spritesheet is a PNG-file and its JSON is a TexturePacker like (not rotated), i.e.
```json
{"frames": 
  {
    "games/smsh!/res/img/ui/buttons/left/down.png":
    {
      "frame": {"x":1305,"y":246,"w":38,"h":47}
    },
    "games/smsh!/res/img/ui/buttons/left/over.png":
    {
      "frame": {"x":1289,"y":303,"w":38,"h":47}
    },
    "games/smsh!/res/img/ui/buttons/left/up.png":
    {
      "frame": {"x":1329,"y":295,"w":38,"h":47}
    }
  }
}
```
or is array "frames" of [x,y,width,height] arrays, i.e.
```json
{"frames": [
  [860, 514, 96, 48],
  [960, 608, 96, 48],
  [960, 740, 32, 16]
]}
```

'fs-extra', 'path' and '[pngjs](https://www.npmjs.com/package/pngjs)' packages required. Use '`npm install pngjs`', etc.
