Prioritized Event Bus
======================

Provides the possibility to load several extensions with full constol under the loading process and tool events.

Support BI Applications:
  - Tableau

### Tableau

Assumptions:
- Tableau server: `ecsb00100f14.epam.com`

Steps:
1. Open `ecsb00100c96.epam.com`
2. Go to `C:\inetpub\wwwroot\tech_demo\`
3. Create `extensions-loader` folder and copy to it `resources/extenstions-loader.js` script
4. Create `prioritized-event-bus` and copy the built script `prioritized-event-bus.js`
5. Open `ecsb00100f14.epam.com`
6. Go to the folder `C:\Users\All Users\Tableau\Tableau Server\data\tabsvc\config` and add next lines to the config file `httpd.conf`:
    ```
    <VirtualHost *:443>
      <LocationMatch "/vizql/.*" >
        AddOutputFilterByType INFLATE;SUBSTITUTE;DEFLATE text/html
        Substitute "s|<\s*head\s*>|<head><script src=\"https://ecsb00100c96.epam.com:444/extensions-loader/extensions-loader.js\"></script>|i"
      </LocationMatch>
    </VirtualHost>
    ```
7. Reload Tableau server
8. Login to [https://ecsb00100f14.epam.com](https://ecsb00100f14.epam.com/) to check extensions.


## Development

### Requirements
* Optional: Node Version Manager to switch between NodeJS versions (this item can be skipped if the proper NodeJS version is already installed). Check it with `nvm --version`
* NodeJS v8.11+. Check it with `node -v`
* Node Package Manager v5.6+. Check it with `npm -v`

### Installation of dependencies
1. Clone a repository: `git clone git@gitbud.epam.com:epm-eard/prioritized-event-bus.git`
2. Go to the cloned repository: `cd prioritized-event-bus`
3. Make sure that NodeJS version is right:
    * if NVM is installed choose necessary NodeJS version: e.g. `nvm use 8.11.3`
    * otherwise just check that the NodeJS version is 6.11+ with `node -v`
4. Install dependencies with Node Package Manager: `npm install`

### Build creation
1. Go to the local git repository: `cd prioritized-event-bus`
2. Run a build script: (e.g. `npm run build` - see the [table 1](#table-1) below)
3. Open the server `ecsb00100c96.epam.com` and go to the repository `C:\inetpub\wwwroot\tech_demo\`
4. Create there `extensions-loader` folder and copy there `resources/extenstions-loader.js` script (see the customizing comment in in its header)
5. Create there `prioritized-event-bus` folder and copy there all content of `dist-[tool-name-you-build-for]` folder

<a name="table-1"></a>**Table 1.** Commands for build creation (*implemented just for Tableau*)

 NPM command                   | Description                              | Repository build name
------------------------------ |----------------------------------------- | ---------------------
 npm run build                 | Builds PBE production bundle             | dist-tableau




### Test on local server
1. Go to the repository: `cd prioritized-event-bus`
2. Start local server (e.g. `npm start` - see the [table 2](#table-2) below) 
3. Open <https://localhost:9093> (or a specific link from the [table 2](#table-2) below) where webpack dev server will be launched 



<a name="table-2"></a>**Table 2.** Commands for local server tests (*implemented just for Tableau*)

 NPM command                            | Description                                                | Test link
--------------------------------------- |----------------------------------------------------------- | ---------------------------------------------------------
 npm start                              | Launches PBE local server                                  | [Start page](https://localhost:9093)
 npm run start-with-remote-tool         | Launches PBE local server just with the script for Tableau | [prioritized-event-bus.js](https://localhost:9093/prioritized-event-bus.js)



### Using of tool-specific global objects (advanced)

Avoid of strait getting of global objects for tools, i.e.:
1.  <span style="color:red;">bad:</span>
    ``` 
    let workBook = window.parent.tableau.VizManager.getVizs()[0].getWorkbook(); 
    ```
2.  <span style="color:red;">bad:</span>
    ``` 
    let mstrPageName = window.mstrApp.pageName;
    let mstrServerName = window.mstrConfig.serverName;
    ```

Use instead:
1.  <span style="color:green;">good:</span>
    ```
    import globals from '../../tool-specific-helpers/globals';
    let workBook = globals.tableau.VizManager.getVizs()[0].getWorkbook();
    ```
2.  <span style="color:green;">good:</span>
     ```
    import globals from '../../tool-specific-helpers/globals';
    let mstrPageName = globals.mstrApp.pageName;
    let mstrServerName = globals.mstrConfig.serverName;
    ```

It helps to launch and test the application locally.


