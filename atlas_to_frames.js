var fs 				= require('fs-extra');
var path			= require('path');
var PNG		 		= require('pngjs').PNG;

// =================================================================================
//
// atlas_to_frames v1.0.4
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

var atlasFile		= process.argv[2] || "ui.png";
var jsonFile		= process.argv[3] || path.basename(atlasFile).split(".png").join(".json");
var outputFolder	= process.argv[4] || path.basename(atlasFile, path.extname(atlasFile));		//console.log("outputFolder", outputFolder);
var jsonPathSep		= "/";

try
{
	if(!fs.existsSync(atlasFile) || !fs.existsSync(jsonFile))
	{
		!fs.existsSync(atlasFile) && console.log("\n", "ERROR:", atlasFile, "NOT EXISTS", "\n");
		!fs.existsSync(jsonFile) && console.log("\n", "ERROR:", jsonFile, "NOT EXISTS", "\n");
	}
	else
	{
		var framesList = JSON.parse(fs.readFileSync(jsonFile, {encoding: "UTF-8"})).frames;
	}
	
	if(framesList)
	{
		var frameNames		= Object.keys(framesList);												// in case framesList is Object, not Array
		var framesNumber	= framesList.length ? framesList.length : frameNames.length;
		var doneCounter		= 0;
		
		console.log("\n", "CREATING FOLDERS...", "\n");
		
		if(outputFolder.length > 0 && !fs.existsSync(outputFolder))
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
						
						var obj			= getSpriteParams(framesList[i]);
						var dstPath		= path.extname(i).toLowerCase() != '.png' ? i + '.png' : i;
						var dstBuffer		= new PNG({width:obj.wSrc, height:obj.hSrc, inputHasAlpha:true});
						var pct			= Math.round(doneCounter/framesNumber*100);
						
						initPixels(dstBuffer);
						
						parsedBuffer.bitblt(dstBuffer, obj.x, obj.y, obj.w, obj.h, obj.xOfst, obj.yOfst);
						
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

function initPixels(dstBuffer)
{
	for(var y=0; y<dstBuffer.height; y++)
	{
		for(var x=0; x<dstBuffer.width; x++)
		{
			var idx = (dstBuffer.width * y + x) << 2;

			dstBuffer.data[idx]		= 255;
			dstBuffer.data[idx + 1] = 255;
			dstBuffer.data[idx + 2] = 255;
			dstBuffer.data[idx + 3] = 0;
		}
	}
}

function getSpriteParams(item)
{
	var obj		= item.frame;
	
	obj.wSrc	= item.sourceSize ? item.sourceSize.w : obj.w;
	obj.hSrc	= item.sourceSize ? item.sourceSize.h : obj.h;
	
	obj.xOfst	= item.spriteSourceSize ? item.spriteSourceSize.x : 0;
	obj.yOfst	= item.spriteSourceSize ? item.spriteSourceSize.y : 0;
	
	if(!item.frame)																		// In case of using array of [x,y,width,height]
	{
		obj	= { 
			"xOfst"	: 0,
			"yOfst"	: 0, 
			"x"		: item[0],															// Use this to set frame's x coordinate
			"y"		: item[1],															// Use this to set frame's y coordinate
			"w"		: item[2],															// Use this to set frame's width
			"h"		: item[3]															// Use this to set frame's height
		};
		obj.wSrc	= obj.w;
		obj.hSrc	= obj.h;
	}
	
	return obj;
}
