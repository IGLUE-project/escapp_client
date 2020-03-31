let escapp;

$(document).ready(function(){
	console.log("Init escapp with options:");
	if(window['escapp_environment']==="production"){
		CONFIG.imagesPath = "./images/";
	}
	console.log(CONFIG);
	escapp = new ESCAPP(CONFIG);
	loadEvents();
});

let loadEvents = function(){
	$("#validate").click(function(){
		escapp.validate(function(success,er_state){
			if(success===true){
				console.log("Browser validated and user validated (authenticated, authorized and participation verified)");
				console.log("State to restore:");
				console.log(er_state);
			} else {
				console.log("Browser not supported");
			}
		});
	});
	$("#auth").click(function(){
		escapp.validateUser(function(success,er_state){
			console.log("User validated (authenticated, authorized and participation verified)");
			console.log("State to restore:");
			console.log(er_state);
		});
	});
	$("#rstate").click(function(){
		escapp.retrieveState(function(success, er_state){
			if(success===true){
				console.log("State to restore retrieved:");
				console.log(er_state);
			} else {
				console.log("No state is going to be restored.");
			}
		});
	});
	$("#spuzzle").click(function(){
		let puzzle_id = 1;
		let solution = "1234";
		let options = {};
		escapp.submitPuzzle(puzzle_id,solution,options,function(success,res){
			//Puzzle submitted
			console.log("Puzzle submitted");
			console.log("Success: " + success);
			console.log("Full escapp response:");
			console.log(res);
		});
	});
	$("#cdialog").click(function(){
		escapp.displayCustomDialog("Dialog title","Content of the dialog",function(){
			//On close dialog callback
		});
	});
	$("#ldata").click(function(){
		escapp.reset(function(){
			console.log("Local data removed");
		});
	});
	$("#rdata").click(function(){
		escapp.displayCustomDialog("Not supported","Remote data remove not supported yet");
	});
	$("#adata").click(function(){
		escapp.displayCustomDialog("Not supported","Remote data remove not supported yet");
	});
	$("#externalApp").click(function(e){
		let appUrl = $("#externalApp").attr("href");
		$("#externalApp").attr("href",escapp.addUserCredentialsToUrl(appUrl));

	});
}