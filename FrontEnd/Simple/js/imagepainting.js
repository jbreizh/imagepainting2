//"use strict";

// --------------------------------------------------
function collapseTable(className) {
	var collapse = document.getElementsByClassName(className);

	for (var i = 0; i < collapse.length; i++)
	{
		collapse[i].classList.toggle("hide-me");
	}
}

// --------------------------------------------------
function toggle(e) {
	if (e.target.innerHTML == "+")
	{
		e.target.innerHTML = "-";
	}
	else
	{
		e.target.innerHTML = "+";
	}
}

// Collapse event--------------------------------------------------
document.getElementById("collapseActions").addEventListener('click', function() { collapseTable("actions");}, false);
document.getElementById("collapseSettings").addEventListener('click', function() { collapseTable("settings");}, false);
document.getElementById("collapseUpload").addEventListener('click', function() { collapseTable("upload");}, false);
document.getElementById("collapseSystem").addEventListener('click', function() { collapseTable("system");}, false);
document.getElementById("collapseActions").addEventListener('click', toggle, false);
document.getElementById("collapseSettings").addEventListener('click', toggle, false);
document.getElementById("collapseUpload").addEventListener('click', toggle, false);
document.getElementById("collapseSystem").addEventListener('click', toggle, false);

// Variable
var address = "";
//var address = "http://192.168.6.55";
var imgImage = new Image;
var FILELIST = new Object();
var BITMAP = new Object();
var PARAMETER = new Object();
var SYSTEM = new Object();

//--------------------------------------------------
function updateStatus(message, color)
{
		if (document.getElementById("textStatus") != null) document.getElementById("textStatus").innerHTML = message;
		if (document.getElementById("textStatus") != null) document.getElementById("textStatus").style.color = color;
}

//--------------------------------------------------
function updateCheckbox(checkboxFrom, checkboxTo)
{
	if(checkboxFrom.checked)
	{
		checkboxTo.disabled = true;
		checkboxTo.parentNode.style.color = "grey";
	}
	else
	{
		checkboxTo.disabled = false;
		checkboxTo.parentNode.style.color = "white";
	}
}

//--------------------------------------------------
function trimFileName(fileName, newExt)
{
	// test
	var extRegex = /(?:\.([^.]+))?$/;
	// retrieve current extension
	var currentExt = extRegex.exec(fileName)[1];
	// retrieve base name
	var baseName = fileName.substring(0, fileName.length-(currentExt.length+1));
	// spiffs support maxi 31 characters (extension include) so we trim the baseName to 20 characters for security
	if (baseName.length > 20)
	{
		baseName=baseName.substring(0, 20);
	}
	// 
	var trimName;
	// keep current extension 
	if (newExt == "")
	{
		trimName = baseName+"."+currentExt;
	}
	// add the new extension
	else
	{
		trimName =  baseName+"."+newExt;
	}
	return trimName;
}

//--------------------------------------------------
function download(url,name)
{
	updateStatus("DOWNLOAD SUCCESS", "green");
	// create a link
	var a  = document.createElement('a');
	// create a link
	a.href = url;
	// set the name of the link
	a.download = name;
	// download the link
	a.click();
}

//--------------------------------------------------
function upload(blob,name)
{
	// too big? display an error
	if (blob.size > SYSTEM["freeBytes"])
	{
		updateStatus("UPLOAD ERROR : NOT ENOUGH SPACE", "red");
	}
	// no problem? send the file
	else
	{
		var form = new FormData();
		form.append('file',blob,name);
		requestFileUpload(form);
	}
}

	//--------------------------------------------------
function requestAction(action)
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			updateStatus(this.responseText, "green");
		}
		else
		{
			updateStatus(this.responseText, "red");
		}
	};

	xhr.onerror = function()
	{
		updateStatus("ACTION ERROR : CONNECTION LOST", "red");
	};

	xhr.open("GET", address + action, true);
	xhr.send(null);
}

	//--------------------------------------------------
