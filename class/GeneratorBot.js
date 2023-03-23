const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
//	custom class
const { ProblemGenerator } = require("./ProblemGenerator");

class GeneratorBot{
	//	telegram bot default main menu keyboard
	configMenuKeyboard({
		keyboard = [], 
		resize_keyboard = true, 
		one_time_keyboard = true,
	}){
		return  {
			reply_markup: {
				keyboard: keyboard,
				resize_keyboard: resize_keyboard,
				one_time_keyboard: one_time_keyboard,
			},
		};
	}

  	constructor({ 
		openai_api_key, telegram_token, template, 
		data_path, data, statistic_path, statistic = {
			total_generate: 0, 
			users: new Set(), 
			execute_commands: new Map()
		}
	}){
		//	instance 
    	this.generator = new ProblemGenerator(openai_api_key, template);
		this.bot = new TelegramBot(telegram_token, { polling: true });
		//	split data value
		this.data_path = data_path;
		this.user_map = new Map(data.queues);
		this.queue_limit = data.queue_limit;
		//	split statistic value
		this.statistic_path = statistic_path;
		this.statistic = statistic;
		
		this.menu_keyboard = this.configMenuKeyboard({
			keyboard: [
				['/easy', '/medium', '/hard', '/random'], 
				['/tips', '/solution', '/help']
			]
		});

		//	listen telegram, user sent message
		this.bot.on('message', (user_msg) => {
			// const chatId = user_msg.chat.id;
			const user_chat_id = user_msg.chat.id;
			const username = user_msg.chat.username;
			let user_cmd = user_msg.text.toLocaleLowerCase();
			
			//	show running whose and what command
			if(user_cmd.includes("/")){
				console.log(`"${username}" execute "${user_cmd}" command.`);
				
				//	new users
				if(!this.statistic.users.has(username))
					this.statistic.users.add(username);
				//	count this command execute total
				let command_count = this.statistic.execute_commands.get(user_cmd) || 0;
				this.statistic.execute_commands.set(user_cmd, command_count + 1);

				this.writeStatistic(this.statistic);
			}

			//	introduce this bot
			if(user_cmd === "/start"){
				const start_msg = `
					Welcome ${username} to here! 
					Now let me introduce to you what instructions the bots in this channel have: 

					1. [Generate] 
					--------------------------------------------------
					1a. [Required] "/easy", "/medium", "/hard", "/random" or any any descriptive gerund word.
					1b. [Optional] set specify one or multiple type of the generate problem, ex: "/easy_array", "/medium_string-array".
					1c. [Optional] set specify human language code or country language, ex: "/easy#ja", "/easy#taiwan".
					--------------------------------------------------

					2. [Tips] 
					--------------------------------------------------
					2a. [Required] "/tips" or "/tips_xxx" (xxx meaning specify coding problem id)
					2b. [Optional] set specify human language code or country language, ex: "/tips#en", "/tips#malaysia".
					--------------------------------------------------

					3. [Solution] 
					--------------------------------------------------
					3a. [Required] "/solution" or "/tips_xxx" (xxx meaning specify coding problem id)
					3b. [Optional] set specify programming language, ex: "/solution#javascript", "/solution#java".
					--------------------------------------------------

					This bot will collect your "username" and your "commands" for statistics and analysis.
				`;

				/*
				const options = {
					reply_markup: {
						keyboard: this.keyboard,
						resize_keyboard: true,
						one_time_keyboard: true,
					},
				};

				this.bot.sendMessage(user_chat_id, start_msg, options);
				*/

				this.bot.sendMessage(user_chat_id, start_msg, this.menu_keyboard);
			}
			//	help, show command list
			else if(user_cmd === "/help"){
				const help_msg = `
					Here is the list of commands and their functions:
					
					/start - Start introducing this channel.
					/tips - Get tips of latest generated coding problem.
					/solution - Get solution of latest generated coding problem.
					/easy - Generate an easy coding problem.
					/medium - Generate a medium coding problem.
					/hard - Generate a hard coding problem.
					/random - Random a coding problem.
					/help - Help of the command list.
				`;

				this.bot.sendMessage(user_chat_id, help_msg, this.menu_keyboard);
			}
			//	tips of problem
			else if(user_cmd.includes("/tips")){
				const [cmd, message_id] = user_cmd.split('_');
				const humen_language = user_cmd.split('#')[1] || "en";
				const username = user_msg.chat.username;
				
				if(this.user_map.has(username)){
					const queue = this.user_map.get(username);
					let problem = "";

					//	not specify "message_id"
					if(user_cmd === "/tips")
						problem = queue[queue.length - 1]['text'];
					//	can expected specify "message_id"
					else{
						for(let obj of queue)
							if(parseInt(message_id) === obj['id']){
								problem = obj['text'];
								break;
							}
					}
					
					this.generator.tips({
						problem: problem, 
						humen_language: humen_language, 
					})
					.then(tips => this.bot.sendMessage(user_chat_id, tips, this.menu_keyboard))
					.catch(err => {
						console.error(err);

						//	custom error response message
						const err_msg = `Fail to call OpenAI ChatGPT to generate tips.`;
						console.log(err_msg);
						this.bot.sendMessage(user_chat_id, err_msg);
					});
				}
			}
			//	solution of problem
			else if(user_cmd.includes("/solution")){
				const [cmd, message_id] = user_cmd.split('_');
				const programming_language = user_cmd.split('#')[1] || "random";
				const username = user_msg.chat.username;
				
				if(this.user_map.has(username)){
					const queue = this.user_map.get(username);
					let problem = "";
					
					//	not specify "message_id"
					if(!user_cmd.includes('_'))
						problem = queue[queue.length - 1]['text'];
					//	can expected specify "message_id"
					else{
						for(let obj of queue)
							if(parseInt(message_id) === obj['id']){
								problem = obj['text'];
								break;
							}
					}

					this.generator.solution({
						problem: problem, 
						programming_language: programming_language, 
					})
					.then(solution => this.bot.sendMessage(user_chat_id, solution, this.menu_keyboard))
					.catch(err => {
						console.error(err);

						//	custom error response message
						const err_msg = `Fail to call OpenAI ChatGPT to generate solution.`;
						console.log(err_msg);
						this.bot.sendMessage(user_chat_id, err_msg);
					});
				}
			}
			//	generate problem
			else if(user_cmd.includes("/")){
				//	call OpenAI GPT API to generate problem
				this.generator.generate({ 
					content: user_cmd
				})
				.then(coding_problem => {
					this.statistic.total_generate += 1;
					this.writeStatistic(this.statistic);

					return this.bot.sendMessage(user_chat_id, coding_problem);
				})
				//	after sent, store the generate problem for refer
				.then(bot_msg => {
					const { text } = bot_msg;
					const message_id = bot_msg.message_id;

					if(this.user_map.has(username)){
						let queue = this.user_map.get(username);

						if(queue.length >= this.queue_limit)
							queue.shift();
						
						//	push the new message and re-new to variable and data path file
						queue.push({
							id: message_id, 
							text: text, 
						});
						this.user_map.set(username, queue);
						
						this.writeData(this.user_map, this.queue_limit);
					}
					else{
						this.user_map.set(username, [{
							id: message_id, 
							text: text, 
						}]);

						this.writeData(this.user_map, this.queue_limit);
					}

					//	interactive commands
					const options = this.configMenuKeyboard({
						keyboard: [['/tips', '/solution']]
					});
					/*
					const options = {
						reply_markup: {
							keyboard: [
								[`/tips`, `/solution`], 
							],
							resize_keyboard: true,
							one_time_keyboard: true,
						},
					}
					*/

					this.bot.sendMessage(user_chat_id, `You can click below command for tips or solution: 
						"/tips_${message_id}", "/solution_${message_id}"
					`, options);
				})
				.catch(err => {
					console.error(err);

					//	custom error response message
					const err_msg = `Fail to call OpenAI ChatGPT to generate problem.`;
					console.log(err_msg);
					this.bot.sendMessage(user_chat_id, err_msg);
				});
			}
		});
  	}

	writeData(map, queue_limit = this.queue_limit){
		const data = {
			queues: [...map], 
			queue_limit: queue_limit, 
		}
		const json_str = JSON.stringify(data, null, 2);

		//	use async to optimize process
		fs.writeFile(this.data_path, json_str, (err) => {
			if(err)
				console.error(err);
		});
	}
	
	writeStatistic(statistic= {}){
		let data = {
			...statistic
		}
		//	change data type "Set" and "Map" to array to store
		data.users = [...statistic.users];
		data.execute_commands = [...statistic.execute_commands];
		const json_str = JSON.stringify(data, null, 2);

		//	use async to optimize process
		fs.writeFile(this.statistic_path, json_str, (err) => {
			if(err)
				console.error(err);
		});
	}
}

module.exports = { GeneratorBot };