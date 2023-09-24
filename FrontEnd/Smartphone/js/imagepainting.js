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
	//var address = "http://192.168.27.55";
	var FILELIST = {};
	var BITMAP = {};
	var PARAMETER = {};
	var SYSTEM = {};

	//--------------------------------------------------
	function updateStatus(message, color)
	{
		if (document.getElementById("textStatus") != null) document.getElementById("textStatus").innerHTML = message;
		if (document.getElementById("textStatus") != null) document.getElementById("textStatus").style.color = color;
		if (document.getElementById("iconStatus") != null && color == 'red') document.getElementById("iconStatus").setAttribute('icon', 'myStatusRed');
		if (document.getElementById("iconStatus") != null && color == 'orange') document.getElementById("iconStatus").setAttribute('icon', 'myStatusOrange');
		if (document.getElementById("iconStatus") != null && color == 'green') document.getElementById("iconStatus").setAttribute('icon', 'myStatusGreen');
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
		if (blob.size > SYSTEM.freeBytes)
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
		if (document.getElementById("selectAction") != null) document.getElementById("selectAction").value = BITMAP.bmpPath;
		//if (document.getElementById("btnActionDownload") != null) document.getElementById("btnActionDownload").disabled = !BITMAP.isbmpload;
		//if (document.getElementById("btnActionDelete") != null) document.getElementById("btnActionDelete").disabled = !BITMAP.isbmpload;
		if (document.getElementById("sliderActionStart") != null)
		{
			document.getElementById("sliderActionStart").setAttribute("min", BITMAP.indexMin);
			document.getElementById("sliderActionStart").setAttribute("max", BITMAP.indexMax);
			document.getElementById("sliderActionStart").value = BITMAP.indexStart;
			document.getElementById("sliderActionStart").disabled = !BITMAP.isbmpload;
		}
		if (document.getElementById("textActionStart") != null) document.getElementById("textActionStart").innerHTML = BITMAP.indexStart + "px";
		if (document.getElementById("sliderActionStop") != null)
		{
			document.getElementById("sliderActionStop").setAttribute("min", BITMAP.indexMin);
			document.getElementById("sliderActionStop").setAttribute("max", BITMAP.indexMax);
			document.getElementById("sliderActionStop").value = BITMAP.indexStop;
			document.getElementById("sliderActionStop").disabled = !BITMAP.isbmpload;
		}
		if (document.getElementById("textActionStop") != null) document.getElementById("textActionStop").innerHTML = BITMAP.indexStop + "px";
		if (document.getElementById("sliderActionLength") != null)
		{
			document.getElementById("sliderActionLength").setAttribute("max",(BITMAP.indexStop-BITMAP.indexStart)*255);
			document.getElementById("sliderActionLength").value = (BITMAP.indexStop-BITMAP.indexStart)*PARAMETER.delay;
		}
		if (document.getElementById("sliderActionLength") != null) document.getElementById("sliderActionLength").disabled = !BITMAP.isbmpload;
		if (document.getElementById("textActionLength") != null) document.getElementById("textActionLength").innerHTML = (BITMAP.indexStop-BITMAP.indexStart)*PARAMETER.delay + "ms";
		if (document.getElementById("btnActionBurn") != null) document.getElementById("btnActionBurn").disabled = !BITMAP.isbmpload;
		if (document.getElementById("btnActionPlay") != null) document.getElementById("btnActionPlay").disabled = !BITMAP.isbmpload;
		if(BITMAP.isbmpload)
		{
			imgAction.src= address + "/" + BITMAP.bmpPath;
		}
		// it isn't a bitmap
		else
		{
			if (document.getElementById("canvasAction") != null) drawError("Not Load", document.getElementById("canvasAction"));
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
		if (document.getElementById("sliderActionStart") != null) BITMAP.indexStart = document.getElementById("sliderActionStart").value;
		if (document.getElementById("sliderActionStop") != null) BITMAP.indexStop = document.getElementById("sliderActionStop").value;
		if (document.getElementById("selectAction") != null) BITMAP.bmpPath = document.getElementById("selectAction").value;
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
		if (document.getElementById("sliderActionLength") != null) document.getElementById("sliderActionLength").value = (BITMAP.indexStop-BITMAP.indexStart)*PARAMETER.delay;
		if (document.getElementById("textActionLength") != null) document.getElementById("textActionLength").innerHTML = (BITMAP.indexStop-BITMAP.indexStart)*PARAMETER.delay + "ms";
		if (document.getElementById("sliderDelay") != null) document.getElementById("sliderDelay").value = PARAMETER.delay;
		if (document.getElementById("textDelay") != null) document.getElementById("textDelay").innerHTML = PARAMETER.delay + "ms";
		if (document.getElementById("sliderBrightness") != null) document.getElementById("sliderBrightness").value = PARAMETER.brightness;
		if (document.getElementById("textBrightness") != null) document.getElementById("textBrightness").innerHTML = PARAMETER.brightness + "%";
		if (document.getElementById("sliderCountdown") != null) document.getElementById("sliderCountdown").value = PARAMETER.countdown;
		if (document.getElementById("textCountdown") != null) document.getElementById("textCountdown").innerHTML = PARAMETER.countdown + "ms";
		if (document.getElementById("ckCountdown") != null) document.getElementById("ckCountdown").checked  = PARAMETER.iscountdown;
		if (document.getElementById("sliderRepeat") != null) document.getElementById("sliderRepeat").value = PARAMETER.repeat;
		if (document.getElementById("textRepeat") != null) document.getElementById("textRepeat").innerHTML = PARAMETER.repeat + "x";
		if (document.getElementById("ckInvert") != null) document.getElementById("ckInvert").checked  = PARAMETER.isinvert;
		if (document.getElementById("ckRepeat") != null) document.getElementById("ckRepeat").checked  = PARAMETER.isrepeat;
		if (document.getElementById("ckBounce") != null) document.getElementById("ckBounce").checked  = PARAMETER.isbounce;
		if (document.getElementById("ckRepeat") != null && document.getElementById("ckBounce") != null) updateCheckbox(document.getElementById("ckRepeat"),document.getElementById("ckBounce"));
		if (document.getElementById("ckBounce") != null && document.getElementById("ckRepeat") != null) updateCheckbox(document.getElementById("ckBounce"),document.getElementById("ckRepeat"));
		if (document.getElementById("sliderVcut") != null) document.getElementById("sliderVcut").value = PARAMETER.vcut;
		if (document.getElementById("textVcut") != null) document.getElementById("textVcut").innerHTML = PARAMETER.vcut + "px";
		if (document.getElementById("ckVcutOff") != null) document.getElementById("ckVcutOff").checked  = PARAMETER.isvcutoff;
		if (document.getElementById("ckVcutColor") != null) document.getElementById("ckVcutColor").checked  = PARAMETER.isvcutcolor;
		if (document.getElementById("ckVcutOff") != null && document.getElementById("ckVcutColor") != null) updateCheckbox(document.getElementById("ckVcutOff"),document.getElementById("ckVcutColor"));
		if (document.getElementById("ckVcutColor") != null && document.getElementById("ckVcutOff") != null) updateCheckbox(document.getElementById("ckVcutColor"),document.getElementById("ckVcutOff"));
		if (document.getElementById("sliderHcut") != null) document.getElementById("sliderHcut").value = PARAMETER.hcut;
		if (document.getElementById("textHcut") != null) document.getElementById("textHcut").innerHTML = PARAMETER.hcut + "px";
		if (document.getElementById("ckHcutOff") != null) document.getElementById("ckHcutOff").checked  = PARAMETER.ishcutoff;
		if (document.getElementById("ckHcutColor") != null) document.getElementById("ckHcutColor").checked  = PARAMETER.ishcutcolor;
		if (document.getElementById("ckHcutOff") != null && document.getElementById("ckHcutColor") != null) updateCheckbox(document.getElementById("ckHcutOff"),document.getElementById("ckHcutColor"));
		if (document.getElementById("ckHcutColor") != null && document.getElementById("ckHcutOff") != null) updateCheckbox(document.getElementById("ckHcutColor"),document.getElementById("ckHcutOff"));
		if (document.getElementById("pickerColor") != null) document.getElementById("pickerColor").value = PARAMETER.color;
		if (document.getElementById("ckEndOff") != null) document.getElementById("ckEndOff").checked  = PARAMETER.isendoff;
		if (document.getElementById("ckEndColor") != null) document.getElementById("ckEndColor").checked  = PARAMETER.isendcolor;
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
		if (document.getElementById("sliderVcut") != null) PARAMETER.vcut = document.getElementById("sliderVcut").value;
		if (document.getElementById("ckVcutOff") != null) PARAMETER.isvcutoff = document.getElementById("ckVcutOff").checked;
		if (document.getElementById("ckVcutColor") != null) PARAMETER.isvcutcolor = document.getElementById("ckVcutColor").checked;
		if (document.getElementById("sliderHcut") != null) PARAMETER.hcut = document.getElementById("sliderHcut").value;
		if (document.getElementById("ckHcutOff") != null) PARAMETER.ishcutoff = document.getElementById("ckHcutOff").checked;
		if (document.getElementById("ckHcutColor") != null) PARAMETER.ishcutcolor = document.getElementById("ckHcutColor").checked;
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
		// set convert values
		if (document.getElementById("sliderConvertPixels") !=  null)
		{
			document.getElementById("sliderConvertPixels").setAttribute("max",SYSTEM.numPixels);
			document.getElementById("sliderConvertPixels").value = SYSTEM.numPixels;
		}
		if (document.getElementById("textConvertPixels") != null) document.getElementById("textConvertPixels").innerHTML = SYSTEM.numPixels + "px";
		// set generate values
		if (document.getElementById("sliderGeneratePixels") !=  null)
		{
			document.getElementById("sliderGeneratePixels").setAttribute("max",SYSTEM.numPixels);
			document.getElementById("sliderGeneratePixels").value = SYSTEM.numPixels;
		}
		if (document.getElementById("textGeneratePixels") != null) document.getElementById("textGeneratePixels").innerHTML = SYSTEM.numPixels + "px";
		// set system values
		if (document.getElementById("textSystemPixels") != null) document.getElementById("textSystemPixels").innerHTML = SYSTEM.numPixels + "px";
		// set chart parameters
		if (document.getElementById("canvasSystem") != null)
		{
			var myChart = new PieChart(
			{
				canvas:document.getElementById("canvasSystem"),
				data:{"Used": SYSTEM.usedBytes,"Free": SYSTEM.freeBytes},
				colors:["red","green"],
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
		if (document.getElementById("selectAction") !=  null)
		{
			document.getElementById("selectAction").options.length = FILELIST.fileList.length;
			
			for (var i = 0; i < FILELIST.fileList.length; i++)
			{
				document.getElementById("selectAction").options[i].value = FILELIST.fileList[i];
				document.getElementById("selectAction").options[i].text = FILELIST.fileList[i]; 
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
			//requestBitmapRead();
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
		// Status Event--------------------------------------------------
		document.getElementById("btnStatus").addEventListener('click', function () { document.getElementById("popoverStatus").show(document.getElementById("btnStatus"));}, false);

		// Actions Variable--------------------------------------------------
		var imgAction = new Image();
		var selectAction = document.getElementById("selectAction");
		var canvasAction =document.getElementById("canvasAction");
		var btnActionDelete = document.getElementById("btnActionDelete");
		var btnActionDownload = document.getElementById("btnActionDownload");
		var sliderActionStart = document.getElementById("sliderActionStart");
		var textActionStart = document.getElementById("textActionStart");
		var sliderActionStop = document.getElementById("sliderActionStop");
		var textActionStop = document.getElementById("textActionStop");
		var sliderActionLength = document.getElementById("sliderActionLength");
		var textActionLength = document.getElementById("textActionLength");
		var btnActionLight = document.getElementById("btnActionLight");
		var btnActionBurn = document.getElementById("btnActionBurn");
		var btnActionStop = document.getElementById("btnActionStop");
		var btnActionPlay = document.getElementById("btnActionPlay");

		// Actions Event--------------------------------------------------
		selectAction.addEventListener('change', requestBitmapWrite, false);
		imgAction.addEventListener('load', function() {drawAction(imgAction,canvasAction,sliderActionStart.value,sliderActionStop.value);}, false);
		btnActionDelete.addEventListener('click', function() {requestFileDelete(selectAction.value);}, false);
		btnActionDownload.addEventListener('click', function() {download(address + "/" + selectAction.value,selectAction.value.substring(1));}, false);
		sliderActionStart.addEventListener('input', updateStart, false);
		sliderActionStart.addEventListener('change', requestBitmapWrite, false);
		sliderActionStop.addEventListener('input', updateStop, false);
		sliderActionStop.addEventListener('change', requestBitmapWrite, false);
		sliderActionLength.addEventListener('input', updateDuration, false);
		sliderActionLength.addEventListener('change', requestParameterWrite, false);
		btnActionLight.addEventListener('click', function() {requestAction("/light");}, false);
		btnActionBurn.addEventListener('click', function() {requestAction("/burn");}, false);
		btnActionStop.addEventListener('click', function() {requestAction("/stop");}, false);
		btnActionPlay.addEventListener('click', function() {requestAction("/play");}, false);

		//--------------------------------------------------
		function updateStart()
		{
			// update textActionStart < textActionStop
			sliderActionStop.value = Math.max(sliderActionStart.value,sliderActionStop.value);
			textActionStart.innerHTML = sliderActionStart.value + "px";
			textActionStop.innerHTML = sliderActionStop.value + "px";
			// update duration
			sliderActionLength.setAttribute("max",(sliderActionStop.value-sliderActionStart.value)*255);
			sliderActionLength.value = (sliderActionStop.value-sliderActionStart.value)*PARAMETER.delay;
			textActionLength.innerHTML = sliderActionLength.value + "ms";
			// update canvas
			drawAction(imgAction,canvasAction,sliderActionStart.value,sliderActionStop.value);
		}

		//--------------------------------------------------
		function updateStop()
		{
			// check if start < stop
			sliderActionStart.value = Math.min(sliderActionStart.value,sliderActionStop.value);
			// update textActionStart textActionStop
			textActionStart.innerHTML = sliderActionStart.value + "px";
			textActionStop.innerHTML = sliderActionStop.value + "px";
			// update duration
			sliderActionLength.setAttribute("max",(sliderActionStop.value-sliderActionStart.value)*255);
			sliderActionLength.value = (sliderActionStop.value-sliderActionStart.value)*PARAMETER.delay;
			textActionLength.innerHTML = sliderActionLength.value + "ms";
			// update canvas
			drawAction(imgAction,canvasAction,sliderActionStart.value,sliderActionStop.value);
		}

		//--------------------------------------------------
		function updateDuration()
		{
			// update duration
			textActionLength.innerHTML = sliderActionLength.value + "ms";
			// update delay
			PARAMETER.delay = sliderActionLength.value/(sliderActionStop.value-sliderActionStart.value);
		}

		// Main --------------------------------------------------
		requestFileList();
		requestParameterRead();
		requestBitmapRead();
	}

	if (event.target.matches('#settings'))
	{

		// Status Event--------------------------------------------------
		document.getElementById("btnStatus").addEventListener('click', function () { document.getElementById("popoverStatus").show(document.getElementById("btnStatus"));}, false);

		// Settings Variable--------------------------------------------------
		var sliderDelay = document.getElementById("sliderDelay");
		var textDelay = document.getElementById("textDelay");
		var sliderBrightness = document.getElementById("sliderBrightness");
		var textBrightness = document.getElementById("textBrightness");
		var sliderCountdown = document.getElementById("sliderCountdown");
		var textCountdown = document.getElementById("textCountdown");
		var sliderRepeat = document.getElementById("sliderRepeat");
		var textRepeat = document.getElementById("textRepeat");
		var sliderVcut = document.getElementById("sliderVcut");
		var textVcut = document.getElementById("textVcut");
		var sliderHcut = document.getElementById("sliderHcut");
		var textHcut = document.getElementById("textHcut");
		var pickerColor = document.getElementById("pickerColor");
		var ckCountdown = document.getElementById("ckCountdown");
		var ckInvert = document.getElementById("ckInvert");
		var ckRepeat = document.getElementById("ckRepeat");
		var ckBounce = document.getElementById("ckBounce");
		var ckVcutOff = document.getElementById("ckVcutOff");
		var ckVcutColor = document.getElementById("ckVcutColor");
		var ckHcutOff = document.getElementById("ckHcutOff");
		var ckHcutColor = document.getElementById("ckHcutColor");
		var ckEndOff = document.getElementById("ckEndOff");
		var ckEndColor = document.getElementById("ckEndColor");
		var btnSave = document.getElementById("btnSave");
		var btnRestore = document.getElementById("btnRestore");

		// Settings Event--------------------------------------------------
		sliderDelay.addEventListener('input', function() { textDelay.innerHTML = sliderDelay.value + "ms";}, false);
		sliderBrightness.addEventListener('input', function() {textBrightness.innerHTML = sliderBrightness.value + "%";}, false);
		sliderCountdown.addEventListener('input', function() {textCountdown.innerHTML = sliderCountdown.value + "ms";}, false);
		sliderRepeat.addEventListener('input', function() {textRepeat.innerHTML = sliderRepeat.value + "x";}, false);
		sliderVcut.addEventListener('input', function() {textVcut.innerHTML = sliderVcut.value + "px";}, false);
		sliderHcut.addEventListener('input', function() {textHcut.innerHTML = sliderHcut.value + "px";}, false);
		sliderDelay.addEventListener('change', requestParameterWrite, false);
		sliderBrightness.addEventListener('change', requestParameterWrite, false);
		sliderCountdown.addEventListener('change', requestParameterWrite, false);
		sliderRepeat.addEventListener('change', requestParameterWrite, false);
		sliderVcut.addEventListener('change', requestParameterWrite, false);
		sliderHcut.addEventListener('change', requestParameterWrite, false);
		pickerColor.addEventListener('change', requestParameterWrite, false);
		ckRepeat.addEventListener('click', function() {updateCheckbox(ckRepeat,ckBounce);}, false);
		ckBounce.addEventListener('click', function() {updateCheckbox(ckBounce,ckRepeat);}, false);
		ckVcutOff.addEventListener('click', function() {updateCheckbox(ckVcutOff,ckVcutColor);}, false);
		ckVcutColor.addEventListener('click', function() {updateCheckbox(ckVcutColor,ckVcutOff);}, false);
		ckHcutOff.addEventListener('click', function() {updateCheckbox(ckHcutOff,ckHcutColor);}, false);
		ckHcutColor.addEventListener('click', function() {updateCheckbox(ckHcutColor,ckHcutOff);}, false);
		ckEndColor.addEventListener('click', function() {updateCheckbox(ckEndColor,ckEndOff);}, false);
		ckEndOff.addEventListener('click', function() {updateCheckbox(ckEndOff,ckEndColor);}, false);
		ckCountdown.addEventListener('click', requestParameterWrite, false);
		ckInvert.addEventListener('click', requestParameterWrite, false);
		ckRepeat.addEventListener('click', requestParameterWrite, false);
		ckBounce.addEventListener('click', requestParameterWrite, false);
		ckVcutOff.addEventListener('click', requestParameterWrite, false);
		ckVcutColor.addEventListener('click', requestParameterWrite, false);
		ckHcutOff.addEventListener('click', requestParameterWrite, false);
		ckHcutColor.addEventListener('click', requestParameterWrite, false);
		ckEndColor.addEventListener('click', requestParameterWrite, false);
		ckEndOff.addEventListener('click', requestParameterWrite, false);
		btnSave.addEventListener('click', requestParameterSave, false);
		btnRestore.addEventListener('click', requestParameterRestore, false);

		// Main --------------------------------------------------
		requestParameterRead();
	}

	if (event.target.matches('#convert'))
	{
		// Status Event--------------------------------------------------
		document.getElementById("btnStatus").addEventListener('click', function () { document.getElementById("popoverStatus").show(document.getElementById("btnStatus"));}, false);

		// Convert Variable--------------------------------------------------
		var imgConvert = new Image();
		var canvasConvert = document.getElementById("canvasConvert");
		var selectConvert = document.getElementById("selectConvert");
		var selectConvertGamma = document.getElementById("selectConvertGamma");
		var selectConvertOrientation = document.getElementById("selectConvertOrientation");
		var sliderConvertPixels = document.getElementById("sliderConvertPixels");
		var textConvertPixels = document.getElementById("textConvertPixels");
		var btnConvertOriginal = document.getElementById("btnConvertOriginal");
		var btnConvertUpload = document.getElementById("btnConvertUpload");
		var btnConvertDownload = document.getElementById("btnConvertDownload");

		// Convert event--------------------------------------------------
		selectConvert.addEventListener('change', setImgConvert, false);
		imgConvert.addEventListener('load', function() {drawConvert(imgConvert, canvasConvert, selectConvertOrientation.value, selectConvertGamma.value, sliderConvertPixels.value, sliderConvertPixels.getAttribute("max"));}, false);
		selectConvertGamma.addEventListener('change', function() {drawConvert(imgConvert, canvasConvert, selectConvertOrientation.value, selectConvertGamma.value, sliderConvertPixels.value, sliderConvertPixels.getAttribute("max"));}, false);
		selectConvertOrientation.addEventListener('change', function() {drawConvert(imgConvert, canvasConvert, selectConvertOrientation.value, selectConvertGamma.value, sliderConvertPixels.value, sliderConvertPixels.getAttribute("max"));}, false);
		sliderConvertPixels.addEventListener('input', function() {textConvertPixels.innerHTML = sliderConvertPixels.value + "px";}, false);
		sliderConvertPixels.addEventListener('change', function() {drawConvert(imgConvert, canvasConvert, selectConvertOrientation.value, selectConvertGamma.value, sliderConvertPixels.value, sliderConvertPixels.getAttribute("max"));}, false);
		btnConvertOriginal.addEventListener('click', function() {upload(selectConvert.files[0],trimFileName(selectConvert.files[0].name, ""));}, false);
		btnConvertUpload.addEventListener('click', function() {upload(CanvasToBMP.toBlob(canvasConvert),trimFileName(selectConvert.files[0].name, "bmp"));}, false);
		btnConvertDownload.addEventListener('click', function() {download(CanvasToBMP.toDataURL(canvasConvert),trimFileName(selectConvert.files[0].name, "bmp"));}, false);

		//--------------------------------------------------
		function setImgConvert()
		{  
			// no selection
			if (selectConvert.files.length == 0)
			{
				// print the error
				drawError("No File",canvasConvert);
				// options
				selectConvertGamma.setAttribute('disabled', '');
				selectConvertOrientation.setAttribute('disabled', '');
				sliderConvertPixels.setAttribute('disabled', '');
				// actions
				btnConvertOriginal.setAttribute('disabled', '');
				btnConvertUpload.setAttribute('disabled', '');
				btnConvertDownload.setAttribute('disabled', '');
				return;
			}
			// test the selection
			var file = selectConvert.files[0];
			var imageType = /^image\//;
			// selection is not an image
			if (!imageType.test(file.type))
			{
				// print the error
				drawError("No Convert",canvasConvert);
				// options
				selectConvertGamma.setAttribute('disabled', '');
				selectConvertOrientation.setAttribute('disabled', '');
				sliderConvertPixels.setAttribute('disabled', '');
				// actions
				btnConvertOriginal.removeAttribute('disabled', '');
				btnConvertUpload.setAttribute('disabled', '');
				btnConvertDownload.setAttribute('disabled', '');
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
				selectConvertGamma.removeAttribute('disabled', '');
				selectConvertOrientation.removeAttribute('disabled', '');
				sliderConvertPixels.removeAttribute('disabled', '');
				// actions
				btnConvertOriginal.removeAttribute('disabled', '');
				btnConvertUpload.removeAttribute('disabled', '');
				btnConvertDownload.removeAttribute('disabled', '');
			}
		}

		// Main --------------------------------------------------
		requestSystemRead();
		setImgConvert();
	}
	
	if (event.target.matches('#generate'))
	{
		// Status Event--------------------------------------------------
		document.getElementById("btnStatus").addEventListener('click', function () { document.getElementById("popoverStatus").show(document.getElementById("btnStatus"));}, false);

		// Generate Variable--------------------------------------------------
		var canvasGenerateTemp = document.createElement("canvas");
		var canvasGenerate = document.getElementById("canvasGenerate");
		var selectGenerate = document.getElementById("selectGenerate");
		var selectGenerateGamma = document.getElementById("selectGenerateGamma");
		var selectGenerateOrientation = document.getElementById("selectGenerateOrientation");
		var sliderGeneratePixels = document.getElementById("sliderGeneratePixels");
		var textGeneratePixels = document.getElementById("textGeneratePixels");
		var btnGenerateRefresh = document.getElementById("btnGenerateRefresh");
		var btnGenerateUpload = document.getElementById("btnGenerateUpload");
		var btnGenerateDownload = document.getElementById("btnGenerateDownload");
		
		// Generate event--------------------------------------------------
		selectGenerate.addEventListener('change', function() {generate(canvasGenerateTemp, selectGenerate.value); drawConvert(canvasGenerateTemp, canvasGenerate, selectGenerateOrientation.value, selectGenerateGamma.value, sliderGeneratePixels.value, sliderGeneratePixels.getAttribute("max"));}, false);
		selectGenerateGamma.addEventListener('change', function() {drawConvert(canvasGenerateTemp, canvasGenerate, selectGenerateOrientation.value, selectGenerateGamma.value, sliderGeneratePixels.value, sliderGeneratePixels.getAttribute("max"));}, false);
		selectGenerateOrientation.addEventListener('change', function() {drawConvert(canvasGenerateTemp, canvasGenerate, selectGenerateOrientation.value, selectGenerateGamma.value, sliderGeneratePixels.value, sliderGeneratePixels.getAttribute("max"));}, false);
		sliderGeneratePixels.addEventListener('input', function() {textGeneratePixels.innerHTML = sliderGeneratePixels.value + "px";}, false);
		sliderGeneratePixels.addEventListener('change', function() {drawConvert(canvasGenerateTemp, canvasGenerate, selectGenerateOrientation.value, selectGenerateGamma.value, sliderGeneratePixels.value, sliderGeneratePixels.getAttribute("max"));}, false);
		btnGenerateRefresh.addEventListener('click', function() {generate(canvasGenerateTemp, selectGenerate.value); drawConvert(canvasGenerateTemp, canvasGenerate, selectGenerateOrientation.value, selectGenerateGamma.value, sliderGeneratePixels.value, sliderGeneratePixels.getAttribute("max"));}, false);
		btnGenerateDownload.addEventListener('click', function() {download(CanvasToBMP.toDataURL(canvasGenerate),selectGenerate.value+".bmp");}, false);
		btnGenerateUpload.addEventListener('click', function() {upload(CanvasToBMP.toBlob(canvasGenerate),selectGenerate.value+".bmp");}, false);

		//Main--------------------------------------------------
		requestSystemRead();
		setTimeout(function(){
			generate(canvasGenerateTemp, selectGenerate.value);
			drawConvert(canvasGenerateTemp, canvasGenerate, selectGenerateOrientation.value, selectGenerateGamma.value, sliderGeneratePixels.value, sliderGeneratePixels.getAttribute("max"));
		}, 500);
	}

	if (event.target.matches('#system'))
	{
		// Status Event--------------------------------------------------
		document.getElementById("btnStatus").addEventListener('click', function () { document.getElementById("popoverStatus").show(document.getElementById("btnStatus"));}, false);

		//Main--------------------------------------------------
		requestSystemRead();
	}

}, false);