function requestBitmapRead()
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			setBitmap(this.responseText);
		}
	};

	xhr.onerror = function()
	{
		updateStatus("BITMAP READ ERROR : CONNECTION LOST", "red");
	};

	xhr.overrideMimeType("application/json");
	xhr.open("GET", address+"/bitmapRead", true);
	xhr.send(null);
}

//--------------------------------------------------
function setBitmap(jsonString)
{
	BITMAP = JSON.parse(jsonString);
		// set actions values
	if (document.getElementById("sliderStart") != null)
	{
		document.getElementById("sliderStart").setAttribute("min", BITMAP["indexMin"]);
		document.getElementById("sliderStart").setAttribute("max", BITMAP["indexMax"]);
		document.getElementById("sliderStart").value = BITMAP["indexStart"];
		if (document.getElementById("sliderStart") != null) document.getElementById("textStart").innerHTML = document.getElementById("sliderStart").value + "px";
	}
	if (document.getElementById("sliderStop") != null)
	{
		document.getElementById("sliderStop").setAttribute("min", BITMAP["indexMin"]);
		document.getElementById("sliderStop").setAttribute("max", BITMAP["indexMax"]);
		document.getElementById("sliderStop").value = BITMAP["indexStop"];
		if (document.getElementById("sliderStop") != null) document.getElementById("textStop").innerHTML = document.getElementById("sliderStop").value + "px";
	}
	if (document.getElementById("sliderDuration") != null)
	{
		document.getElementById("sliderDuration").setAttribute("max",(BITMAP["indexStop"]-BITMAP["indexStart"])*255);
		document.getElementById("sliderDuration").value = (BITMAP["indexStop"]-BITMAP["indexStart"])*PARAMETER["delay"];
		if (document.getElementById("textDuration") != null) document.getElementById("textDuration").innerHTML = document.getElementById("sliderDuration").value + "ms";
	}
	if (document.getElementById("selectImage") != null) document.getElementById("selectImage").value = BITMAP["bmpPath"];
	
	if(BITMAP["isbmpload"])
	{
		if (document.getElementById("sliderStart") != null) document.getElementById("sliderStart").disabled = false;
		if (document.getElementById("sliderStop") != null) document.getElementById("sliderStop").disabled = false;
		if (document.getElementById("sliderDuration") != null) document.getElementById("sliderDuration").disabled = false;
		if (document.getElementById("btnBurn") != null) document.getElementById("btnBurn").disabled = false;
		if (document.getElementById("btnPlay") != null) document.getElementById("btnPlay").disabled = false;
		imgImage.src= address + "/" + BITMAP["bmpPath"];
	}
		// it isn't a bitmap
	else
	{
		if (document.getElementById("sliderStart") != null) document.getElementById("sliderStart").disabled = true;
		if (document.getElementById("sliderStop") != null) document.getElementById("sliderStop").disabled = true;
		if (document.getElementById("sliderDuration") != null) document.getElementById("sliderDuration").disabled = true;
		if (document.getElementById("btnBurn") != null) document.getElementById("btnBurn").disabled = true;
		if (document.getElementById("btnPlay") != null) document.getElementById("btnPlay").disabled = true;
		if (document.getElementById("canvasImage") != null) drawError(document.getElementById("canvasImage"), "Not Load");
	}	
} 

//--------------------------------------------------
function requestBitmapWrite()
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			updateStatus(this.responseText, "green");
		}
		else
		{
			updateStatus(this.responseText, "red");
		}
		requestBitmapRead();
	};

	xhr.onerror = function()
	{
		updateStatus("BITMAP WRITE ERROR : CONNECTION LOST", "red");
	};

	xhr.open("POST", address+"/bitmapWrite", true);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.send(getBitmap());
}

