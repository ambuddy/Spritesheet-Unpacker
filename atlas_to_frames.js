var fs 				= require('fs-extra');
var path			= require('path');
var PNG		 		= require('pngjs').PNG;

// =================================================================================
//
// Copyright (c) 2017 ambuddy
//
// This script extracts all frames from a spritesheet according to its JSON-file
// and puts them into the folder created next to it.
//
// Usage: node atlas_to_pics [filename.png[, filename.json[, output_foldername]]]
//
// Assumes that spritesheet is a PNG-file and its JSON is a TexturePacker like or 
// is array "frames" of [x,y,width,height] arrays, i.e.
// {"frames": [
//   [860, 514, 96, 48],
//   [960, 608, 96, 48],
//   [960, 740, 32, 16]
// ]}
//
// 'fs-extra', 'path' and 'pngjs' packages required. Use 'npm install pngjs', etc.
// 
// =================================================================================

var atlasFile		= process.argv[2] || "atlas.png";
var jsonFile		= process.argv[3] || path.basename(atlasFile).split(".png").join(".json");
var outputFolder	= process.argv[4] || atlasFile + "_frames";
var jsonPathSep		= "/";

try
{
	var framesList = JSON.parse(fs.readFileSync(jsonFile, {encoding: "UTF-8"})).frames;
	
	if(framesList)
	{
		var frameNames		= Object.keys(framesList);												// in case framesList is Object, not Array
		var framesNumber	= framesList.length ? framesList.length : frameNames.length;
		var doneCounter		= 0;
		
		console.log("\n", "CREATING FOLDERS...", "\n");
		
		if(!fs.existsSync(outputFolder))
		{
			console.log(outputFolder);
			fs.mkdirSync(outputFolder);
		}
		
		if(isNaN(frameNames[0]))
		{
			frameNames.forEach(function(item, i)
			{
				if(item.indexOf(jsonPathSep) == -1)
				{
					return;
				}

				var folder	= path.join(outputFolder, path.dirname(item));
				
				if(!fs.existsSync(folder))
				{
					console.log(folder);
					fs.mkdirsSync(folder);
				}
			});
		}
		
		console.log("\n", "EXTRACTING FRAMES...", "\n");
		
		fs.createReadStream(atlasFile)
			.pipe(new PNG())
			.on('parsed', function()
			{
				var parsedBuffer = this;
				
				for(var i in framesList)
				{
					//break;
					(function(i) {
						
						doneCounter++;
						
						var item		= framesList[i];
						var obj			= item.frame ? item.frame : {
							"x"	:item[0],															// Use this to set frame's x coordinate
							"y"	:item[1],															// Use this to set frame's y coordinate
							"w"	:item[2],															// Use this to set frame's width
							"h"	:item[3]															// Use this to set frame's height
						};
						var dstPath		= !isNaN(i) ? i + '.png' : i;
						var dstBuffer	= new PNG({width:obj.w, height:obj.h});
						var pct			= Math.round(doneCounter/framesNumber*100);
						
						parsedBuffer.bitblt(dstBuffer, obj.x, obj.y, obj.w, obj.h, 0, 0);
						
						dstBuffer.pack().pipe(fs.createWriteStream(path.join(outputFolder, dstPath)));
						
						console.log('['+pct+'%] -', path.join(outputFolder, dstPath));
						
						if(doneCounter == framesNumber)
						{
							console.log("\n", "JOB IS DONE!");
						}
					})(i);
				}
				
			});
	}
	else
	{
		console.log("\n", "THERE IS NO 'frames' PROPERTY IN JSON");
	}
}
catch(e)
{
	console.error(e);
	console.log("\n", "BUILD FAILED");
}
