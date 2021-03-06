//Note: Work is still in progress, code is not refined and optimized yet,
//as my main goal currently is to make the bot do all things that i want it to do.
//However, suggestions are welcome :)

//var to contain BotMessage, also shared on the main chatWindow page, use with caution
var botMessage = "Hey there, I'm a bot.";

//var which is used in creating a new project table
var projectDefineSteps = 0;

//var which is used in creating/revealing an issue/a commit for/of a project
var issueDefineSteps = 0;
var issueShowLatestSteps = 0;
var issueShowSteps = 0;
var issueId = 0;
var projectNameForIssue = "";
var issueDeletion = 0;

//var to contain BotMessage, not shared with the main chatWindow page (used in different processes defined below)
var returnMessage = "";

//var to control the saving of message on the main chatWindow from here
//due to many asynchronous calls, sometimes due to delay the ordering of bot and user messages may suffer.
//therefore inorder to control this, these vars are used.
var dontAllowBotToSendMessage = 0;
var dontSaveThisUserMessage = 0;

var bot = "bot";

//-------API vars-------//
//For API keys ask/email me or create your own key at their site. It's free to get a API Key

//used Intrinio API to get stock related info of a company.
//awesome API, should try it out.
var stockCompanyPause;
var stockCompanyName = "";

var doctorBotSevere = 0;

//This function is called from the main chatWindow.php page
//It is run whenever the message contains "OK Bot" or the bot is performing a function (creating a new project, commiting an issue, etc.) and requires more data from user
function findTheServiceRequired(message, teamName, currrentUsername){

	//by default let the main chatWindow control the saving of messages.
	dontAllowBotToSendMessage = 0;
	dontSaveThisUserMessage = 0;

	//Below, are multi if-else statements which are nothing but rules which tell the bot to do certain things.

	//this rules initializes all the variables which basically ends every process which the bot was previously doing.
	if(message.toLowerCase().indexOf("revert last command") >= 0){

		dontAllowBotToSendMessage = 0;

		botMessage = "No Problem, reverting the last command";

		botAction.initializeAllVariables();

	//this rule picks up a random joke from the array below in botAction object literal.
	}else if((message.toLowerCase().indexOf("humor me") >= 0) || (message.toLowerCase().indexOf("have any joke") >= 0) || (message.toLowerCase().indexOf("joke of the moment") >= 0) || (message.toLowerCase().indexOf("make me laugh") >= 0) || (message.toLowerCase().indexOf("a joke for me") >= 0)){

		//console.log("Jokes");
		dontAllowBotToSendMessage = 1;
		dontSaveThisUserMessage = 1;

		botAction.saveMessage(teamName, message, currrentUsername);
		botAction.saveMessage(teamName, "Picking a good one for ya", bot);

		botAction.getJokes(teamName);

		botAction.initializeAllVariables();

	//this rule sets botMessage to current local time
	}else if((message.toLowerCase().indexOf("what's the time") >= 0) || (message.toLowerCase().indexOf("whats the time") >= 0) || (message.toLowerCase().indexOf("what is the time") >= 0) || (message.toLowerCase().indexOf("what's the time?") >= 0) || (message.toLowerCase().indexOf("whats the time?") >= 0) || (message.toLowerCase().indexOf("what is the time?") >= 0)){

		//console.log("Get Time");

		botMessage = "Current Time is ";
		botMessage += botAction.getTime();

		botAction.initializeAllVariables();

	//this rule sets botMessage to current local date
	}else if((message.toLowerCase().indexOf("what's the date") >= 0) || (message.toLowerCase().indexOf("whats the date") >= 0) || (message.toLowerCase().indexOf("what is the date") >= 0) || (message.toLowerCase().indexOf("what's the date?") >= 0) || (message.toLowerCase().indexOf("whats the date?") >= 0) || (message.toLowerCase().indexOf("what is the date?") >= 0)){

		//console.log("Get Time");

		botMessage = "Current Date is ";
		botMessage += botAction.getDate();

		botAction.initializeAllVariables();

	//this rule is used to define a new project, tells user to write the name of the project
	}else if(((message.toLowerCase().indexOf("define a new project") >= 0) || (message.toLowerCase().indexOf("create a new project") >= 0) || (message.toLowerCase().indexOf("create a project") >= 0) || (message.toLowerCase().indexOf("define a project") >= 0)) && (projectDefineSteps == 0)){

		//console.log("Create a new Project");

		botMessage = "Alright, what's the name of the project?";

		botAction.initializeAllVariables();

		projectDefineSteps = 1;

	//if the user explicitly says to revert project definition
	}else if(((message.toLowerCase().indexOf("revert project definition") >= 0) || (message.toLowerCase().indexOf("revert project creation") >= 0)) && (projectDefineSteps === 1)){

		//console.log("Rollback Project Declaration");

		botMessage = "No Problem, project definition reverted";

		botAction.initializeAllVariables();

	//if user doesn't reverts back previous rule then the project name is taken and a new table is created in db 
	}else if(projectDefineSteps === 1){

		//console.log("Actual, Project Creation started.");

		botMessage = "Ohok, working on it....";

		botAction.defineANewProject(message, teamName);
		
		botAction.initializeAllVariables();

	//this rule is used to commit an issue in the project, bot asks for projectname
	}else if(((message.toLowerCase().indexOf("commit an issue") >= 0) || (message.toLowerCase().indexOf("insert an issue") >= 0) || (message.toLowerCase().indexOf("add an issue") >= 0)) && (issueDefineSteps == 0)){

		//console.log("Commit an issue");

		botMessage = "... To which project?";

		botAction.initializeAllVariables();

		issueDefineSteps = 1;
		//console.log(issueDefineSteps);

	//if user explicitly says to revert issue creation
	}else if(((message.toLowerCase().indexOf("revert issue definition") >= 0) || (message.toLowerCase().indexOf("revert issue creation") >= 0)) && ((issueDefineSteps === 1) || (issueDefineSteps === 2))){

		//console.log("Rollback Issue Creation");

		dontAllowBotToSendMessage = 0;

		botMessage = "No Problem, issue definition reverted";
		
		botAction.initializeAllVariables();

	//if user doesn't revert back then, projectname is taken and is checked whether that project exists or not.
	}else if(issueDefineSteps == 1){

		//console.log("Checking whether that project exits or not.");

		botMessage = "Ohok, working on it....";

		botAction.initializeAllVariables();

		botAction.preCommitAnIssue(message, teamName, message);

	//if successful in previous rule then bot saves the issue in the projectname table
	}else if(issueDefineSteps == 2){

		//console.log("Final Stage: Commit the issue");

		dontAllowBotToSendMessage = 1;

		botAction.commitAnIssue(message, teamName, currrentUsername, projectNameForIssue);

		botAction.initializeAllVariables();

	//rule to delete the issue from the project
	}else if(issueDeletion == 1){

		issueDeletion = 0;

		botMessage = "Alright, working on it. Will let you know when its done.";

		botAction.deleteIssue(currrentUsername, message, issueId, teamName);

		botAction.initializeAllVariables();

	//call the versionControlBot (Delete Issues)
	}else if((message.toLowerCase().indexOf(" delete") >= 0) || (message.toLowerCase().indexOf(" remove") >= 0)){

		botVersionControl.checkDeleteIssueQueries(message, teamName, currrentUsername);

		botAction.initializeAllVariables();

	//if the user explicitly says to revert revealing of issues or commits
	}else if(message.toLowerCase().indexOf(" revert issue revealing") >= 0){

		dontAllowBotToSendMessage = 0;

		botMessage = "No Problem, not revealing the issue";

		botAction.initializeAllVariables();

	//if user didn't enter the projectName then take the projectName
	}else if(issueShowLatestSteps == 1){

		dontAllowBotToSendMessage = 1;

		botAction.showLatestIssue(teamName, message);

		botAction.initializeAllVariables();

	//call the versionControlBot (Display Latest Issues)
	}else if(message.toLowerCase().indexOf(" latest") >= 0){

		//console.log("let the news Bot handle this message");

		botVersionControl.checkDisplayLatestIssueQueries(message, teamName, currrentUsername);

		botAction.initializeAllVariables();

	//take the projectName and display the issue/commit
	}else if(issueShowSteps == 1){

		dontAllowBotToSendMessage = 1;

		botAction.showIssue(teamName, message, issueId);

		botAction.initializeAllVariables();

	//call the versionBot (Display Issues)
	}else if((message.toLowerCase().indexOf(" show the commit") >= 0) || (message.toLowerCase().indexOf(" show the issue") >= 0) || (message.toLowerCase().indexOf("display the commit") >= 0) || (message.toLowerCase().indexOf("display the issue") >= 0)){

		//console.log("let the version Control Bot handle this message");

		botVersionControl.checkDisplayIssueQueries(message, teamName, currrentUsername);

		botAction.initializeAllVariables();

	//if the problem is very severe (doctorBot)
	}else if(doctorBotSevere && (message.toLowerCase().indexOf("yes") >= 0)){

		//console.log("let the doctor Bot handle this message");

		botMessage = "Then you should really visit to a doctor.";

		botAction.initializeAllVariables();

	//if the problem is not very severe (doctorBot)
	}else if(doctorBotSevere && (message.toLowerCase().indexOf("no") >= 0)){

		//console.log("let the doctor Bot handle this message");

		botMessage = "Alright, then too take care of yourself, follow the medications and visit a doctor if in doubt.";

		botAction.initializeAllVariables();

	//take the current feelings of user and display corresponding problem/disease
	}else if((message.toLowerCase().indexOf(" im feeling") >= 0) || (message.toLowerCase().indexOf(" i'm feeling") >= 0) || (message.toLowerCase().indexOf(" i am feeling") >= 0) || (message.toLowerCase().indexOf(" im having") >= 0) || (message.toLowerCase().indexOf(" i am having") >= 0) || (message.toLowerCase().indexOf(" i'm having") >= 0) || (message.toLowerCase().indexOf(" i have") >= 0)){

		//console.log("Doctor Bot (Symptoms)");

		botDoctor.assignSymptomsID(teamName, message);

		botAction.initializeAllVariables();

		doctorBotSevere = 1;

	//take companyName from user (companyName should not be the original name instead its stock name eg. Apple --> AAPL)
	}else if(stockCompanyPause){

		//console.log("Stock Bot (Get Company Name)");

		botMessage = "About which company?";

		botStocks.getCompanyInfo(message, teamName);

		botAction.initializeAllVariables();

	//call the stockBot
	}else if((message.toLowerCase().indexOf(" stock") >= 0) || (message.toLowerCase().indexOf(" company") >= 0)){

		//console.log("Stock Bot (Company Name Not Mentioned)");

		botMessage = "About which company?";

		botAction.initializeAllVariables();

		botStocks.checkQueries(message, teamName, currrentUsername);

	//call the movieBot
	}else if((message.toLowerCase().indexOf(" tv shows") >= 0) || (message.toLowerCase().indexOf(" movies") >= 0)){

		//console.log("let the news Bot handle this message");

		botMovie.checkQueries(message, teamName, currrentUsername);

		botAction.initializeAllVariables();

	//call the newsBot
	}else if(message.toLowerCase().indexOf(" news") >= 0){

		//console.log("let the news Bot handle this message");

		newsBot.checkQueries(message, teamName, currrentUsername);

		botAction.initializeAllVariables();

	//use the calculator
	}else if((message.toLowerCase().indexOf(" add") >= 0) || (message.toLowerCase().indexOf(" subtract") >= 0) || (message.toLowerCase().indexOf(" multiply") >= 0) || (message.toLowerCase().indexOf(" divide") >= 0)){

		//console.log("Calculator");

		calculator.checkQueries(message, teamName, currrentUsername);

		botAction.initializeAllVariables();

	//call the history bot
	}else if(message.toLowerCase().indexOf(" day") >= 0){

		//console.log("let the history bot handle this message");

		dontAllowBotToSendMessage = 1;

		botHistory.checkQueries(message, teamName, currrentUsername);

		botAction.initializeAllVariables();

	//show the bot is alive
	}else if(message.trim() == "OK Bot"){

		//console.log("User just wants to see the bot");

		botMessage = "Hey there, " + currrentUsername + " How can I help you?";

		botAction.initializeAllVariables();

	//user types wrong command
	}else{

		botMessage = "Sorry, I don't understand.";

		botAction.initializeAllVariables();

	}

};