//--------------------------------------------------
function getBitmap()
{
	// get actions values
	if (document.getElementById("sliderStart") != null) BITMAP.indexStart = document.getElementById("sliderStart").value;
	if (document.getElementById("sliderStop") != null) BITMAP.indexStop = document.getElementById("sliderStop").value;
	if (document.getElementById("selectImage") != null) BITMAP.bmpPath = document.getElementById("selectImage").value;
	// convert json to string
	return JSON.stringify(BITMAP);
}

//--------------------------------------------------
function requestParameterRead()
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			setParameter(this.responseText);
		}
	};

	xhr.onerror = function()
	{
		updateStatus("PARAMETER READ ERROR : CONNECTION LOST", "red");
	};

	xhr.overrideMimeType("application/json");
	xhr.open("GET", address+"/parameterRead", true);
	xhr.send(null);
}

//--------------------------------------------------
function setParameter(jsonString)
{
	PARAMETER = JSON.parse(jsonString);
		// set settings values
	if (document.getElementById("sliderDuration") != null) document.getElementById("sliderDuration").value = (BITMAP["indexStop"]-BITMAP["indexStart"])*PARAMETER["delay"];
	if (document.getElementById("textDuration") != null) document.getElementById("textDuration").innerHTML = (BITMAP["indexStop"]-BITMAP["indexStart"])*PARAMETER["delay"] + "ms";
	if (document.getElementById("sliderDelay") != null) document.getElementById("sliderDelay").value = PARAMETER["delay"];
	if (document.getElementById("textDelay") != null) document.getElementById("textDelay").innerHTML = PARAMETER["delay"] + "ms";
	if (document.getElementById("sliderBrightness") != null) document.getElementById("sliderBrightness").value = PARAMETER["brightness"];
	if (document.getElementById("textBrightness") != null) document.getElementById("textBrightness").innerHTML = PARAMETER["brightness"] + "%";
	if (document.getElementById("sliderCountdown") != null) document.getElementById("sliderCountdown").value = PARAMETER["countdown"];
	if (document.getElementById("textCountdown") != null) document.getElementById("textCountdown").innerHTML = PARAMETER["countdown"] + "ms";
	if (document.getElementById("ckCountdown") != null) document.getElementById("ckCountdown").checked  = PARAMETER["iscountdown"];
	if (document.getElementById("sliderRepeat") != null) document.getElementById("sliderRepeat").value = PARAMETER["repeat"];
	if (document.getElementById("textRepeat") != null) document.getElementById("textRepeat").innerHTML = PARAMETER["repeat"] + "x";
	if (document.getElementById("ckInvert") != null) document.getElementById("ckInvert").checked  = PARAMETER["isinvert"];
	if (document.getElementById("ckRepeat") != null) document.getElementById("ckRepeat").checked  = PARAMETER["isrepeat"];
	if (document.getElementById("ckBounce") != null) document.getElementById("ckBounce").checked  = PARAMETER["isbounce"];
	if (document.getElementById("ckRepeat") != null && document.getElementById("ckBounce") != null) updateCheckbox(document.getElementById("ckRepeat"),document.getElementById("ckBounce"));
	if (document.getElementById("ckBounce") != null && document.getElementById("ckRepeat") != null) updateCheckbox(document.getElementById("ckBounce"),document.getElementById("ckRepeat"));
	if (document.getElementById("sliderPause") != null) document.getElementById("sliderPause").value = PARAMETER["pause"];
	if (document.getElementById("textPause") != null) document.getElementById("textPause").innerHTML = PARAMETER["pause"] + "px";
	if (document.getElementById("ckPause") != null) document.getElementById("ckPause").checked  = PARAMETER["ispause"];
	if (document.getElementById("ckCut") != null) document.getElementById("ckCut").checked  = PARAMETER["iscut"];
	if (document.getElementById("ckPause") != null && document.getElementById("ckCut") != null) updateCheckbox(document.getElementById("ckPause"),document.getElementById("ckCut"));
	if (document.getElementById("ckCut") != null && document.getElementById("ckPause") != null) updateCheckbox(document.getElementById("ckCut"),document.getElementById("ckPause"));
	if (document.getElementById("pickerColor") != null) document.getElementById("pickerColor").value = PARAMETER["color"];
	if (document.getElementById("ckEndOff") != null) document.getElementById("ckEndOff").checked  = PARAMETER["isendoff"];
	if (document.getElementById("ckEndColor") != null) document.getElementById("ckEndColor").checked  = PARAMETER["isendcolor"];
	if (document.getElementById("ckEndOff") != null && document.getElementById("ckEndColor") != null) updateCheckbox(document.getElementById("ckEndOff"),document.getElementById("ckEndColor"));
	if (document.getElementById("ckEndColor") != null && document.getElementById("ckEndOff") != null) updateCheckbox(document.getElementById("ckEndColor"),document.getElementById("ckEndOff"));
}

