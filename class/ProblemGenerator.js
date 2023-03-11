const { Configuration, OpenAIApi } = require("openai");

class ProblemGenerator{
    constructor(
        openai_api_key, 
        template = {
            generate: "", 
            tips: "", 
            solution: "", 
        }, 
        model = "gpt-3.5-turbo"
    ){
        this.template = template;
        this.model = model;
        this.openai = new OpenAIApi(new Configuration({
            apiKey: openai_api_key
        }));
    }

    //  user input command to generate coding problem
    generate = async({ content }) => {
        //  re-assign, default set human language code = "en"
        content = (content.includes("#"))? content: content + "#en";
        
        return new Promise(async (resolve, reject) => {
            try {
                const completion = await this.openai.createChatCompletion({
                    model: this.model, 
                    messages: [
                        { 
                            role: "system", 
                            content: this.template.generate, 
                        }, 
                        {
                            role: "user", 
                            content: content, 
                        }
                    ],
                });

                const generate_content = completion.data.choices[0].message.content;
                resolve(generate_content);
            }catch(err){
                reject(err);
            }
        });
    }

    tips = async({ problem, humen_language = "en" }) => {
        return new Promise(async (resolve, reject) => {
            try {
                const completion = await this.openai.createChatCompletion({
                    model: this.model, 
                    messages: [
                        { 
                            role: "assistant", 
                            content: problem, 
                        }, 
                        {
                            role: "system", 
                            content: this.template.tips.replace(/\${humen_language}/g, humen_language)
                        },
                    ],
                });

                const tips_content = completion.data.choices[0].message.content;
                resolve(tips_content);
            }catch(err){
                reject(err);
            }
        });
    }

    solution = async({ problem, programming_language = "random" }) => {
        return new Promise(async (resolve, reject) => {
            try {
                const completion = await this.openai.createChatCompletion({
                    model: this.model, 
                    messages: [
                        { 
                            role: "assistant", 
                            content: problem, 
                        }, 
                        {
                            role: "user", 
                            content: this.template.solution.replace(/\${programming_language}/g, programming_language)
                        },
                    ],
                });

                const solution_content = completion.data.choices[0].message.content;
                resolve(solution_content);
            }catch(err){
                reject(err);
            }
        });
    }
}

module.exports = { ProblemGenerator };