# My Curiosity Report
## Using PlayWright for An Unexpected Purpose

### Context

I work as a Student Developer at BYU's Office of IT Application Engineering team. In this team, we have a tri-annual "Hack Day"
event where everyone in the office is encouraged to spend a day of work on a personal project they find interesting or exciting
with hopes that the learning done and the deliverables produced will lead to a stronger team and better-equipped developers. 

For my Hack Day project, I wanted to make a Microsoft Teams message spammer. For context, I have often worked with engineers in
our office that are incredibly hard to track down due to their intensely busy schedules. A lot of the time, I send multiple 
messages to these engineers only to eventually get lucky and send a message at a time when they are not busy. I knew that 
sending these messages was effectively a burnoff of time that I could otherwise spend collaborating and developing, so I wanted 
to build a bot that could do the message spamming for me. 

### What Development Looked Like

When Hack Day finally came around this semester, I set off to work on my Teams Spammer application. My original direction was 
to try and use a batch process or script to make API calls to the MS Teams API endpoints hosted by Microsoft. This proved to be 
a very tricky route due to the amount of red tape around those API's. I would need way higher access to Microsoft services at 
BYU than I could ever hope to obtain in my current position just to work on this project, so I needed to change gears. 

Luckily, I realized that there was another means by which I could potentially interact with Teams programmatically: Using a 
User-Interface testing framework like PlayWright. I used our course material to read ahead about how to use PlayWright, and I 
was able to record a basic test against the Byu.edu website within minutes. It was exceptionally easy for me to get everything 
running because of the VSCode extension for PlayWright that automated a great majority of the boilerplate needed to get 
everything running. 

Once I understood PlayWright more, I began trying to record steps to log into Teams using my credentials and then sending a 
message to an individual of my choice. I realized that while the record functionality of PlayWright is exceptionally good, it 
isn't capable of overcoming some nuances in large web applications like MS Teams. One problem I ran into often was that the 
recorder would import lines of code to select entities by text on the screen, but Teams tends to have multiple duplicate 
entries for strings of text in its DOM. I needed to research ways to select objects using other methods, and sure enough, I 
found plenty of alternatives like selecting by Role or Placeholder. Once I hand-coded these in, I was able to send my first 
message.

That was all great until I couldn't escape an instance where the object selector would always end up matching two or more 
objects in the DOM. Particularly, the name of the user I am spamming will show up on screen in multiple places, so to ask 
PlayWright to select them after they've already been selected would result in an error. To resolve this, I learned how to use 
the .all() function to return a list of objects that match and select the first entry from the list. Once this was operating 
correctly and predictably, I worked on making this test file into something useable.

### The Final Product

You can find my project in its entirety by going to its [GitHub Repo](https://github.com/nearl2001/ms-teams-sender).

Once I had PlayWright operating as expected, I used a dotenv configuration file to set variables for all of the key modifiers 
in the test. This included objects like the username and password being used to sign into the Teams interface, the name of the 
user you were looking to harass, the time the service should wait in ms between sending messages, and the message body you 
wanted to send. These all increased the usability and flexibility of the application to do what it set out to do. 

This project definitely has some flaws... Unfortunately, I didn't work out a way to run this system in a non-test environment 
so it doesn't look like the spammer application that it is. Also, PlayWright needs to continue to run in order to do its job of 
sending messages over and over for a long time until you get a response. Maintaining the runtime of a PlayWright test took a 
minute to figure out, but I was able to get the timeout removed. That may allow it to continue running in theory, but I haven't 
seen in practice whether this will actually work for the long term given that Teams may log you off automatically after a 
certain time period. 

All in all, this was a great way to get to know PlayWright before we learned it in class. I am glad that I did this for my Hack 
Day project, though I hope I never need to use it!