//--------------------------------------------------
function requestParameterWrite()
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			updateStatus(this.responseText, "green");
		}
		else
		{
			updateStatus(this.responseText, "red");
		}
		requestParameterRead();
	};

	xhr.onerror = function()
	{
		updateStatus("PARAMETER WRITE ERROR : CONNECTION LOST", "red");
	};

	xhr.open("POST", address+"/parameterWrite", true);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.send(getParameter());
}

//--------------------------------------------------
function getParameter()
{
		// get PARAMETER values
	if (document.getElementById("sliderDelay") != null) PARAMETER.delay = document.getElementById("sliderDelay").value;
	if (document.getElementById("sliderBrightness") != null) PARAMETER.brightness = document.getElementById("sliderBrightness").value;
	if (document.getElementById("sliderCountdown") != null) PARAMETER.countdown = document.getElementById("sliderCountdown").value;
	if (document.getElementById("ckCountdown") != null) PARAMETER.iscountdown = document.getElementById("ckCountdown").checked;
	if (document.getElementById("sliderRepeat") != null) PARAMETER.repeat = document.getElementById("sliderRepeat").value;
	if (document.getElementById("ckInvert") != null) PARAMETER.isinvert = document.getElementById("ckInvert").checked;
	if (document.getElementById("ckRepeat") != null) PARAMETER.isrepeat = document.getElementById("ckRepeat").checked;
	if (document.getElementById("ckBounce") != null) PARAMETER.isbounce = document.getElementById("ckBounce").checked;
	if (document.getElementById("sliderPause") != null) PARAMETER.pause = document.getElementById("sliderPause").value;
	if (document.getElementById("ckPause") != null) PARAMETER.ispause = document.getElementById("ckPause").checked;
	if (document.getElementById("ckCut") != null) PARAMETER.iscut = document.getElementById("ckCut").checked;
	if (document.getElementById("pickerColor") != null) PARAMETER.color = document.getElementById("pickerColor").value;
	if (document.getElementById("ckEndOff") != null) PARAMETER.isendoff = document.getElementById("ckEndOff").checked;
	if (document.getElementById("ckEndColor") != null) PARAMETER.isendcolor = document.getElementById("ckEndColor").checked;
		// convert json to string
	return JSON.stringify(PARAMETER);
}

//--------------------------------------------------
function requestParameterSave()
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			updateStatus(this.responseText, "green");
		}
		else
		{
			updateStatus(this.responseText, "red");
		}
	};

	xhr.onerror = function()
	{
		updateStatus("PARAMETER SAVE ERROR : CONNECTION LOST", "red");
	};

	xhr.open("GET", address+"/parameterSave", true);
	xhr.send(null);
}

//--------------------------------------------------
function requestParameterRestore()
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			updateStatus(this.responseText, "green");
		}
		else
		{
			updateStatus(this.responseText, "red");
		}
		requestParameterRead();
	};

	xhr.onerror = function()
	{
		updateStatus("PARAMETER RESTORE ERROR : CONNECTION LOST", "red");
	};

	xhr.open("GET", address+"/parameterRestore", true);
	xhr.send(null);
}