//this object literal to basic stuff that the bot will perform
var botAction = {

	//this function gets the current time
	getTime: function(){ 
		return new Date().toLocaleTimeString();
	},

	//this function gets the current date
	getDate: function(){ 
		return new Date().toLocaleDateString();
	},

	//this function picks up a random joke from the array given below
	//add more jokes if u have and it isn't here
	getJokes: function(teamName){

		var jokes = [
			"Did you hear about the guy whose whole left side was cut off? He\'s all right now.",
			"I'm reading a book about anti-gravity. It's impossible to put down.",
			"I wondered why the baseball was getting bigger. Then it hit me.",
			"It's not that the man did not know how to juggle, he just didn't have the balls to do it.",
			"I'm glad I know sign language, it's pretty handy.",
			"My friend's bakery burned down last night. Now his business is toast.",
			"Why did the cookie cry? It was feeling crumby.",
			"I used to be a banker, but I lost interest.",
			"A drum and a symbol fall off a cliff",
			"Why do seagulls fly over the sea? Because they aren't bay-gulls!",
			"Why did the fireman wear red, white, and blue suspenders? To hold his pants up.",
			"Why didn't the crab share his food? Because crabs are territorial animals, that don't share anything.",
			"Why was the javascript developer sad? Because he didn't Node how to Express himself.",
			"What do I look like? A JOKE MACHINE!?",
			"How did the hipster burn the roof of his mouth? He ate the pizza before it was cool.",
			"Why is it hard to make puns for kleptomaniacs? They are always taking things literally.",
			"Why do mermaid wear sea-shells? Because b-shells are too small.",
			"I'm a humorless, cold hearted, machine.",
			"Two fish in a tank. One looks to the other and says 'Can you even drive this thing???'",
			"Two fish swim down a river, and hit a wall. One says: 'Dam!'",
			"What's funnier than a monkey dancing with an elephant? Two monkeys dancing with an elephant.",
			"How did Darth Vader know what Luke was getting for Christmas? He felt his presents.",
			"What's red and bad for your teeth? A Brick.",
			"What's orange and sounds like a parrot? A Carrot.",
			"What do you call a cow with no legs? Ground beef",
			"Two guys walk into a bar. You'd think the second one would have noticed.",
			"What is a centipedes's favorite Beatle song?  I want to hold your hand, hand, hand, hand...",
			"What do you call a chicken crossing the road? Poultry in moton. ",
			"Did you hear about the Mexican train killer?  He had locomotives",
			"What do you call a fake noodle?  An impasta",
			"How many tickles does it take to tickle an octupus? Ten-tickles!", 
			"At the rate law schools are turning them out, by 2050 there will be more lawyers than humans."
		];

		var randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

		botAction.saveMessage(teamName, randomJoke, bot);

	},
	
	//this function creates a new table for the userEnteredProjectName project.
	defineANewProject: function(projectName, teamName){

		//to get current time and date in format which is accepted by the db.
		var currentDateTimeInISOFormat = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

		//console.log(teamName + " " + projectName);
		$.ajax({
            type: "POST",
            url: "actions.php?actions=createANewProject",
            data: "teamname=" + teamName + "&projectname=" + projectName + "&datetime=" + currentDateTimeInISOFormat,
            success: function(result){
            	if(result == "1"){
            		returnMessage = "Success: New Project " + projectName + " is now online!"; 
               		//console.log(returnMessage);
               		botAction.saveMessage(teamName, returnMessage, bot);                 
                }else if(result == "2"){
                	returnMessage = "This Project already exists.";
                	//console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
                }else{
                	returnMessage = "Failure: Not able to define the Project " + projectName; 
                	console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
              	}
            }
        });
	},

	//this function is used to check whehther a table exists for a userEnteredProjectName project.
	preCommitAnIssue: function(projectName, teamName, message){
		$.ajax({
            type: "POST",
            url: "actions.php?actions=checkForThisTable",
            data: "teamname=" + teamName + "&projectname=" + projectName,
            success: function(result){
            	if(result == "1"){
            		returnMessage = "Okay, Now type down the text for new Issue.";
               		//console.log(returnMessage);
               		botAction.saveMessage(teamName, returnMessage, bot);
               		issueDefineSteps = 2;
					projectNameForIssue = message;                 
                }else if(result == "2"){
                	returnMessage = "This Project doesn't exist. Want to create a new project with this name: '" + projectName + "' ? Then just type 'OK Bot create a new project'";
                	//console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
                	botAction.initializeIssueStepsVariable();
                }else{
                	returnMessage = "Failure: There's some problem with our servers please try again later."; 
                	console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
              	}
            }
        });
	},

	//this function is used to commit issue to the userEnteredProjectName project.
	commitAnIssue: function(issueData, teamName, currrentUsername, projectName){

		var currentDateTimeInISOFormat = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

		$.ajax({
            type: "POST",
            url: "actions.php?actions=commitAnIssue",
            data: "teamname=" + teamName + "&projectname=" + projectName + "&issueData=" + issueData + "&username=" + currrentUsername + "&datetime=" + currentDateTimeInISOFormat,
            success: function(result){
            	if(result == "1"){
            		returnMessage = "Success: Issue commited to " + projectName;
               		//console.log(returnMessage);
               		botAction.saveMessage(teamName, returnMessage, bot);
               		dontAllowBotToSendMessage = 0;                 
                }else if(result == "2"){
                	returnMessage = "This Project doesn't exist. Want to create a new project with this name: '" + projectName + "' ? Then just type 'OK Bot create a new project'";
                	//console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
                	dontAllowBotToSendMessage = 0;
                }else{
                	console.log(result);
                	returnMessage = "Failure: Not able to commit the issue to " + projectName; 
                	console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
                	dontAllowBotToSendMessage = 0;
              	}
            }
        });
	},

	//this function is used to show the topmost tuple from userEnteredProjectName project table.
	showLatestIssue: function(teamName, projectName){
		//console.log(projectName);
		$.ajax({
            type: "POST",
            url: "actions.php?actions=checkForThisTable",
            data: "teamname=" + teamName + "&projectname=" + projectName,
            success: function(result){
            	if(result == "1"){
               		//console.log("Moving Ahead");
               		$.ajax({
			            type: "POST",
			            url: "actions.php?actions=showLatestIssue",
			            data: "teamname=" + teamName + "&projectname=" + projectName,
			            dataType: "json",
			            success: function(result){
			 				//console.log(result);
			 				$.each(result,function(index,item){
				            	returnMessage = "Issue #"+ item.id + "<br>Description: " + item.issuedescription + "<br>Issued by: " + item.createdby + "<br>Date and Time: " + item.datetime + "<br>";
				            });
				            //console.log(returnMessage);
				            botAction.saveMessage(teamName, returnMessage, bot);
			            }
			        });               
                }else if(result == "2"){
                	returnMessage = "This Project doesn't exist. Want to create a new project with this name: '" + projectName + "' ? Then just type 'OK Bot create a new project'";
                	//console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
                }else{
                	returnMessage = "Failure: There's some problem with our servers please try again later."; 
                	console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
              	}
            }
        });
	},

	//this function is used to show issue of a userEnteredProjectName project but here id of the tuple should be given
	showIssue: function(teamName, projectName, issueId){
		//console.log(projectName);
		$.ajax({
            type: "POST",
            url: "actions.php?actions=checkForThisTable",
            data: "teamname=" + teamName + "&projectname=" + projectName,
            success: function(result){
            	if(result == "1"){
               		//console.log("Moving Ahead");
               		$.ajax({
			            type: "POST",
			            url: "actions.php?actions=showIssue",
			            data: "teamname=" + teamName + "&projectname=" + projectName + "&issueId=" + issueId,
			            dataType: "json",
			            success: function(result){
			 				//console.log(result);
			 				$.each(result,function(index,item){
				            	returnMessage = "Issue #"+ item.id + "<br>Description: " + item.issuedescription + "<br>Issued by: " + item.createdby + "<br>Date and Time: " + item.datetime + "<br>";
				            });
				            //console.log(returnMessage);
				            botAction.saveMessage(teamName, returnMessage, bot);
			            }
			        });               
                }else if(result == "2"){
                	returnMessage = "This Project doesn't exist. Want to create a new project with this name: '" + projectName + "' ? Then just type 'OK Bot create a new project'";
                	//console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
                }else{
                	returnMessage = "Failure: There's some problem with our servers please try again later."; 
                	console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
              	}
            }
        });
	},

	//this function is used to delete issues from a userEnteredProjectName project
	deleteIssue: function(username, projectName, issueId, teamName){
		//console.log(projectName + " " + issueId);
		$.ajax({
            type: "POST",
            url: "actions.php?actions=checkForThisTable",
            data: "teamname=" + teamName + "&projectname=" + projectName,
            success: function(result){
            	if(result == "1"){
               		//console.log("Moving Ahead");
               		$.ajax({
			            type: "POST",
			            url: "actions.php?actions=deleteIssue",
			            data: "teamname=" + teamName + "&projectname=" + projectName + "&issueId=" + issueId + "&username=" + username,
			            success: function(result){
			 				//console.log(result);
			 				if(result == 1){
			 					returnMessage = "Success: Deleted Issue #" + issueId + " by " + username;
               					//console.log(returnMessage);
               					botAction.saveMessage(teamName, returnMessage, bot);
			 				}else if(result == 2){
			 					returnMessage = "The issue with IssueId #" + issueId + " does not exist.";
			 					//console.log(returnMessage);
               					botAction.saveMessage(teamName, returnMessage, bot);
			 				}else if(result == 3){
			 					returnMessage = "Sorry you're not authorized to delete this issue";
			 					//console.log(returnMessage);
               					botAction.saveMessage(teamName, returnMessage, bot);
			 				}else if(result == 4){
			 					returnMessage = "Sorry, couldn't delete the issue. Servers might be down for maintenance. Please try again later.";
			 					//console.log(returnMessage);
               					botAction.saveMessage(teamName, returnMessage, bot);
			 				}else{
			 					console.log(result);
			 				}
			            }
			        });               
                }else if(result == "2"){
                	returnMessage = "This Project doesn't exist. Want to create a new project with this name: '" + projectName + "' ? Then just type 'OK Bot create a new project'";
                	//console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
                }else{
                	returnMessage = "Failure: There's some problem with our servers please try again later."; 
                	console.log(returnMessage);
                	botAction.saveMessage(teamName, returnMessage, bot);
              	}
            }
        });
	},

	//below given functions do what their name suggests

	initializeIssueShowStepsVariable: function(){
		issueShowSteps = 0;
	},

	initializeIssueStepsVariable: function(){
		issueDefineSteps = 0;
	},

	initializeProjectStepsVariable: function(){
		projectDefineSteps = 0;
	},

	initializeIssueShowLatestStepsVariable: function(){
		issueShowLatestSteps = 0;
	},

	initializeStockCompanyPauseVariable: function(){
		stockCompanyPause = 0;
	},

	initializeAllVariables: function(){
		issueShowSteps = 0;
		doctorBotSevere = 0;
		issueDefineSteps = 0;
		stockCompanyPause = 0;
		projectDefineSteps = 0;
		issueShowLatestSteps = 0;
	},

	//this function is used to save the message to the db
	//it mostly used to save messages for the bot
	saveMessage: function(teamName, returnMessage, username){

		if(returnMessage == ""){
			returnMessage = "Not able to perform this request.";
		}

		var currentDateTimeInISOFormat = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

		$.ajax({
		    type: "POST",
		    url: "actions.php?actions=saveMessage",
		    data:"teamname=" + teamName + "&sender=" + username + "&message=" + returnMessage + "&datetime=" + currentDateTimeInISOFormat,
		    success: function(result){
			    if(result == "1"){
			    	//console.log("Success");
			    }else{
			        console.log("Failure: " + result);
			    }
		    }
		});

		returnMessage = "";

	}

};

