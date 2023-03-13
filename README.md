## Demo
https://t.me/coding_problem_generator_bot

## Introduction
This program used "GPT-3.5" and "TelegramBot" API to simulate LeetCode generate coding problem 
and provide tips and solution (specify programming language).
- Need to provide "OpenAI API KEY" and "TelegramBot TOKEN" in "config.json" file for run this program.
- Split the "generate", "tips", and "solution" template content in the template folder (for GPT role of system or user).

## Command of Telegram Bot
- The generate coding problem command structure: "/difficult_tag#human_language".
- The tips of problem command structure: "/tips_id#human_language".
- The solution of problem command structure: "/solution_id#programming_language".

Here is the main list of commands and their functions:
- /start - Start introducing this channel.
- /tips - Get tips of latest generated coding problem.
- /solution - Get solution of latest generated coding problem.
- /easy - Generate an easy coding problem.
- /medium - Generate a medium coding problem.
- /hard - Generate a hard coding problem.
- /random - Random a coding problem.
- /help - Help of the command list.