//--------------------------------------------------
function requestSystemRead()
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			setSystem(this.responseText);
		}
	};

	xhr.onerror = function()
	{
		updateStatus("SYSTEM READ ERROR : CONNECTION LOST", "red");
	};

	xhr.overrideMimeType("application/json");
	xhr.open("GET", address+"/systemRead", true);
	xhr.send(null);
}

//--------------------------------------------------
function setSystem(jsonString)
{
	SYSTEM = JSON.parse(jsonString);
	// set parameters values
	if (document.getElementById("sliderPixels") !=  null)
	{
		document.getElementById("sliderPixels").setAttribute("max",SYSTEM["numPixels"]);
		document.getElementById("sliderPixels").value = SYSTEM["numPixels"];
		if (document.getElementById("textPixels") != null) document.getElementById("textPixels").innerHTML = document.getElementById("sliderPixels").value + "px";
	}
	//
	if (document.getElementById("sliderLineCut") != null)
	{
		document.getElementById("sliderLineCut").setAttribute("max",25);
		document.getElementById("sliderLineCut").value = 0;
		if (document.getElementById("textLineCut") != null) document.getElementById("textLineCut").innerHTML = document.getElementById("sliderLineCut").value + "px";
	}
		//
	if (document.getElementById("textLedNumber") != null) document.getElementById("textLedNumber").innerHTML = SYSTEM["numPixels"] + "px";
	// set chart parameters
	if (document.getElementById("canvasSystem") != null && document.getElementById("canvasLegend") != null)
	{
		var myChart = new Piechart(
		{
			canvas:canvasSystem,
			data:{"Used": SYSTEM["usedBytes"],"Free": SYSTEM["freeBytes"]},
			colors:["red","green"],
			legend:canvasLegend
		}
		);
		// draw the chart
		myChart.draw();
	}
}

//--------------------------------------------------
function requestFileList()
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			setFileList(this.responseText);
		}
	};

	xhr.onerror = function()
	{
		updateStatus("LIST ERROR : CONNECTION LOST", "red");
	};

	xhr.overrideMimeType("application/json");
	xhr.open("GET", address + "/list", true);
	xhr.send(null);
}

//--------------------------------------------------
function setFileList(jsonString)
{
	FILELIST = JSON.parse(jsonString);
	if (document.getElementById("selectImage") !=  null)
	{
		document.getElementById("selectImage").options.length = FILELIST.fileList.length;
		
		for (var i = 0; i < FILELIST.fileList.length; i++)
		{
			document.getElementById("selectImage").options[i].value = FILELIST.fileList[i];
			document.getElementById("selectImage").options[i].text = FILELIST.fileList[i]; 
		}
	}
}

//--------------------------------------------------
function requestFileUpload(form)
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			updateStatus(this.responseText, "green");
		}
		else
		{
			updateStatus("UPLOAD ERROR : UPLOAD FAILED", "red");
		}
		requestSystemRead();
		requestFileList();
		requestBitmapRead();
	};

	xhr.upload.onprogress = function(evt)
	{
		var percentComplete = Math.floor(evt.loaded / evt.total * 100);
		updateStatus("UPLOAD PROGRESS :"+percentComplete+"%", "orange");
	};

	xhr.onerror = function()
	{
		updateStatus("UPLOAD ERROR : CONNECTION LOST", "red");
	};

	xhr.open("POST", address+"/upload", true);
	xhr.send(form);
}