//this is doctor bot
//Work In Progress - will update when bot is ready
var botDoctor = {

	assignSymptomsID: function(teamName, symptom){

		//var which will be used in our api for our doctorBot
		var doctorId = 0;

		if(symptom.toLowerCase().indexOf("abdominal pain") >= 0){
			console.log(symptom.toLowerCase().indexOf("abdominal pain"));
			doctorId = 10;
		}else if(symptom.toLowerCase().indexOf("anxiety") >= 0){
			doctorId = 20;
		}else if(symptom.toLowerCase().indexOf("back pain") >= 0){
			doctorId = 30;
		}else if(symptom.toLowerCase().indexOf("burning eyes") >= 0){
			doctorId = 40;
		}else if(symptom.toLowerCase().indexOf("burning in the throat") >= 0){
			doctorId = 50;
		}else if(symptom.toLowerCase().indexOf("cheek swelling") >= 0){
			doctorId = 60;
		}else if(symptom.toLowerCase().indexOf("chest pain") >= 0){
			doctorId = 70;
		}else if(symptom.toLowerCase().indexOf("chest tightness") >= 0){
			doctorId = 80;
		}else if(symptom.toLowerCase().indexOf("chills") >= 0){
			doctorId = 90;
		}else if(symptom.toLowerCase().indexOf("cold sweats") >= 0){
			doctorId = 100;
		}else if(symptom.toLowerCase().indexOf("cough") >= 0){
			doctorId = 110;
		}else if(symptom.toLowerCase().indexOf("dizziness") >= 0){
			doctorId = 120;
		}else if(symptom.toLowerCase().indexOf("drooping eyelid") >= 0){
			doctorId = 130;
		}else if(symptom.toLowerCase().indexOf("dry eyes") >= 0){
			doctorId = 140;
		}else if(symptom.toLowerCase().indexOf("earache") >= 0){
			doctorId = 150;
		}else if(symptom.toLowerCase().indexOf("early satiety") >= 0){
			doctorId = 160;
		}else if(symptom.toLowerCase().indexOf("eye pain") >= 0){
			doctorId = 170;
		}else if(symptom.toLowerCase().indexOf("eye redness") >= 0){
			doctorId = 180;
		}else if(symptom.toLowerCase().indexOf("fast, deepened breathing") >= 0){
			doctorId = 190;
		}else if(symptom.toLowerCase().indexOf("feeling of foreign body in the eye") >= 0){
			doctorId = 200;
		}else if(symptom.toLowerCase().indexOf("fever") >= 0){
			doctorId = 210;
		}else if(symptom.toLowerCase().indexOf("going black before the eyes") >= 0){
			doctorId = 220;
		}else if(symptom.toLowerCase().indexOf("headache") >= 0){
			doctorId = 230;
		}else if(symptom.toLowerCase().indexOf("heartburn") >= 0){
			doctorId = 240;
		}else if(symptom.toLowerCase().indexOf("hiccups") >= 0){
			doctorId = 250;
		}else if(symptom.toLowerCase().indexOf("hot flushes") >= 0){
			doctorId = 260;
		}else if(symptom.toLowerCase().indexOf("increased thirst") >= 0){
			doctorId = 270;
		}else if(symptom.toLowerCase().indexOf("itching eyes") >= 0){
			doctorId = 280;
		}else if(symptom.toLowerCase().indexOf("itching in the nose") >= 0){
			doctorId = 290;
		}else if(symptom.toLowerCase().indexOf("lip swelling") >= 0){
			doctorId = 300;
		}else if(symptom.toLowerCase().indexOf("memory gap") >= 0){
			doctorId = 310;
		}else if(symptom.toLowerCase().indexOf("menstruation disorder") >= 0){
			doctorId = 320;
		}else if(symptom.toLowerCase().indexOf("missed period") >= 0){
			doctorId = 330;
		}else if(symptom.toLowerCase().indexOf("nausea") >= 0){
			doctorId = 340;
		}else if(symptom.toLowerCase().indexOf("neck pain") >= 0){
			doctorId = 350;
		}else if(symptom.toLowerCase().indexOf("nervousness") >= 0){
			doctorId = 360;
		}else if(symptom.toLowerCase().indexOf("night cough") >= 0){
			doctorId = 370;
		}else if(symptom.toLowerCase().indexOf("pain in the limbs") >= 0){
			doctorId = 380;
		}else if(symptom.toLowerCase().indexOf("pain on swallowing") >= 0){
			doctorId = 390;
		}else if(symptom.toLowerCase().indexOf("palpitations") >= 0){
			doctorId = 400;
		}else if(symptom.toLowerCase().indexOf("paralysis") >= 0){
			doctorId = 410;
		}else if(symptom.toLowerCase().indexOf("reduced appetite") >= 0){
			doctorId = 420;
		}else if(symptom.toLowerCase().indexOf("runny nose") >= 0){
			doctorId = 430;
		}else if(symptom.toLowerCase().indexOf("shortness of breath") >= 0){
			doctorId = 440;
		}else if(symptom.toLowerCase().indexOf("skin rash") >= 0){
			doctorId = 450;
		}else if(symptom.toLowerCase().indexOf("sleeplessness") >= 0){
			doctorId = 460;
		}else if(symptom.toLowerCase().indexOf("sneezing") >= 0){
			doctorId = 470;
		}else if(symptom.toLowerCase().indexOf("sore throeat") >= 0){
			doctorId = 480;
		}else if(symptom.toLowerCase().indexOf("sputum") >= 0){
			doctorId = 490;
		}else if(symptom.toLowerCase().indexOf("stomach burning") >= 0){
			doctorId = 500;
		}else if(symptom.toLowerCase().indexOf("stuffy nose") >= 0){
			doctorId = 510;
		}else if(symptom.toLowerCase().indexOf("sweating") >= 0){
			doctorId = 520;
		}else if(symptom.toLowerCase().indexOf("swollen glands in the armpits") >= 0){
			doctorId = 530;
		}else if(symptom.toLowerCase().indexOf("swollen glands on the neck") >= 0){
			doctorId = 540;
		}else if(symptom.toLowerCase().indexOf("tears") >= 0){
			doctorId = 550;
		}else if(symptom.toLowerCase().indexOf("tiredness") >= 0){
			doctorId = 560;
		}else if(symptom.toLowerCase().indexOf("tremor at rest") >= 0){
			doctorId = 570;
		}else if(symptom.toLowerCase().indexOf("unconsciousness, short") >= 0){
			doctorId = 580;
		}else if(symptom.toLowerCase().indexOf("vomiting") >= 0){
			doctorId = 590;
		}else if(symptom.toLowerCase().indexOf("vomiting blood") >= 0){
			doctorId = 600;
		}else if(symptom.toLowerCase().indexOf("weakness") >= 0){
			doctorId = 610;
		}else if(symptom.toLowerCase().indexOf("weight gain") >= 0){
			doctorId = 620;
		}else if(symptom.toLowerCase().indexOf("wheezing") >= 0){
			doctorId = 630;
		}else{
			doctorId = 999;
		}

		//console.log(doctorId);

		medications.array.forEach(function(element) {
			if(element.id == doctorId){
		    	//console.log(element);
		    	returnMessage = "You should " + element.remedy;
		    	if(element.additional_info != ""){
		    		returnMessage += " Also, some additional info: " + element.additional_info;
		    	}
		    	returnMessage += " <br>Is the problem very severe?"
		    	//console.log(returnMessage);
		    }
		});

		if(doctorId == 999){
			returnMessage = "Sorry, but can you please elaborate your problem a bit more? or read the documentation to know more about how to interact with the doctorBot."
		}

		doctorBotSevere = 1;
		botMessage = returnMessage;
		
	}

};

