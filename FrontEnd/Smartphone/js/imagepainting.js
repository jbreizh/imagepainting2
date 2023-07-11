//"use strict";

// onsen menu
window.fn = {};

window.fn.open = function() {
	var menu = document.getElementById('menu');
	menu.open();
};

window.fn.load = function(page) {
	var content = document.getElementById('content');
	var menu = document.getElementById('menu');
	content.load(page)
	.then(menu.close.bind(menu));
};

document.addEventListener('init', function(event) {

	// Variable
	var address = "";
	//var address = "http://192.168.6.83";
	var remainingBytes;

	//--------------------------------------------------
	function updateStatus(message, color)
	{
		textStatus.innerHTML = message;
		textStatus.style.color = color;
		if (color == 'red')
			iconStatus.setAttribute('icon', 'myStatusRed');

		if (color == 'orange')
			iconStatus.setAttribute('icon', 'myStatusOrange');

		if (color == 'green')
			iconStatus.setAttribute('icon', 'myStatusGreen');
	}

	//--------------------------------------------------
	function updateCheckbox(checkboxFrom, checkboxTo)
	{
		if(checkboxFrom.checked)
		{
			checkboxTo.disabled = true;
		}
		else
		{
			checkboxTo.disabled = false;
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

if (event.target.matches('#actions'))
{
		// Status Variable--------------------------------------------------
		var btnStatus = document.getElementById("btnStatus");
		var textStatus = document.getElementById("textStatus");
		var iconStatus = document.getElementById("iconStatus");
		var popoverStatus = document.getElementById("popoverStatus");

		// File Variable--------------------------------------------------
		var imgImage = new Image;
		var selectImage = document.getElementById("selectImage");
		var btnDelete = document.getElementById("btnDelete");
		var btnDownload = document.getElementById("btnDownload");
		var canvasImage =document.getElementById("canvasImage");
		var sliderStart = document.getElementById("sliderStart");
		var textStart = document.getElementById("textStart");
		var sliderStop = document.getElementById("sliderStop");
		var textStop = document.getElementById("textStop");

		// Options Variable--------------------------------------------------
		var delay;
		var sliderDuration = document.getElementById("sliderDuration");
		var textDuration = document.getElementById("textDuration");

		// Actions Variable--------------------------------------------------
		var btnLight = document.getElementById("btnLight");
		var btnBurn = document.getElementById("btnBurn");
		var btnStop = document.getElementById("btnStop");
		var btnPlay = document.getElementById("btnPlay");

		// Status Event--------------------------------------------------
		btnStatus.addEventListener('click', function () { popoverStatus.show(btnStatus);}, false);

		// Image Event--------------------------------------------------
		selectImage.addEventListener('change', requestBitmapWrite, false);
		btnDelete.addEventListener('click', function() {requestFileDelete(selectImage.value);}, false);
		btnDownload.addEventListener('click', downloadFile, false);
		imgImage.addEventListener('load', function() {drawImage(canvasImage,imgImage); drawCurtain(canvasImage,sliderStart.value,sliderStop.value);}, false);
		sliderStart.addEventListener('input', updateStart, false);
		sliderStart.addEventListener('input', function() {drawImage(canvasImage,imgImage); drawCurtain(canvasImage,sliderStart.value,sliderStop.value);}, false);
		sliderStart.addEventListener('change', requestBitmapWrite, false);
		sliderStop.addEventListener('input', updateStop, false);
		sliderStop.addEventListener('input', function() {drawImage(canvasImage,imgImage); drawCurtain(canvasImage,sliderStart.value,sliderStop.value);}, false);
		sliderStop.addEventListener('change', requestBitmapWrite, false);

		// Options Event--------------------------------------------------
		sliderDuration.addEventListener('input', updateDuration, false);
		sliderDuration.addEventListener('change', requestParameterWrite, false);

		// Actions Event--------------------------------------------------
		btnLight.addEventListener('click', function() {requestAction("/light");}, false);
		btnBurn.addEventListener('click', function() {requestAction("/burn");}, false);
		btnStop.addEventListener('click', function() {requestAction("/stop");}, false);
		btnPlay.addEventListener('click', function() {requestAction("/play");}, false);

		// Main --------------------------------------------------
		requestFileList();
		requestParameterRead();
		requestBitmapRead();

		//--------------------------------------------------
		function updateStart()
		{
			// update textStart < textStop
			sliderStop.value = Math.max(sliderStart.value,sliderStop.value);
			textStart.innerHTML = sliderStart.value + "px";
			textStop.innerHTML = sliderStop.value + "px";
			// update duration
			sliderDuration.setAttribute("max",(sliderStop.value-sliderStart.value)*255);
			sliderDuration.value = (sliderStop.value-sliderStart.value)*delay;
			textDuration.innerHTML = sliderDuration.value + "ms";
		}

		//--------------------------------------------------
		function updateStop()
		{
			// check if start < stop
			sliderStart.value = Math.min(sliderStart.value,sliderStop.value);
			textStart.innerHTML = sliderStart.value + "px";
			textStop.innerHTML = sliderStop.value + "px";
			// update duration
			sliderDuration.setAttribute("max",(sliderStop.value-sliderStart.value)*255);
			sliderDuration.value = (sliderStop.value-sliderStart.value)*delay;
			textDuration.innerHTML = sliderDuration.value + "ms";
		}

		//--------------------------------------------------
		function updateDuration()
		{
			// update duration
			textDuration.innerHTML = sliderDuration.value + "ms";
			// update delay
			delay = sliderDuration.value/(sliderStop.value-sliderStart.value);
		}

		//--------------------------------------------------
		function setParameter(jsonString)
		{
			var json = JSON.parse(jsonString);
			// set parameters values
			sliderDuration.value = (sliderStop.value-sliderStart.value)*json["delay"];
			textDuration.innerHTML = sliderDuration.value + "ms";
			delay = json["delay"];
		}

		//--------------------------------------------------
		function getParameter()
		{
			var json = new Object();
			// get parameters
			json.delay = delay;
			// convert json to string
			return JSON.stringify(json);
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
			sliderDuration.value = (json["indexStop"]-json["indexStart"])*delay;
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
		function setSystem(jsonString)
		{

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
	}

	if (event.target.matches('#settings'))
	{
		// Status Variable--------------------------------------------------
		var btnStatus = document.getElementById("btnStatus");
		var textStatus = document.getElementById("textStatus");
		var iconStatus = document.getElementById("iconStatus");
		var popoverStatus = document.getElementById("popoverStatus");

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

		// Status Event--------------------------------------------------
		btnStatus.addEventListener('click', function () { popoverStatus.show(btnStatus);}, false);

		// Settings Event--------------------------------------------------
		sliderDelay.addEventListener('input', function() { textDelay.innerHTML = sliderDelay.value + "ms";}, false);
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

		// Main --------------------------------------------------
		requestParameterRead();

		//--------------------------------------------------
		function setParameter(jsonString)
		{
			var json = JSON.parse(jsonString);
			// set parameters values
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
			// get parameters
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
	}

	if (event.target.matches('#upload'))
	{
		// Status Variable--------------------------------------------------
		var btnStatus = document.getElementById("btnStatus");
		var textStatus = document.getElementById("textStatus");
		var iconStatus = document.getElementById("iconStatus");
		var popoverStatus = document.getElementById("popoverStatus");

		// Files Variable--------------------------------------------------
		var imgConvert = new Image;
		var canvasConvert = document.getElementById("canvasConvert");
		var selectConvert = document.getElementById("selectConvert");

		// Options Variable--------------------------------------------------
		var selectGamma = document.getElementById("selectGamma");
		var ckBottomTop = document.getElementById("ckBottomTop");
		var sliderPixels = document.getElementById("sliderPixels");
		var textPixels = document.getElementById("textPixels");
		var sliderLineCut = document.getElementById("sliderLineCut");
		var textLineCut = document.getElementById("textLineCut");

		// Action Variable--------------------------------------------------
		var btnUploadOriginal = document.getElementById("btnUploadOriginal");
		var btnUploadConvert = document.getElementById("btnUploadConvert");
		var btnDownloadConvert = document.getElementById("btnDownloadConvert");

		// Status Event--------------------------------------------------
		btnStatus.addEventListener('click', function () { popoverStatus.show(btnStatus);}, false);

		// File event--------------------------------------------------
		selectConvert.addEventListener('change', setImgConvert, false);
		imgConvert.addEventListener('load', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);

		// Options Event--------------------------------------------------
		selectGamma.addEventListener('change', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
		ckBottomTop.addEventListener('click', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
		sliderPixels.addEventListener('input', function() {textPixels.innerHTML = sliderPixels.value + "px";}, false);
		sliderPixels.addEventListener('change', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
		sliderLineCut.addEventListener('input', function() {textLineCut.innerHTML = sliderLineCut.value + "px";}, false);
		sliderLineCut.addEventListener('change', function() {drawConvert(canvasConvert, imgConvert, ckBottomTop.checked, sliderPixels.value, sliderPixels.getAttribute("max")); drawGamma(canvasConvert, selectGamma.value); drawCut(canvasConvert, sliderLineCut.value);}, false);
		// Actions Event--------------------------------------------------
		btnUploadOriginal.addEventListener('click', uploadOriginal, false);
		btnDownloadConvert.addEventListener('click', downloadConvert, false);
		btnUploadConvert.addEventListener('click', uploadConvert, false);

		// Main --------------------------------------------------
		requestSystemRead();
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
			var usedBytes = json["usedBytes"];
			var totalBytes = json["totalBytes"];
			remainingBytes = totalBytes-usedBytes;
		}

		//--------------------------------------------------
		function setFileList(jsonString)
		{

		}

		//--------------------------------------------------
		function setBitmap(jsonString)
		{

		}

		//--------------------------------------------------
		function downloadConvert()
		{
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

		//--------------------------------------------------
		function uploadConvert()
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

		//--------------------------------------------------
		function uploadOriginal()
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

	if (event.target.matches('#system'))
	{

		// Status Variable--------------------------------------------------
		var btnStatus = document.getElementById("btnStatus");
		var textStatus = document.getElementById("textStatus");
		var iconStatus = document.getElementById("iconStatus");
		var popoverStatus = document.getElementById("popoverStatus");

		// System Variable--------------------------------------------------
		var textLedNumber = document.getElementById("textLedNumber");
		var canvasSystem = document.getElementById("canvasSystem");
		var canvasLegend = document.getElementById("canvasLegend");

		// Status Event--------------------------------------------------
		btnStatus.addEventListener('click', function () { popoverStatus.show(btnStatus);}, false);

		//Main--------------------------------------------------
		requestSystemRead();

		//--------------------------------------------------
		function setSystem(jsonString)
		{
			var json = JSON.parse(jsonString);
			// set parameters values
			textLedNumber.innerHTML = json["numPixels"];
			var usedBytes = json["usedBytes"];
			var totalBytes = json["totalBytes"];
			var remainingBytes = totalBytes - usedBytes;
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
	}

}, false);
