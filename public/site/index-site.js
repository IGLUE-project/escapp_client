let escapp;
let puzzleId = 1;

$(document).ready(function(){
	ESCAPP_CLIENT_SETTINGS.onNewErStateCallback = function(erState){
		console.log("onNewErStateCallback");
		console.log(erState);
	};
	ESCAPP_CLIENT_SETTINGS.onErRestartCallback = function(erState){
		console.log("onErRestartCallback");
		console.log(erState);
	};
	console.log("Init Escapp client with ESCAPP_CLIENT_SETTINGS:");
	console.log(ESCAPP_CLIENT_SETTINGS);
	escapp = new ESCAPP();
	console.log("Escapp client settings after initiation:");
	console.log(escapp.getSettings());

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
				console.log("Browser not supported");
			}
		});
	});

	$("#auth").click(function(){
		escapp.validateUser(function(success,erState){
			console.log("User validated (authenticated, authorized and participation verified)");
			console.log("State to restore:");
			console.log(erState);
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
		puzzleId = 0;
		escapp.reset(function(){
			console.log("Local data removed");
		});
	});

	$("#spuzzle, #pdialog").click(function(){
		let dialogOptions = {};
		// dialogOptions.inputs = [{"type":"password"}];
		escapp.displayPuzzleDialog("Puzzle " + puzzleId,"Introduce the solution to the puzzle",dialogOptions,function(dialogResponse){
			//On close dialog callback
			if(dialogResponse.choice === "ok"){
				let puzzleSolution = dialogResponse.value;
				console.log("Puzzle solution sent: " + puzzleSolution);
				escapp.submitPuzzle(puzzleId,puzzleSolution,{},function(success,res){
					//Puzzle submitted
					console.log("Puzzle submitted (puzzleId = " + puzzleId + ")");
					console.log("Success: " + success);
					console.log("Full Escapp response:");
					console.log(res);
					if(success === true){
						puzzleId = puzzleId + 1;
					}
				});
			} else {
				console.log("No puzzle solution was specified");
			}
		});
	});

	$("#cpuzzle").click(function(){
		let dialogOptions = {};
		// dialogOptions.inputs = [{"type":"password"}];
		escapp.displayPuzzleDialog("Puzzle " + puzzleId,"Introduce the solution to the puzzle",dialogOptions,function(dialogResponse){
			//On close dialog callback
			if(dialogResponse.choice === "ok"){
				let puzzleSolution = dialogResponse.value;
				console.log("Puzzle solution sent: " + puzzleSolution);
				escapp.checkPuzzle(puzzleId,puzzleSolution,{},function(success,res){
					//Puzzle submitted
					console.log("Puzzle checked (puzzleId = " + puzzleId + ")");
					console.log("Success: " + success);
					console.log("Full Escapp response:");
					console.log(res);
					if(success === true){
						puzzleId = puzzleId + 1;
					}
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