//this is the obj literal for the MovieBot.
//all movie and tv shows related queries are executed here.
var botMovie = {

	//this function checks the rule for movies and tv shows related queries
	checkQueries: function(message, teamName, currrentUsername){

		//rule to display popular movies (year given)
		if(message.toLowerCase().indexOf("display popular movies from the year ") >= 0){

			//console.log("Movie Bot (Year)");

			var year = message.substr(52);
			year.trim();
			//console.log(year);
			
			botMessage = "Ohok, fetching movie details......";

			botMovie.fetchDetailsFromTMDb(teamName, 1, year);

			botAction.initializeAllVariables();

		//rule to display popular movies (year given)
		}else if(message.toLowerCase().indexOf("display the popular movies from the year ") >= 0){

			//console.log("Movie Bot (Year)");

			var year = message.substr(56);
			year.trim();
			//console.log(year);
			
			botMessage = "Ohok, fetching movie details......";

			botMovie.fetchDetailsFromTMDb(teamName, 1, year);

			botAction.initializeAllVariables();

		//rule to display popular movies (year not given, current year assumed automatically)
		}else if((message.toLowerCase().indexOf("display current popular movies") >= 0) || (message.toLowerCase().indexOf("display the current popular movies") >= 0) || (message.toLowerCase().indexOf("show me the current popular movies") >= 0) || (message.toLowerCase().indexOf("show me current popular movies") >= 0)){

			//console.log("Movie Bot");
			
			botMessage = "Ohok, fetching movie details......";

			botMovie.fetchDetailsFromTMDb(teamName, 0, 0000);

			botAction.initializeAllVariables();

		//rule to display upcoming movies
		}else if((message.toLowerCase().indexOf("display upcoming movies") >= 0) || (message.toLowerCase().indexOf("display the upcoming movies") >= 0) || (message.toLowerCase().indexOf("show me the upcoming movies") >= 0) || (message.toLowerCase().indexOf("show me upcoming movies") >= 0)){

			//console.log("Movie Bot");
			
			botMessage = "Ohok, fetching movie details......";

			botMovie.fetchDetailsFromTMDb(teamName, 4, 0000);

			botAction.initializeAllVariables();

		//rule to display popular tv shows (current year assumed)
		}else if((message.toLowerCase().indexOf("display current popular tv shows") >= 0) || (message.toLowerCase().indexOf("display the current popular tv shows") >= 0) || (message.toLowerCase().indexOf("show me the current popular tv shows") >= 0) || (message.toLowerCase().indexOf("show me current popular tv shows") >= 0)){

			//console.log("Movie Bot");
			
			botMessage = "Ohok, fetching TV Shows details......";

			botMovie.fetchDetailsFromTMDb(teamName, 2, 0000);

			botAction.initializeAllVariables();

		//rule to display top rated tv shows (current year assumed)
		}else if((message.toLowerCase().indexOf("display current top rated tv shows") >= 0) || (message.toLowerCase().indexOf("display the current top rated tv shows") >= 0) || (message.toLowerCase().indexOf("show me the current top rated tv shows") >= 0) || (message.toLowerCase().indexOf("show me current top rated tv shows") >= 0)){

			//console.log("Movie Bot");
			
			botMessage = "Ohok, fetching TV Shows details......";

			botMovie.fetchDetailsFromTMDb(teamName, 3, 0000);

			botAction.initializeAllVariables();

		
		}

	},

	//this function is used to contact TMDb and fetch details from their API.
	fetchDetailsFromTMDb: function(teamName, choice, year){

		//used TMDb api to info about popular movies and tv shows.
		//awesome API, should try it out.
		var movieBaseURL = "https://api.themoviedb.org/3/";
		var apiKeyTMDb = "867611d6b3f8882764c7aec28bc288ed"; //Type your api key (TMDb) here

		//if the user wants to view popular movies (current year is assumed as year is not given by the user)
		if(choice == 0){
			var urlToCall = movieBaseURL + "discover/movie?api_key=" + apiKeyTMDb + "&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=false&page=1";

		//if the user wants to view popular movies (year is given by the user)
		}else if(choice == 1){
			var urlToCall = movieBaseURL + "discover/movie?api_key=" + apiKeyTMDb + "&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=false&page=1&year=" + year;

		//if the user wants to view popular tv shows
		}else if(choice == 2){
			var urlToCall = movieBaseURL + "tv/popular?api_key=" + apiKeyTMDb + "&language=en-US&page=1";

		//if the user wants to view top rated tv shows
		}else if(choice == 3){
			var urlToCall = movieBaseURL + "tv/top_rated?api_key=" + apiKeyTMDb + "&language=en-US&page=1";
		
		//if the user wants to view upcoming movies
		}else if(choice == 4){
			var urlToCall = movieBaseURL + "movie/upcoming?api_key=" + apiKeyTMDb + "&language=en-US&page=1";
		}

		$.ajax({
			type: "GET",
			url: urlToCall,
			dataType: "json",
			success: function(result){
				//console.log(result.results);
				var item;
				returnMessage = "Here you go";
				if((choice == 0) || (choice == 1) || (choice == 4)){
					for(var i = 0; i < 5; i++){
						item = result.results[i];
					   	returnMessage += "<br>Name: '"+ item.title + "'<br>Overview: " + item.overview + "<br>Released Date: " + item.release_date + "<br>";
					}
				}else{ //else if((choice == 2) || (choice == 3)){
					for(var i = 0; i < 5; i++){
						item = result.results[i];
					   	returnMessage += "<br>Name: '"+ item.name + "'<br>Overview: " + item.overview + "<br>Released Date: " + item.first_air_date + "<br>";
					}
				}
				//console.log(returnMessage);
				botAction.saveMessage(teamName, returnMessage, bot);
			}
		});

	}

};

