//--------------------------------------------------
function drawError(canvas, error)
{
	// context
	var ctx=canvas.getContext("2d");
	// calculate the canvas dimension
	canvas.width = 150;
	canvas.height = 60; 
	// initialize canvas in black
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	// print the error
	ctx.fillStyle = "red";
	ctx.font = "30px Arial";
	ctx.textAlign = "center";
	ctx.fillText(error, canvas.width/2, canvas.height/2);
}

//--------------------------------------------------
function drawImage(canvas, image)
{
	// canvas
	var ctx=canvas.getContext("2d");
	// calculate the canvas dimension
	canvas.width = image.height;
	canvas.height = image.width;
	// initialize canvas in black
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	// save context
	ctx.save();
	// translate and rotate
	ctx.translate(canvas.width/2,canvas.height/2);
	ctx.rotate(-90*Math.PI/180);
	// draw image in canvas
	ctx.drawImage(image, -canvas.height/2, -canvas.width/2);
	//restore context
	ctx.restore();
}


//--------------------------------------------------
function drawConvert(canvas, image, orientation, pixel, maxPixel)
{
	// context
	var ctx = canvas.getContext("2d");
	// calculate the canvas dimension
	canvas.width = maxPixel;
	if(orientation)
	{
		canvas.height = image.height/image.width*pixel;
	}
	else
	{
		canvas.height = image.width/image.height*pixel;
	}
	// initialize canvas in black
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	// save context
	ctx.save();
	// translate
	ctx.translate(canvas.width/2,canvas.height/2);
	// rotate and draw
	if(orientation)
	{
		ctx.rotate(180*Math.PI/180);
		ctx.drawImage(image,-pixel/2,-canvas.height/2,pixel,canvas.height);
	}
	else
	{
		ctx.rotate(90*Math.PI/180);
		ctx.drawImage(image,-canvas.height/2,-pixel/2,canvas.height,pixel);
	}
	// restore context
	ctx.restore();

}

//--------------------------------------------------
function drawCurtain(canvas, start, stop)
{
	// canvas
	var ctx=canvas.getContext("2d");
	// curtain color
	ctx.fillStyle = "red";
	// draw curtain
	ctx.fillRect(0, 0, Number(start), canvas.height);
	ctx.fillRect(Number(stop)+1, 0, canvas.width-Number(stop), canvas.height);
}

//--------------------------------------------------
function drawGamma(canvas, gamma)
{
	// context
	var ctx = canvas.getContext("2d");
	// store canvas in data
	var imageData = ctx.getImageData(0.0, 0.0, canvas.width, canvas.height);
	var data = imageData.data;
	//adjust gamma
	for (var i = 0; i < data.length; i++)
	{
		data[i] = 255 * Math.pow((data[i] / 255), gamma);
	}
	// put data in canvas
	ctx.putImageData(imageData, 0, 0);
}

//--------------------------------------------------
function drawCut(canvas, cut)
{
	// context
	var ctx = canvas.getContext("2d");
	// store canvas in data
	var imageData = ctx.getImageData(0.0, 0.0, canvas.width, canvas.height);
	var data = imageData.data;
	//cut the line
	for (var i = 0; i < data.length; i += 4)
	{
		if (i%(4*canvas.width)%(8*cut)<4*cut)
		{
			data[i] = 0;
			data[i+1] = 0;
			data[i+2] = 0;
		}
	}
	// put data in canvas
	ctx.putImageData(imageData, 0, 0);
}