//--------------------------------------------------
function requestFileDelete(fileName)
{
	var xhr = new XMLHttpRequest();
	xhr.onload = function()
	{
		if (this.status == 200)
		{
			updateStatus(this.responseText, "green");
		}
		else
		{
			updateStatus(this.responseText, "red");
		}
		requestSystemRead();
		requestFileList();
		requestBitmapRead();
	};

	xhr.onerror = function()
	{
		updateStatus("DELETE ERROR : CONNECTION LOST", "red");
	};

	xhr.open("DELETE", address+"/delete", true);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.send(fileName);
}



// Actions Variable--------------------------------------------------
var selectImage = document.getElementById("selectImage");
var canvasImage =document.getElementById("canvasImage");
var btnDelete = document.getElementById("btnDelete");
var btnDownload = document.getElementById("btnDownload");
var sliderStart = document.getElementById("sliderStart");
var textStart = document.getElementById("textStart");
var sliderStop = document.getElementById("sliderStop");
var textStop = document.getElementById("textStop");
var sliderDuration = document.getElementById("sliderDuration");
var textDuration = document.getElementById("textDuration");
var btnLight = document.getElementById("btnLight");
var btnBurn = document.getElementById("btnBurn");
var btnStop = document.getElementById("btnStop");
var btnPlay = document.getElementById("btnPlay");

// Actions Event--------------------------------------------------
selectImage.addEventListener('change', requestBitmapWrite, false);
imgImage.addEventListener('load', function() {drawImage(canvasImage,imgImage); drawCurtain(canvasImage,sliderStart.value,sliderStop.value);}, false);
btnDelete.addEventListener('click', function() {requestFileDelete(selectImage.value);}, false);
btnDownload.addEventListener('click', function() {download(address + "/" + selectImage.value,selectImage.value.substring(1));}, false);
sliderStart.addEventListener('input', updateStart, false);
sliderStart.addEventListener('input', function() {drawImage(canvasImage,imgImage); drawCurtain(canvasImage,sliderStart.value,sliderStop.value);}, false);
sliderStart.addEventListener('change', requestBitmapWrite, false);
sliderStop.addEventListener('input', updateStop, false);
sliderStop.addEventListener('input', function() {drawImage(canvasImage,imgImage); drawCurtain(canvasImage,sliderStart.value,sliderStop.value);}, false);
sliderStop.addEventListener('change', requestBitmapWrite, false);
sliderDuration.addEventListener('input', updateDuration, false);
sliderDuration.addEventListener('change', requestParameterWrite, false);
btnLight.addEventListener('click', function() {requestAction("/light");}, false);
btnBurn.addEventListener('click', function() {requestAction("/burn");}, false);
btnStop.addEventListener('click', function() {requestAction("/stop");}, false);
btnPlay.addEventListener('click', function() {requestAction("/play");}, false);

//--------------------------------------------------
function updateStart()
{
	// update textStart < textStop
	sliderStop.value = Math.max(sliderStart.value,sliderStop.value);
	textStart.innerHTML = sliderStart.value + "px";
	textStop.innerHTML = sliderStop.value + "px";
	//update duration
	sliderDuration.setAttribute("max",(sliderStop.value-sliderStart.value)*255);
	sliderDuration.value = (sliderStop.value-sliderStart.value)*sliderDelay.value;
	textDuration.innerHTML = sliderDuration.value + "ms";
}

//--------------------------------------------------
function updateStop()
{
	// check if start < stop
	sliderStart.value = Math.min(sliderStart.value,sliderStop.value);
	// update textStart textStop
	textStart.innerHTML = sliderStart.value + "px";
	textStop.innerHTML = sliderStop.value + "px";
	//update duration
	sliderDuration.setAttribute("max",(sliderStop.value-sliderStart.value)*255);
	sliderDuration.value = (sliderStop.value-sliderStart.value)*sliderDelay.value;
	textDuration.innerHTML = sliderDuration.value + "ms";
}

//--------------------------------------------------
function updateDuration()
{
	// update duration
	textDuration.innerHTML = sliderDuration.value + "ms";
	// update delay
	sliderDelay.value = sliderDuration.value/(sliderStop.value-sliderStart.value);
	textDelay.innerHTML = sliderDelay.value + "ms";
}


