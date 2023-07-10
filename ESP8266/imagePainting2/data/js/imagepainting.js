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

// Variable
var address = "http://192.168.1.1";
//var address = "http://192.168.6.83";
var remainingBytes;

//--------------------------------------------------
function updateStatus(message, color)
{
	textStatus.innerHTML = message;
	textStatus.style.color = color;
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


// Status Variable--------------------------------------------------
var textStatus = document.getElementById("textStatus");

// Actions Variable--------------------------------------------------
var imgImage = new Image;
var selectImage = document.getElementById("selectImage");
var canvasImage =document.getElementById("canvasImage");
var btnDelete = document.getElementById("btnDelete");
var btnDownload = document.getElementById("btnDownload");
var sliderStart = document.getElementById("sliderStart");
var textStart = document.getElementById("textStart");
var sliderStop = document.getElementById("sliderStop");
var sliderDuration = document.getElementById("sliderDuration");
var textDuration = document.getElementById("textDuration");
var textStop = document.getElementById("textStop");
var btnLight = document.getElementById("btnLight");
var btnBurn = document.getElementById("btnBurn");
var btnStop = document.getElementById("btnStop");
var btnPlay = document.getElementById("btnPlay");

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
var ckInvert = document.getElementById("ckInvert");
var ckRepeat = document.getElementById("ckRepeat");
var ckBounce = document.getElementById("ckBounce");
var ckPause = document.getElementById("ckPause");
var ckCut = document.getElementById("ckCut");
var ckEndOff = document.getElementById("ckEndOff");
var ckEndColor = document.getElementById("ckEndColor");
var btnSave = document.getElementById("btnSave");
var btnRestore = document.getElementById("btnRestore");

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
var btnDownloadConvert = document.getElementById("btnDownloadConvert");
var btnUploadConvert = document.getElementById("btnUploadConvert");

// System Variable--------------------------------------------------
var textLedNumber = document.getElementById("textLedNumber");
var canvasSystem = document.getElementById("canvasSystem");
var canvasLegend = document.getElementById("canvasLegend");

// Collapse Variable --------------------------------------------------
var collapseActions = document.getElementById("collapseActions");
var collapseSettings = document.getElementById("collapseSettings");
var collapseUpload = document.getElementById("collapseUpload");
var collapseSystem = document.getElementById("collapseSystem");

// Actions Event--------------------------------------------------
selectImage.addEventListener('change', requestBitmapWrite, false);
imgImage.addEventListener('load', function() {drawImage(canvasImage,imgImage); drawCurtain(canvasImage,sliderStart.value,sliderStop.value);}, false);
btnDelete.addEventListener('click', function() {requestFileDelete(selectImage.value);}, false);
btnDownload.addEventListener('click', downloadFile, false);
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

// Upload event--------------------------------------------------
selectConvert.addEventListener('change', setImgConvert, false);
imgConvert.addEventListener('load', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
selectGamma.addEventListener('change', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
ckBottomTop.addEventListener('click', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
sliderPixels.addEventListener('input', function() {textPixels.innerHTML = sliderPixels.value + "px";}, false);
sliderPixels.addEventListener('change', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
sliderLineCut.addEventListener('input', function() {textLineCut.innerHTML = sliderLineCut.value + "px";}, false);
sliderLineCut.addEventListener('change', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
btnUploadOriginal.addEventListener('click', uploadOriginal, false);
btnDownloadConvert.addEventListener('click', downloadConvert, false);
btnUploadConvert.addEventListener('click', uploadConvert, false);

// Collapse event--------------------------------------------------
collapseActions.addEventListener('click', function() { collapseTable("actions");}, false);
collapseSettings.addEventListener('click', function() { collapseTable("settings");}, false);
collapseUpload.addEventListener('click', function() { collapseTable("upload");}, false);
collapseSystem.addEventListener('click', function() { collapseTable("system");}, false);
collapseActions.addEventListener('click', toggle, false);
collapseSettings.addEventListener('click', toggle, false);
collapseUpload.addEventListener('click', toggle, false);
collapseSystem.addEventListener('click', toggle, false);

// Main --------------------------------------------------
requestSystemRead();
requestFileList();
requestParameterRead();
requestBitmapRead();
setImgConvert();

//--------------------------------------------------
function updateStart()
{
	// update textStart < textStop
	sliderStop.value = Math.max(sliderStart.value,sliderStop.value);
	textStop.innerHTML = sliderStop.value + "px";
	textStart.innerHTML = sliderStart.value + "px";
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

//--------------------------------------------------
function updateDelay()
{
	// update delay
	textDelay.innerHTML = sliderDelay.value + "ms";
	// update duration
	sliderDuration.value = (sliderStop.value-sliderStart.value)*sliderDelay.value;
	textDuration.innerHTML = sliderDuration.value + "ms";
}

//--------------------------------------------------
function setBitmap(jsonString)
{
	var json = JSON.parse(jsonString);
	// set actions values
	sliderStart.setAttribute("min", json["indexMin"]);
	sliderStart.setAttribute("max", json["indexMax"]);
	sliderStart.value = json["indexStart"];
	textStart.innerHTML = sliderStart.value + "px";
	sliderStop.setAttribute("min", json["indexMin"]);
	sliderStop.setAttribute("max", json["indexMax"]);
	sliderStop.value = json["indexStop"];
	textStop.innerHTML = sliderStop.value + "px";
	sliderDuration.setAttribute("max",(json["indexStop"]-json["indexStart"])*255);
	sliderDuration.value = (json["indexStop"]-json["indexStart"])*sliderDelay.value;
	textDuration.innerHTML = sliderDuration.value + "ms";
	//
	selectImage.value = json["bmpPath"];
	if(json["isbmpload"])
	{
		sliderStart.disabled = false;
		sliderStop.disabled = false;
		sliderDuration.disabled = false;
		btnBurn.disabled = false;
		btnPlay.disabled = false;
		imgImage.src= address + "/" + json["bmpPath"];
	}
			// it isn't a bitmap
			else
			{
				sliderStart.disabled = true;
				sliderStop.disabled = true;
				sliderDuration.disabled = true;
				btnBurn.disabled = true;
				btnPlay.disabled = true;
				drawError(canvasImage, "Not Load");
			}	
		} 

//--------------------------------------------------
function getBitmap()
{
	var json = new Object();
	// get actions values
	json.indexStart = sliderStart.value;
	json.indexStop = sliderStop.value;
	json.bmpPath = selectImage.value;
	// convert json to string
	return JSON.stringify(json);
}

//--------------------------------------------------
function setFileList(jsonString)
{
	var json = JSON.parse(jsonString);
	selectImage.options.length = json.fileList.length;

	for (var i = 0; i < json.fileList.length; i++)
	{
		selectImage.options[i].value = json.fileList[i]; 
		selectImage.options[i].text = json.fileList[i]; 
	}
}

//--------------------------------------------------
function setParameter(jsonString)
{
	var json = JSON.parse(jsonString);
	// set settings values
	sliderDuration.value = (sliderStop.value-sliderStart.value)*json["delay"];
	textDuration.innerHTML = sliderDuration.value + "ms";
	sliderDelay.value = json["delay"];
	textDelay.innerHTML = sliderDelay.value + "ms";
	sliderBrightness.value = json["brightness"];
	textBrightness.innerHTML = sliderBrightness.value + "%";
	sliderCountdown.value = json["countdown"];
	textCountdown.innerHTML = sliderCountdown.value + "ms";
	ckCountdown.checked  = json["iscountdown"];
	sliderRepeat.value = json["repeat"];
	textRepeat.innerHTML = sliderRepeat.value + "x";
	ckInvert.checked  = json["isinvert"];
	ckRepeat.checked  = json["isrepeat"];
	ckBounce.checked  = json["isbounce"];
	updateCheckbox(ckRepeat,ckBounce);
	updateCheckbox(ckBounce,ckRepeat);
	sliderPause.value = json["pause"];
	textPause.innerHTML = sliderPause.value + "px";
	ckPause.checked  = json["ispause"];
	ckCut.checked  = json["iscut"];
	updateCheckbox(ckPause,ckCut);
	updateCheckbox(ckCut,ckPause);
	pickerColor.value = json["color"];
	ckEndOff.checked  = json["isendoff"];
	ckEndColor.checked  = json["isendcolor"];
	updateCheckbox(ckEndOff,ckEndColor);
	updateCheckbox(ckEndColor,ckEndOff);
}

//--------------------------------------------------
function getParameter()
{
	var json = new Object();
	// get settings values
	json.delay = sliderDelay.value;
	json.brightness = sliderBrightness.value;
	json.countdown = sliderCountdown.value;
	json.iscountdown = ckCountdown.checked;
	json.repeat = sliderRepeat.value;
	json.isinvert = ckInvert.checked;
	json.isrepeat = ckRepeat.checked;
	json.isbounce = ckBounce.checked;
	json.pause = sliderPause.value;
	json.ispause = ckPause.checked;
	json.iscut = ckCut.checked;
	json.color = pickerColor.value;
	json.isendoff = ckEndOff.checked;
	json.isendcolor = ckEndColor.checked;
	// convert json to string
	return JSON.stringify(json);
}

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

//--------------------------------------------------
function downloadFile()
{
	// create a link
	var a  = document.createElement('a');
	// create a link
	a.href = address + "/" + selectImage.value;
	// set the name of the link
	a.download = selectImage.value.substring(1);
	// download the link
	a.click();
}

//--------------------------------------------------
function downloadConvert()
{
	if (selectConvert.files.length == 0)
	{
		updateStatus("DOWNLOAD ERROR : SELECT AN IMAGE", "red");
	}
	else
	{
		updateStatus("DOWNLOAD SUCCESS", "green");
		// convert canvasConvert to blob
		var bitmap    = CanvasToBMP.toDataURL(canvasConvert);
		// create a link
		var a  = document.createElement('a');
		// set the content of the link
		a.href = bitmap;
		// set the name of the link
		a.download = trimFileName(selectConvert.files[0].name, "bmp");
		// download the link
		a.click();
	}
}

//--------------------------------------------------
function uploadConvert()
{
	if (selectConvert.files.length == 0)
	{
		updateStatus("UPLOAD ERROR : SELECT AN IMAGE", "red");
	}
	else
	{
		// convert canvasConvert to blob
		var blobConvert = CanvasToBMP.toBlob(canvasConvert);
		// too big? display an error
		if (blobConvert.size > remainingBytes)
		{
			updateStatus("UPLOAD ERROR : NOT ENOUGH SPACE", "red");
		}
		// no problem? send the file
		else
		{
			var form = new FormData();
			form.append('file', blobConvert,trimFileName(selectConvert.files[0].name, "bmp"));
			requestFileUpload(form);
		}
	}
}

//--------------------------------------------------
function uploadOriginal()
{
	if (selectConvert.files.length == 0)
	{
		updateStatus("UPLOAD ERROR : SELECT A FILE", "red");
	}
	else
	{
		// too big? display an error
		if (selectConvert.files[0].size > remainingBytes)
		{
			updateStatus("UPLOAD ERROR : NOT ENOUGH SPACE", "red");
		}
		// no problem? send the file
		else
		{
			var form = new FormData();
			form.append('file', selectConvert.files[0], trimFileName(selectConvert.files[0].name, ""));
			requestFileUpload(form);
		}
	}
}

//--------------------------------------------------
function setSystem(jsonString)
{
	var json = JSON.parse(jsonString);
	// set parameters values
	sliderPixels.setAttribute("max",json["numPixels"]);
	sliderPixels.value = json["numPixels"];
	textPixels.innerHTML = sliderPixels.value + "px";
	sliderLineCut.setAttribute("max",25);
	sliderLineCut.value = 0;
	textLineCut.innerHTML = sliderLineCut.value + "px";
	//
	textLedNumber.innerHTML = json["numPixels"] + "px";
	//
	var usedBytes = json["usedBytes"];
	var totalBytes = json["totalBytes"];
	remainingBytes = totalBytes - usedBytes;
	// set LittleFS parameters
	var myLittleFS = {
		"Used": usedBytes,
		"Remaining": remainingBytes,
	};
	// set chart parameters
	var myChart = new Piechart(
	{
		canvas:canvasSystem,
		data:myLittleFS,
		colors:["red","green"],
		legend:canvasLegend
	}
	);
	// draw the chart
	myChart.draw();
}