//this is the obj literal for the stocksBot.
//all company info and stocks related queries are executed here
var botStocks = {

	//this function checks the rule and find info about the company.
	checkQueries: function(message, teamName, currrentUsername){

		//rule to display information about a company (companyName not given)
		if((message.toLowerCase().indexOf("show me stock related info about a company") >= 0) && (stockCompanyPause == 0) ){

			//console.log("Stock Bot (Company Name Not Mentioned)");

			botMessage = "About which company?";

			botAction.initializeAllVariables();

			stockCompanyPause = 1;

		//rule to display information about a company (companyName should not be the original name instead its stock name eg. Apple --> AAPL)
		}else if(message.toLowerCase().indexOf("show me stock related info about ") >= 0){

			//console.log("Stock Bot (Company Name Mentioned)");

			botMessage = "Ohok, Working on it......";

			stockCompanyName = message.substr(40);
			stockCompanyName.trim();
			//console.log(stockCompanyName);

			botStocks.getCompanyInfo(stockCompanyName, teamName);

			botAction.initializeAllVariables();

		}

	},

	//this function checks whether the commpany exists or not and if it exists then it gathers data about it.
	getCompanyInfo: function(stockCompanyName, teamName){

		var USERNAME = "8a304ec3a55a2ca523be45ad37f94797";
		var PASSWORD = "32fab8030b2d0be7946aacb40984a1e2";

		var urlToCall = "https://api.intrinio.com/companies?ticker=" + stockCompanyName;
		var returnMessage = "Oops! Not able to find this company"; 

		$.ajax({
			type: "GET",
			url: urlToCall,
			dataType: 'json',
			headers: {
				"Authorization": "Basic " + btoa(USERNAME + ":" + PASSWORD)
			},
			success: function (response){
				//console.log(response);
				returnMessage = "<br>Showing Info about: " + stockCompanyName + "<br>Legal Name: " + response.legal_name + "\nSector: " + response.sector + "<br>Industry Group: " + response.industry_group + "<br>Address: " + response.business_address + "<br>Phone Number: " + response.business_phone_no + "<br>Company URL: " + response.company_url;
				//console.log(returnMessage);
				botStocks.getStockPrice(stockCompanyName, returnMessage, teamName);
			},
			error: function(response){
				botAction.saveMessage(teamName, returnMessage, bot);
			}
		});
	},

	//this function gets stock info about the company, forms the message and has the ability to save the message. 
	getStockPrice: function(stockCompanyName, returnMessage, teamName){

		var USERNAME = "8a304ec3a55a2ca523be45ad37f94797";
		var PASSWORD = "32fab8030b2d0be7946aacb40984a1e2";

		var urlToCall = "https://api.intrinio.com/data_point?identifier=" + stockCompanyName + "&item=close_price";

		$.ajax({
		  	type: "GET",
			url: urlToCall,
			dataType: 'json',
			headers: {
			    "Authorization": "Basic " + btoa(USERNAME + ":" + PASSWORD)
			},
			success: function(response) {
				//console.log(response);
				returnMessage += "<br>Stock Price: " + response.value;
				//console.log(returnMessage);
				botAction.saveMessage(teamName, returnMessage, bot);
			}
		});

	}

};

