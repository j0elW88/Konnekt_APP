# Konnekt_APP

**Konnekt** is an app for Involved students, and a tool for clubs and organization that need to track attendance and or plan events <br />
Konnekt is an accessibility tool for students and event planners that helps people connect and participate with their organization and allows sed clubs to track attendance, and be involved with their members <br />
Unlike IClicker, Google Forms, or Canvas, that are mostly only usable in educational & professional settings Konnekt offers a new user friendly approach to attendance and participation.  <br />
Konnekt caters towards new users, provides insight into future events, provides a platform for more comfortable interaction between organization and user, and offers a pleasing user interface! <br />

<br />
**Konnekt, The Framework of Every Club**
<br />

# How to Open Konnekt 

To Boot Konnekt with the MongoDB Local Implementation<br />
1) Download Local MongoDB from this link https://www.mongodb.com/try/download/community <br />
2) Open components and route to config where you'll find globalvariables.ts, input your IP Address (and any other information requested) in the file. Also locate the .env file in "backend" and put your IP Address in the "IP_ADDRESS= ..." Section here as-well. Your IP4 Address can be found by running ipconfig in your terminal and locating the "IP4" address under Wireless and Lan connections. <br />
3) **Open two terminals in your code editor**, (typically vscode) and ensure you correctly cd into **"cd konnekt_app/backend"** and in your other terminal **"cd konnekt_app"** <br />
4) In backend, run the command: **"node server.js"** If connected correctly, you should recieve the message "🚀 Server running on http://localhost:5000" followed by "MongoDB connected." If this does not work, ensure your MongoDB server has been activated/Connected on the MongoDB app. <br />
5) After you have successfully completed step 4 (or if you do not wish to test signin feature) You may now access the expo front end by running **"npx expo start"** and opening the local host either from your IOS or Android device using the QR Code while on the same wifi network, or by accessing it through your preferred browswer.<br />

<br />
Note that Sign up and Sign In Requests are stored and hashed locally, which means that the database is not shared across the cloud *currently*, so users on one device will not be transfered to another users device when activating the project from the github implementation. <br />
<br />


*If for some reason your code does not boot immediately, firstly ensure your Signin and Signout IP address are correct, then ensure you are correctly booting MongoDB, then if needed you may need to run npm install in your backend folder (specifically the backend folder)* <br />

If you encounter any other errors feel free to ask!<br />

*If you wish to fulfill an outgoing pull request, or spot an inefficiency in our code, feel free to make a pull request so that we may review and push your fixes!* <br />

# Other Notable Features Walkthrough Below: <br />