// Settings Variable--------------------------------------------------
var sliderDelay = document.getElementById("sliderDelay");
var textDelay = document.getElementById("textDelay");
var sliderBrightness = document.getElementById("sliderBrightness");
var textBrightness = document.getElementById("textBrightness");
var sliderCountdown = document.getElementById("sliderCountdown");
var textCountdown = document.getElementById("textCountdown");
var sliderRepeat = document.getElementById("sliderRepeat");
var textRepeat = document.getElementById("textRepeat");
var sliderPause = document.getElementById("sliderPause");
var textPause = document.getElementById("textPause");
var pickerColor = document.getElementById("pickerColor");
var ckCountdown = document.getElementById("ckCountdown");
var ckInvert = document.getElementById("ckInvert");
var ckRepeat = document.getElementById("ckRepeat");
var ckBounce = document.getElementById("ckBounce");
var ckPause = document.getElementById("ckPause");
var ckCut = document.getElementById("ckCut");
var ckEndOff = document.getElementById("ckEndOff");
var ckEndColor = document.getElementById("ckEndColor");
var btnSave = document.getElementById("btnSave");
var btnRestore = document.getElementById("btnRestore");

// Settings Event--------------------------------------------------
sliderDelay.addEventListener('input', updateDelay, false);
sliderBrightness.addEventListener('input', function() {textBrightness.innerHTML = sliderBrightness.value + "%";}, false);
sliderCountdown.addEventListener('input', function() {textCountdown.innerHTML = sliderCountdown.value + "ms";}, false);
sliderRepeat.addEventListener('input', function() {textRepeat.innerHTML = sliderRepeat.value + "x";}, false);
sliderPause.addEventListener('input', function() {textPause.innerHTML = sliderPause.value + "px";}, false);
sliderDelay.addEventListener('change', requestParameterWrite, false);
sliderBrightness.addEventListener('change', requestParameterWrite, false);
sliderCountdown.addEventListener('change', requestParameterWrite, false);
sliderRepeat.addEventListener('change', requestParameterWrite, false);
sliderPause.addEventListener('change', requestParameterWrite, false);
pickerColor.addEventListener('change', requestParameterWrite, false);
ckRepeat.addEventListener('click', function() {updateCheckbox(ckRepeat,ckBounce);}, false);
ckBounce.addEventListener('click', function() {updateCheckbox(ckBounce,ckRepeat);}, false);
ckPause.addEventListener('click', function() {updateCheckbox(ckPause,ckCut);}, false);
ckCut.addEventListener('click', function() {updateCheckbox(ckCut,ckPause);}, false);
ckEndColor.addEventListener('click', function() {updateCheckbox(ckEndColor,ckEndOff);}, false);
ckEndOff.addEventListener('click', function() {updateCheckbox(ckEndOff,ckEndColor);}, false);
ckCountdown.addEventListener('click', requestParameterWrite, false);
ckInvert.addEventListener('click', requestParameterWrite, false);
ckRepeat.addEventListener('click', requestParameterWrite, false);
ckBounce.addEventListener('click', requestParameterWrite, false);
ckPause.addEventListener('click', requestParameterWrite, false);
ckCut.addEventListener('click', requestParameterWrite, false);
ckEndColor.addEventListener('click', requestParameterWrite, false);
ckEndOff.addEventListener('click', requestParameterWrite, false);
btnSave.addEventListener('click', requestParameterSave, false);
btnRestore.addEventListener('click', requestParameterRestore, false);