//this is the object literal for the news bot.
//all news related queries are executed here.
var newsBot = {

	//this function checks the rule and decides the newsType
	checkQueries: function(message, teamName, currrentUsername){

		//rule to catch news related queries, type of news is not entered by the user
		if((message.toLowerCase().indexOf("show me some news") >= 0) || (message.toLowerCase().indexOf("show me global news") >= 0) || (message.toLowerCase().indexOf("show me news") >= 0) || (message.toLowerCase().indexOf("show me some global news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("global", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is entertainment
		}else if((message.toLowerCase().indexOf("show me some entertainment news") >= 0) || (message.toLowerCase().indexOf("show me entertainment news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("entertainment", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is gaming
		}else if((message.toLowerCase().indexOf("show me some gaming news") >= 0) || (message.toLowerCase().indexOf("show me gaming news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("gaming", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is business
		}else if((message.toLowerCase().indexOf("show me some business news") >= 0) || (message.toLowerCase().indexOf("show me business news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("business", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is technology
		}else if((message.toLowerCase().indexOf("show me some technology news") >= 0) || (message.toLowerCase().indexOf("show me technology news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("technology", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is sports
		}else if((message.toLowerCase().indexOf("show me some sports news") >= 0) || (message.toLowerCase().indexOf("show me sports news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("sports", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is cricket
		}else if((message.toLowerCase().indexOf("show me some cricket news") >= 0) || (message.toLowerCase().indexOf("show me cricket news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("cricket", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is music
		}else if((message.toLowerCase().indexOf("show me some music news") >= 0) || (message.toLowerCase().indexOf("show me music news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("music", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is indian
		}else if((message.toLowerCase().indexOf("show me some indian news") >= 0) || (message.toLowerCase().indexOf("show me indian news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("indian", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is science
		}else if((message.toLowerCase().indexOf("show me some science news") >= 0) || (message.toLowerCase().indexOf("show me science news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("science", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is reddit
		}else if((message.toLowerCase().indexOf("show me some reddit news") >= 0) || (message.toLowerCase().indexOf("show me reddit news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("reddit", teamName);

			botAction.initializeAllVariables();

		//rule to catch news related queries, type of news is football
		}else if((message.toLowerCase().indexOf("show me some football news") >= 0) || (message.toLowerCase().indexOf("show me football news") >= 0)){

			//console.log("News Bot (Type not entered)");

			botMessage = "Ohok, Working on it......";

			newsBot.getNews("football", teamName);

			botAction.initializeAllVariables();

		}

	},

	//this function gets the news that the users want.
	getNews: function(newsType, teamName){

		//used NewsAPI to get news.
		//awesome API, should try it out.
		var newsAPIKey = "bdbcae478d174e04ba1504b2914cc143";

		var urlToCall = "https://newsapi.org/v1/articles?source="

		//if the newsType is global. Source -> BBC News
		if(newsType == "global"){
			urlToCall += "bbc-news&sortBy=top&apiKey=";

		//if the newsType is business. Source -> Business Insider
		}else if(newsType == "business"){
			urlToCall += "business-insider&sortBy=top&apiKey=";

		//if the newsType is technology. Source -> Engadget
		}else if(newsType == "technology"){
			urlToCall += "engadget&sortBy=top&apiKey=";

		//if the newsType is gaming. Source -> IGN
		}else if(newsType == "gaming"){
			urlToCall += "ign&sortBy=top&apiKey=";

		//if the newsType is sports. Source -> ESPN
		}else if(newsType == "sports"){
			urlToCall += "espn&sortBy=top&apiKey=";

		//if the newsType is cricket. Source -> ESPN Cricket
		}else if(newsType == "cricket"){
			urlToCall += "espn-cric-info&sortBy=top&apiKey=";

		//if the newsType is science. Source -> National Geographic
		}else if(newsType == "science"){
			urlToCall += "national-geographic&sortBy=top&apiKey=";

		//if the newsType is indian. Source -> Times Of India
		}else if(newsType == "indian"){
			urlToCall += "the-times-of-india&sortBy=top&apiKey=";

		//if the newsType is music. Source -> MTV News
		}else if(newsType == "music"){
			urlToCall += "mtv-news&sortBy=top&apiKey=";

		//if the newsType is reddit. Source -> Reddit
		}else if(newsType == "reddit"){
			urlToCall += "reddit-r-all&sortBy=top&apiKey=";

		//if the newsType is football. Source -> Football Italia
		}else if(newsType == "football"){
			urlToCall += "football-italia&sortBy=top&apiKey=";

		}

		urlToCall += newsAPIKey;

		$.ajax({
			type: "GET",
			url: urlToCall,
			dataType: "json",
			success: function(result){
				//console.log(result.articles);
				var item;
				returnMessage = "Here you go";
				for(var i = 0; i < 5; i++){
					item = result.articles[i];
					//console.log(item);
					if(item.title == null){
						item.title = "NA";
					}
					if(item.description == null){
						item.description = "NA";
					}
					if(item.author == null){
						item.author = "NA";
					}
					if(item.url == null){
						item.url = "NA";
					}
					if(item.publishedAt == null){
						item.publishedAt = "NA";
					}
					returnMessage += "<br>Title: '"+ item.title + "'<br>Description: " + item.description + "<br>Author: " + item.author + "<br>More info: " + item.url + "<br>Published on: " + item.publishedAt.substr(0,10) + "<br>";
				}
				//console.log(returnMessage);
				botAction.saveMessage(teamName, returnMessage, bot);
			}
		});

	}

};

//since versionControl is a big bot, therefore not all functions of the bot are in this obj literal
//some of the functions are in 'botAction'
//here only queries are checked
//queries are segregated for optimization purposes
var botVersionControl = {

	checkDeleteIssueQueries: function(message, teamName, currrentUsername){

		//rule to delete issue/commits from a project
		if(message.toLowerCase().indexOf("delete an issue whose id = ") >= 0){

			issueId = message.substr(34);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete issues/commits from a project
		}else if(message.toLowerCase().indexOf("delete an issue whose id is ") >= 0){

			issueId = message.substr(35);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete issues/commits from a project
		}else if(message.toLowerCase().indexOf("delete an issue whose id equals ") >= 0){

			issueId = message.substr(39);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete commits/issues from a project
		}else if(message.toLowerCase().indexOf("delete a commit whose id = ") >= 0){

			issueId = message.substr(34);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete commits/issues from a project
		}else if(message.toLowerCase().indexOf("delete a commit whose id is ") >= 0){

			issueId = message.substr(35);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete commits/issues from a project
		}else if(message.toLowerCase().indexOf("delete a commit whose id equals ") >= 0){

			issueId = message.substr(39);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete issue/commits from a project
		}else if(message.toLowerCase().indexOf("remove an issue whose id = ") >= 0){

			issueId = message.substr(34);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete issues/commits from a project
		}else if(message.toLowerCase().indexOf("remove an issue whose id is ") >= 0){

			issueId = message.substr(35);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete issues/commits from a project
		}else if(message.toLowerCase().indexOf("remove an issue whose id equals ") >= 0){

			issueId = message.substr(39);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete commits/issues from a project
		}else if(message.toLowerCase().indexOf("remove a commit whose id = ") >= 0){

			issueId = message.substr(34);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete commits/issues from a project
		}else if(message.toLowerCase().indexOf("remove a commit whose id is ") >= 0){

			issueId = message.substr(35);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		//rule to delete commits/issues from a project
		}else if(message.toLowerCase().indexOf("remove a commit whose id equals ") >= 0){

			issueId = message.substr(39);
			issueId.trim();
			//console.log(issueId);

			issueDeletion = 1;

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

		}

	},

	checkDisplayIssueQueries: function(message, teamName, currrentUsername){
		
		//rule to display issue/commit (projectName not Entered but ID is given)
		if((message.toLowerCase().indexOf("display the issue whose id = ") >= 0) && (issueShowSteps == 0)){

			//console.log("Display the issue (ID Entered)");

			botMessage = "... of which project?";

			issueId = message.substr(36);
			issueId.trim();
			//console.log(issueId);

			botAction.initializeAllVariables();

			issueShowSteps = 1;

		//rule to display issue/commit (projectName not Entered but ID is given)
		}else if((message.toLowerCase().indexOf("display the commit whose id = ") >= 0) && (issueShowSteps == 0)){

			//console.log("Display the issue (ID Entered)");

			botMessage = "... of which project?";

			issueId = message.substr(37);
			issueId.trim();
			//console.log(issueId);

			botAction.initializeAllVariables();

			issueShowSteps = 1;

		//rule to display issue/commit (projectName not Entered but ID is given)
		}else if((message.toLowerCase().indexOf("display the commit whose id equals ") >= 0) && (issueShowSteps == 0)){

			//console.log("Display the issue (ID Entered)");

			botMessage = "... of which project?";

			issueId = message.substr(42);
			issueId.trim();
			//console.log(issueId);

			botAction.initializeAllVariables();

			issueShowSteps = 1;

		//rule to display issue/commit (projectName not Entered but ID is given)
		}else if((message.toLowerCase().indexOf("display the issue whose id equals ") >= 0) && (issueShowSteps == 0)){

			//console.log("Display the issue (ID Entered)");

			botMessage = "... of which project?";

			issueId = message.substr(41);
			issueId.trim();
			//console.log(issueId);

			botAction.initializeAllVariables();

			issueShowSteps = 1;

		//rule to display issue/commit (projectName not Entered but ID is given)
		}else if((message.toLowerCase().indexOf("show the issue whose id = ") >= 0) && (issueShowSteps == 0)){

			//console.log("Display the issue (ID Entered)");

			botMessage = "... of which project?";

			issueId = message.substr(33);
			issueId.trim();
			//console.log(issueId);

			botAction.initializeAllVariables();

			issueShowSteps = 1;

		//rule to display issue/commit (projectName not Entered but ID is given)
		}else if((message.toLowerCase().indexOf("show the commit whose id = ") >= 0) && (issueShowSteps == 0)){

			//console.log("Display the issue (ID Entered)");

			botMessage = "... of which project?";

			issueId = message.substr(34);
			issueId.trim();
			//console.log(issueId);

			botAction.initializeAllVariables();

			issueShowSteps = 1;

		//rule to display issue/commit (projectName not Entered but ID is given)
		}else if((message.toLowerCase().indexOf("show the commit whose id equals ") >= 0) && (issueShowSteps == 0)){

			//console.log("Display the issue (ID Entered)");

			botMessage = "... of which project?";

			issueId = message.substr(39);
			issueId.trim();
			//console.log(issueId);

			botAction.initializeAllVariables();

			issueShowSteps = 1;

		//rule to display issue/commit (projectName not Entered but ID is given)
		}else if((message.toLowerCase().indexOf("show the issue whose id equals ") >= 0) && (issueShowSteps == 0)){

			//console.log("Display the issue (ID Entered)");

			botMessage = "... of which project?";

			issueId = message.substr(38);
			issueId.trim();
			//console.log(issueId);

			botAction.initializeAllVariables();

			issueShowSteps = 1;

		}

	},

	checkDisplayLatestIssueQueries: function(message, teamName, currrentUsername){

		//rule to display latest issue/commit (projectName Entered)
		if(message.toLowerCase().indexOf("display the latest issue of") >= 0){

			//console.log("Display the latest issue (ProjectName Entered)");
			projectNameForIssue = message.substr(35);

			botMessage = "Ohok, working on it....";

			botAction.showLatestIssue(teamName, projectNameForIssue);

			botAction.initializeAllVariables();

		//rule to display latest issue/commit (projectName Entered)
		}else if(message.toLowerCase().indexOf("display the latest commit of") >= 0){

			//console.log("Display the latest issue (ProjectName Entered)");
			projectNameForIssue = message.substr(36);
			//console.log(projectNameForIssue);

			botMessage = "Ohok, working on it....";

			botAction.showLatestIssue(teamName, projectNameForIssue);

			botAction.initializeAllVariables();

		//rule to display latest issue (projectName not Entered)
		}else if(((message.toLowerCase().indexOf("display the latest issue") >= 0) || (message.toLowerCase().indexOf("display the latest commit") >= 0) ) && (issueShowLatestSteps == 0)){

			//console.log("Display the latest issue (ProjectName Not Entered)");

			botMessage = "... of which project?";

			botAction.initializeAllVariables();

			issueShowLatestSteps = 1;

		}

	}

};

var calculator = {

	checkQueries: function(message, teamName, currrentUsername){

		var expression;
		var operands;
		var operator = "Not Defined";
		var operand1 = "Not Defined";
		var operand2 = "Not Defined";

		if(message.toLowerCase().indexOf("add") >= 0){

			expression = message.substr(11);
			operands = expression.split(' ');
			operand1 = operands[0];
			operand2 = operands[1];
			operator = "add";

		}else if(message.toLowerCase().indexOf("subtract") >= 0){

			expression = message.substr(16);
			operands = expression.split(' ');
			operand1 = operands[0];
			operand2 = operands[1];
			operator = "subtract";

		}else if(message.toLowerCase().indexOf("multiply") >= 0){

			expression = message.substr(16);
			operands = expression.split(' ');
			operand1 = operands[0];
			operand2 = operands[1];
			operator = "multiply";

		}else if(message.toLowerCase().indexOf("divide") >= 0){

			expression = message.substr(14);
			operands = expression.split(' ');
			operand1 = operands[0];
			operand2 = operands[1];
			operator = "divide";

		}

		calculator.calculate(operator, operand1, operand2, teamName);

	},

	calculate: function(operator, operand1, operand2, teamName){

		var answer;

		if(!(isNaN(operand1)) && !(isNaN(operand2))){

			if(operator == "add"){

				answer = parseInt(operand1) + parseInt(operand2);
				botMessage = "Adding " + operand1 + " and " + operand2 + " equals " + answer;

			}else if(operator == "subtract"){

				answer = parseInt(operand1) - parseInt(operand2);
				botMessage = "Subtracting " + operand1 + " and " + operand2 + " equals " + answer;

			}else if(operator == "multiply"){

				answer = parseInt(operand1) * parseInt(operand2);
				botMessage = "Multiplying " + operand1 + " and " + operand2 + " equals " + answer;

			}else if(operator == "divide"){

				if(parseInt(operand2) != 0){
					answer = parseInt(operand1) / parseInt(operand2);
					botMessage = "Dividing " + operand1 + " and " + operand2 + " equals " + answer;
				}else{
					botMessage = "Division by 0 (zero) found.";
				}

			}else if (operator == "Not Defined"){

				botMessage = "Problem found in your expression. Please check and try again.";

			}

		}else{

			botMessage = "Please use numbers.";

		}

		//console.log(answer);

	}

};

var botHistory = {

	checkQueries: function(message, teamName, currrentUsername){

		//rule to show what happened on this day (mixture of events, births and deaths)
		if(message.toLowerCase().indexOf("what happened on this day") >= 0){

			botHistory.getEvents(1);

			botAction.initializeAllVariables();

		//rule to show what happened on this day (events)
		}else if(message.toLowerCase().indexOf("what events happened on this day") >= 0){

			botAction.initializeAllVariables();

		//rule to show what happened on this day (births)
		}else if(message.toLowerCase().indexOf("who were born on this day") >= 0){

			botAction.initializeAllVariables();

		//rule to show what happened on this day (deaths)
		}else if(message.toLowerCase().indexOf("who died on this day") >= 0){

			botAction.initializeAllVariables();

		}

	},

	getEvents: function(choice){

		var urlToCall = "http://history.muffinlabs.com/date";

		if(choice == 1){

		}else if(choice == 2){

		}else if(choice == 3){

		}else if(choice == 4){

		}

		$.ajax({
			type: "GET",
			url: urlToCall,
			dataType: "json",
			success: function(result){
				//console.log(result.articles);
				var item;
				console.log(result);
				returnMessage = "Here you go";
				// for(var i = 0; i < 5; i++){
					
				// 	returnMessage = 

				// }
				console.log(returnMessage);
				//botAction.saveMessage(teamName, returnMessage, bot);
			}
		});

	}

};