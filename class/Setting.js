const path = require('path');
const fs = require("fs");

class Setting{
    constructor({ 
        project_root, config_path = "config.json", 
        data_path = "data.json", statistic_path = "statistic.json" 
    }){
        this.project_root = project_root;
        this.data_full_path = path.join(this.project_root, data_path);
        this.statistic_full_path = path.join(this.project_root, statistic_path);
        this.config = this.getConfig(config_path);
        this.data = this.getData(data_path);
        this.statistic = this.getStatistic(statistic_path);
    }

    getConfig(config_path){
        const full_path = path.join(this.project_root, config_path);
        let json = JSON.parse(fs.readFileSync(full_path));
        
        //  load all the template
        json['template'] = {};
        for(const prop in json['template_path']){
            const template_str = fs.readFileSync(json['template_path'][prop], { encoding: "utf-8" }).replace(/\r\n/g, '\n');

            json['template'][prop] = template_str;
        }
        delete json['template_path'];
        
        return json;
    }

    getData(data_path){
        const full_path = path.join(this.project_root, data_path);
        const json_str = fs.readFileSync(full_path, { encoding: "utf-8" });

        return JSON.parse(json_str);
    }

    getStatistic(statistic_path){
        const full_path = path.join(this.project_root, statistic_path);
        const json_str = fs.readFileSync(full_path, { encoding: "utf-8" })

        return JSON.parse(json_str);
    }
}

module.exports = { Setting };