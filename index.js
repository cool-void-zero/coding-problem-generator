/*
    Todo list
    -----------------------------------------------------------------------------
    [√] telegram bot api
    [√] specify problem type (tag) (ex: string, array, tree, etc)
    [√] specify language
    [√] push to Google Cloud VM
    [√] re-structure file content
        (move default role = "system" template content to a "template.txt")
    [√] tips of solution
    [√] give the solution
        (currenly store in local data.json)
    [√] support not need specify message_id, default get latest tips or solution
    [√] add a statistics.json for record command and total generate
    [√] issue, some time the GPT will give many example (more than 10)
        (edit template, change "at least 2 examples" to "only need 2 examples")
    [√] issue, when use "/easy" GPT will not generate content
        (when the generate command not include "#language", default set to "#en")
    -----------------------------------------------------------------------------
    
    [] simplify between "Setting" and "GeneratorBot" properties and parameters
    [] custom setting default language (human and programming language)
*/
const { Setting } = require("./class/Setting");
const { GeneratorBot } = require("./class/GeneratorBot");

//  instance "Setting" and "GeneratorBot"
const setting = new Setting({
    project_root: __dirname, 
    config_path: "config.json", 
    data_path: "data.json", 
    statistic_path: "statistic.json", 
});
const bot = new GeneratorBot({
    ...setting.config, 

    data_path: setting.data_full_path,
    statistic_path: setting.statistic_full_path, 

    data: {
        ...setting.data
    }, 
    statistic: {
        total_generate: setting.statistic.total_generate, 
        users: new Set(setting.statistic.users), 
        execute_commands: new Map(setting.statistic.execute_commands), 
    }, 
});

console.log(`Your Telegram Bot running...`);