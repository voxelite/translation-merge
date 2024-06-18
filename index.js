const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

function processFiles(inFile, inDirectory, outFile)
{
    //core.info("inFile: " + inFile);
    //core.info("inDirectory: " + inDirectory);
    //core.info("outFile: " + outFile);

    let outputJson = JSON.constructor();

    if(typeof inFile === "string" && inFile !== '')
    {
        const fileData = fs.readFileSync(inFile, 'utf8');
        outputJson = JSON.parse(fileData);
    }

    if(typeof inDirectory === "string" && inDirectory !== '')
    {
        fs.readdirSync(inDirectory).forEach(filename => {
            if(!filename.endsWith(".json"))
                return;

            const fileData = fs.readFileSync(inDirectory + '/' + filename, { encoding: 'utf8', flag: 'r' });
            const json = JSON.parse(fileData);

            Object.keys(json).forEach(key => {
                if(outputJson.hasOwnProperty(key))
                    core.error("Duplicate key: " + key);
                else
                    outputJson[key] = json[key]
            });
        });
    }

    if(Object.keys(outputJson).length !== 0)
    {
        fs.writeFileSync(
            outFile,
            JSON.stringify(outputJson, null, null),
            { encoding: 'utf8', flag: 'w' }
        );
        return outputJson;
    }
    else
        return null;
}

const inDirectory = core.getInput('in-directory');
const outDirectory = core.getInput('out-directory');

const languageNameRegex = /^[a-z]{2}(-[a-zA-Z]{2})*$/

try
{
    if(!fs.existsSync(outDirectory))
        fs.mkdirSync(outDirectory, { recursive: true });

    let languages = new Set;
    fs.readdirSync(inDirectory, { withFileTypes: true }).forEach(fileInfo => {
        if(fileInfo.isDirectory())
        {
            if(languageNameRegex.test(fileInfo.name))
                languages.add(fileInfo.name);
            else
                core.warning("Directory " + fileInfo.name + " was skipped - incorrect language format");

        }
        else if(fileInfo.isFile())
        {
            if(!fileInfo.name.endsWith(".json"))
            {
                core.warning("File " + fileInfo.name + " was skipped - unsupported extension");
                return;
            }
            const language = fileInfo.name.substring(0, fileInfo.name.length - ".json".length);

            // Validate name usability
            if(!languageNameRegex.test(language))
            {
                core.warning("File " + fileInfo.name + " was skipped - invalid name for an object");
                return;
            }

            languages.add(language);
        }
    });

    core.info("languages: " + Array.from(languages).join(','));

    let usedLanguages = new Set;
    languages.forEach(language => {
        let argFile = null;
        if(fs.existsSync(inDirectory + '/' + language + ".json")) //TODO and is file
            argFile = inDirectory + '/' + language + ".json";

        let argDirectory = null;
        if(fs.existsSync(inDirectory + '/' + language)) //TODO and is directory
            argDirectory = inDirectory + '/' + language;

        const outputJson = processFiles(argFile, argDirectory, outDirectory + '/' + language + '.json');
        if(outputJson !== null)
            usedLanguages.add(language);
    });

    core.info("usedLanguages: " + Array.from(usedLanguages).join(','));

    core.setOutput("languages", Array.from(usedLanguages).join(','));
}
catch(error)
{
    core.setFailed(error.message);
}
