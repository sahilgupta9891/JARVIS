console.log( " Starting background.js")
const apikey  = "";
const url= "https://api.openai.com/v1/chat/completions ";
async function query(data) {
    const respone = await fetch (
        "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
        {
            headers : { Authorization : " Bearer"},
            method : "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await respone.json();
    return result;
}
async function OpenaiFetchAPI(messages) {
    console.log("Using OPENAI function");
    console.log(messages);
    console.log("Calling GPT3");
    const data = {
        model: "gpt-4o-mini",
        messages:messages,
        temperature: 1,
        max_tokens: 300,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }
    const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(data),
      };
    const response = await fetch(url, options)
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        return data;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
      console.log("success");
    console.log(response['choices'][0]['message']['content']);
    return response['choices'][0]['message']['content'];

}
class Jarvis{
    constructor( command){
        this.command= command;
        //openai credentials
    }
    async parser(type){
        if( type=="number"){
            // Give numerical value which refer to the number of time system to forward or backward
            const messages=[
                {
                "role": "system",
                "content ": "You have only one job . You will be given statement about navigating through tabs  in two directions. Forward or backward .You have to ONLY return  the numerical value of the number of times to go forward or backward .Do not return ANYTHING else "
                },
                {    
                    "role": user,
                    "content": this.command
                },
            ]
            const response = await OpenaiFetchAPI(messages);
            const a= Number(response);
            return a;
        }
        else if (type == "websites" ){
            // Give the name of the website that separated by comma
            const messages=[
                {
                    "role":"system ",
                    " content ": " You have one job : You will be given a request or a command to help user navigate tabs , you have to identify the names of websites , and return them in a comma separated manner . Do not put any space after the comma . Only return the list of names ans NOthING else.  "
                },
                {
                    "role ": "user",
                    "content": this.command
                
                },
            ]
            const response= await OpenaiFetchAPI(messages);
            return String(response).split(",");
        }
    }
    async get_ID_by_its_name(names){
        const IDs=[];
        const x = names.length;
        let i;
        const urls=[];
        for( i=0; i<x; i++){
            const site = names[i];
            let here = ( " https://*."+site+".com/*");
            const tabs = await chrome.tabs.query({ url: String(here)});
            let j;
            for( j=0; j< tabs.length; j++){
                IDs.push(tabs[j].id);
            }
        }
        return IDs;
    }
    async go_backward(){
        // go back for n  number of times
        const times = await this.parser("number");
        let i ;
        // run loop for n number of times
        for(i = 0; i<times;i++)
        {
            const tabs = await chrome.tabs.query({active: true});
            console.log(tabs[0]);
            Promise.resolve(chrome.tabs.goBack(tabs[0].id));
        }
    }
    async go_forward(){
        // go forward for n number of times
        const times = await this. parser(" number", this.command);
        let i;
        //run loop for n number of times
        for( i=0; i<times; i++){
            const tabs = await chrome.tabs.query({ active: true});
            console.log(tabs[0]);
            Promise.resolve(chrome.tabs.goForward(tabs[0].id));
        }
    }
    async close_current_tab(){
        // close the current working tab 
        const tabs = await chrome.tabs.query({ active : true});
        Promise.resolve(chrome.tabs.remove(tabs[0].id));
    }
    async close_multiple_tabs(IDs){
        // close or remove tabs of  particular names
        Promise.resolve(chrome.tabs.group({tabIds: IDs}));
    }
    async regroup_particular_tabs(IDs){
        //form a group of particular tab of same id 
        Promise.resolve(chrome.tabs.group({ tabIds: IDs}));
    }
    async entertainment(){
        // show website when i was bored 
        const urls = ["https://www.patatap.com/", "https://libraryofbabel.info/search.html" ,"https://www.iwastesomuchtime.com/" , "https://codepen.io/akm2/full/AGgarW", "https://stars.chromeexperiments.com/","https://orb.farm/","https://findtheinvisiblecow.com/", "https://papertoilet.com/"];
        let x = urls.length;
        Promise.resolve(chrome.tabs.create({ url : urls[Math.floor(x*(Math.random()))]}));
    }
    async open_new(){
        const list = await this.parser(" websites");
        let x = list.length;
        let i=0;
        for(i=0; i<x; i++){
            if(i!=x-1){
                Promise.resolve(chrome.tabs.create({url :"https://www."+ list[i]+".com", active : false}));
            }
            else{
                Promise.resolve( chrome.tabs.create({url: "https://www."+ list[i]+".com"}))
            }
        }
    }
    async get_title(){
         console.log(items[0]);
         let titles=[];
         let i=0;
         const x = items.length;
         items.forEach(item=>
            titles.push(item.title)
         );
         return titles;

    }
    async reopen_closed_tabs(){
        const items= await chrome.history.search({ text:""});
        console.log(items);
        this.get_titles(items);
        console.log(items[0].hasOwnProperty("title"))
        let titles = await this.get_titles(items);
        console.log(titles);
        let data={
            "inputs":{
                "source_sentence": this.command,
                "sentences": titles
            }
        }
        console.log(data);
        let index = await query(data);
        console.log(index);
        let i=0;
        let x = items.length;
        for(i=0;i<x; i++){
            if( index[i]>= 0.25){
                Promise.resolve(chrome.tabs.create({ url: items[i].url}))
            }
        }
    }

};
 class control{
    constructor(command){
        this.command= command;
    }
    async classifier(){
        let answer=0;
        const messages=
        [ {
            "role": system,
            "content": " You are a task classifier. given a particular task to do , you just return the numerical value of the ID of the task . Here are all the task types , with their IDs as the serial numbers at the starting of their description.\n0\nA task that indicates that the user wants to open pr initiate something new ,like creating a tab op opening a tab , \n1\nA task that indicates to close the current tab session or the present session .\n2\nA task that indicate to close more than one (multiple) things  or close or shutdown tabs of a particular website .\n3\nA task that indicate that the user wants to navigate to the previous tab or go backwards. \n4\nA task that indicate that the user wants to navigate to the next tab , or go forward. \n5\nA task that the user wants to group or assimilate particular types of tabs together . \n6\nwhen the user is sad , hungry or bored. Also when you think that the command doesn't follow under any of the above categories.\n7\nwhen the user is trying to reopen closed tabs . Reopen, not open new tabs , but open already closed tabs. \n\n Remember , Only return the numerical value of the typeof task and NOTHING else.\ " 
        },
        {
            "role": "user",
            "content ": this.command
            
        },
    ]
    const response = await OpenaiFetchAPI(messages);

     await this.trigger(Number(response));
    }
    async trigger(task){
        const today =new Jarvis(this.command);
        switch(task){
            case 0:
                today.open_new()
                break;
                case 1 :
                    today.close_current_tab();
                    break;
                case 2:
                    const nam= await today.parser("websites");
                    const IDs = await today.get_ID_by_its_name(nam);
                    await today .close_multiple_tabs(IDs);
                    break;
                case 3:
                    await today.go_backward();
                    break;
                case 4 :
                    await today.go_forward();
                    break;
                case 5 :
                    const names = await today.parser("websites");
                    const ID2= await today.get_ID_by_its_name(names);
                    await today.regroup_particular_tabs(ID2);
                    break;
                case 6 :
                    await today.entertainment();
                    break;
                case 7 :
                    await today.reopen_closed_tabs()
                    break;

        }
    }
 }
 chrome.runtime.onMessage.addListener( async ( obj, sender, response)=>{
    const { type ,command}= obj;
    if( type == "NEW_COMMAND"){
        const handler = new control (String(command));
        handler.classifier();
        console.log(command);
        console.log( "We are at service _worker, the message has been listened");
    }
 });