//--------------------------------------------------
function updateDelay()
{
	// update delay
	textDelay.innerHTML = sliderDelay.value + "ms";
	// update duration
	sliderDuration.value = (sliderStop.value-sliderStart.value)*sliderDelay.value;
	textDuration.innerHTML = sliderDuration.value + "ms";
}
// Upload Variable--------------------------------------------------
var imgConvert = new Image;
var canvasConvert = document.getElementById("canvasConvert");
var selectConvert = document.getElementById("selectConvert");
var selectGamma = document.getElementById("selectGamma");
var ckBottomTop = document.getElementById("ckBottomTop");
var sliderPixels = document.getElementById("sliderPixels");
var textPixels = document.getElementById("textPixels");
var sliderLineCut = document.getElementById("sliderLineCut");
var textLineCut = document.getElementById("textLineCut");
var btnUploadOriginal = document.getElementById("btnUploadOriginal");
var btnUploadConvert = document.getElementById("btnUploadConvert");
var btnDownloadConvert = document.getElementById("btnDownloadConvert");

// Upload event--------------------------------------------------
selectConvert.addEventListener('change', setImgConvert, false);
imgConvert.addEventListener('load', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
selectGamma.addEventListener('change', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
ckBottomTop.addEventListener('click', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
sliderPixels.addEventListener('input', function() {textPixels.innerHTML = sliderPixels.value + "px";}, false);
sliderPixels.addEventListener('change', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
sliderLineCut.addEventListener('input', function() {textLineCut.innerHTML = sliderLineCut.value + "px";}, false);
sliderLineCut.addEventListener('change', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
btnUploadOriginal.addEventListener('click', function() {upload(selectConvert.files[0],trimFileName(selectConvert.files[0].name, ""));}, false);
btnDownloadConvert.addEventListener('click', function() {download(CanvasToBMP.toDataURL(canvasConvert),trimFileName(selectConvert.files[0].name, "bmp"));}, false);
btnUploadConvert.addEventListener('click', function() {upload(CanvasToBMP.toBlob(canvasConvert),trimFileName(selectConvert.files[0].name, "bmp"));}, false);

// Main --------------------------------------------------
requestSystemRead();
requestFileList();
requestParameterRead();
requestBitmapRead();
setImgConvert();

//--------------------------------------------------
function setImgConvert()
{  
	// no selection
	if (selectConvert.files.length == 0)
	{
		// print the error
		drawError(canvasConvert, "No File");
		// options
		selectGamma.setAttribute('disabled', '');
		ckBottomTop.setAttribute('disabled', '');
		sliderPixels.setAttribute('disabled', '');
		sliderLineCut.setAttribute('disabled', '');
		// actions
		btnUploadOriginal.setAttribute('disabled', '');
		btnUploadConvert.setAttribute('disabled', '');
		btnDownloadConvert.setAttribute('disabled', '');
		return;
	}
	// test the selection
	var file = selectConvert.files[0];
	var imageType = /^image\//;
	// selection is not an image
	if (!imageType.test(file.type))
	{
		// print the error
		drawError(canvasConvert, "No Convert");
		// options
		selectGamma.setAttribute('disabled', '');
		ckBottomTop.setAttribute('disabled', '');
		sliderPixels.setAttribute('disabled', '');
		sliderLineCut.setAttribute('disabled', '');
		// actions
		btnUploadOriginal.removeAttribute('disabled', '');
		btnUploadConvert.setAttribute('disabled', '');
		btnDownloadConvert.setAttribute('disabled', '');
	}
	// selection is an image
	else
	{
		// load the image
		imgConvert.file = file;
		var reader = new FileReader();
		reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(imgConvert); 
		reader.readAsDataURL(file);
		// options
		selectGamma.removeAttribute('disabled', '');
		ckBottomTop.removeAttribute('disabled', '');
		sliderPixels.removeAttribute('disabled', '');
		sliderLineCut.removeAttribute('disabled', '');
		// actions
		btnUploadOriginal.removeAttribute('disabled', '');
		btnUploadConvert.removeAttribute('disabled', '');
		btnDownloadConvert.removeAttribute('disabled', '');
	}
}
