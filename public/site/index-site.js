let escapp;

document.addEventListener("DOMContentLoaded", function() {
    if(typeof ESCAPP_CLIENT_SETTINGS != "object"){
		ESCAPP_CLIENT_SETTINGS = {};
	}
	ESCAPP_CLIENT_SETTINGS.jQuery = true;
	ESCAPP_CLIENT_SETTINGS.onNewErStateCallback = function(erState){
		console.log("onNewErStateCallback");
		console.log(erState);
	};
	ESCAPP_CLIENT_SETTINGS.onErRestartCallback = function(erState){
		console.log("onErRestartCallback");
		console.log(erState);
	};
	escapp = new ESCAPP(ESCAPP_CLIENT_SETTINGS);
	console.log("Escapp client initiated with settings:", escapp.getSettings());
	console.log("App settings", escapp.getAppSettings());
	loadEvents();
});

let loadEvents = function(){
	$("#validate").click(function(){
		escapp.validate(function(success,erState){
			if(success===true){
				console.log("Browser validated and user validated (authenticated, authorized and participation verified)");
				console.log("State to restore:");
				console.log(erState);
			} else {
				console.log("User has not been validated");
			}
		});
	});

	$("#auth").click(function(){
		escapp.validateUser(function(success,erState){
			if(success){
				console.log("User validated (authenticated, authorized and participation verified)");
				console.log("State to restore:");
				console.log(erState);
			} else {
				console.log("User has not been authenticated");
			}
		});
	});

	$("#rstate").click(function(){
		escapp.retrieveState(function(success, erState){
			if(success===true){
				console.log("State to restore retrieved:");
				console.log(erState);
			} else {
				console.log("No state is going to be restored.");
			}
		});
	});

	$("#externalApp").click(function(e){
		let appUrl = $("#externalApp").attr("href");
		$("#externalApp").attr("href",escapp.addEscappSettingsToUrl(appUrl));

	});

	$("#ldata").click(function(){
		escapp.reset(function(){
			console.log("Local data removed");
		});
	});

	$("#spuzzle, #pdialog").click(function(){
		//Validation required
		if(escapp.isUserValidParticipant()===false){
			return escapp.displayCustomEscappDialog("Validation required","The user must be validated before submitting a solution. To do so, click the 'Validate' button.");
		}
		let dialogOptions = {};
		// dialogOptions.inputs = [{"type":"password"}];
		escapp.displayPuzzleDialog("Puzzle " + escapp.getNextPuzzle(),"Introduce the solution to the puzzle", dialogOptions, function(dialogResponse){
			//On close dialog callback
			if(dialogResponse.choice === "ok"){
				let puzzleSolution = dialogResponse.value;
				console.log("The solution '" + puzzleSolution + "' has been sent for puzzle " + escapp.getNextPuzzle());
				escapp.submitNextPuzzle(puzzleSolution,{},function(success,res){
					//Puzzle submitted
					console.log("Success: " + success);
					console.log("Full Escapp response:");
					console.log(res);
				});
			} else {
				console.log("No puzzle solution was specified");
			}
		});
	});

	$("#cpuzzle").click(function(){
		//Validation required
		if(escapp.isUserValidParticipant()===false){
			return escapp.displayCustomEscappDialog("Validation required","The user must be validated before checking a solution. To do so, click the 'Validate' button.");
		}
		let dialogOptions = {};
		// dialogOptions.inputs = [{"type":"password"}];
		escapp.displayPuzzleDialog("Puzzle " + escapp.getNextPuzzle(),"Introduce the solution to the puzzle", dialogOptions, function(dialogResponse){
			//On close dialog callback
			if(dialogResponse.choice === "ok"){
				let puzzleSolution = dialogResponse.value;
				console.log("The solution '" + puzzleSolution + "' has been sent for puzzle " + escapp.getNextPuzzle());
				escapp.checkNextPuzzle(puzzleSolution,{},function(success,res){
					//Puzzle submitted
					console.log("Success: " + success);
					console.log("Full Escapp response:");
					console.log(res);
				});
			} else {
				console.log("No puzzle solution was specified");
			}
		});
	});
	
	$("#cedialog").click(function(){
		escapp.displayCustomEscappDialog("Dialog title","Content of the escapp dialog",{},function(){
			//On close dialog callback
		});
	});

	$("#cdialog").click(function(){
		escapp.displayCustomDialog("Dialog title","Content of the custom dialog",{},function(){
			//On close dialog callback
		});
	});

	$("#scdialog").click(function(){
		escapp.displayCompletionDialog({},function(){
			//On close dialog callback
		});
	});

	$("#notification").click(function(){
		if(escapp.getSettings().notifications === false){
			return escapp.displayCustomEscappDialog("Notifications disabled","You must enable notifications to show notifications through Escapp client");
		}
		escapp.displayCustomEscappNotification("Content of the custom escapp notification");
		// escapp.displayCustomNotification("Content of the custom ranking notification",{type: "ranking"});
		// escapp.displayCustomNotification("Content of the custom warning notification",{type: "warning"});
		// escapp.displayCustomNotification("Content of the custom info notification",{type: "info"});
		// escapp.displayCustomNotification("Content of the custom event notification",{type: "event"});
		// escapp.displayCustomNotification("Content of the custom time notification", {type: "time", autoHide: false});
		// escapp.displayCustomNotification("Content of the custom error notification", {type: "error", autoHide: true});
	});
	
	$("#startAnimation").click(function(){
		escapp.startAnimation("confetti");
	});

	$("#stopAnimation").click(function(){
		escapp.stopAnimation("confetti");
	});
}