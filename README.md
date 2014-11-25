shift-watch
===========

An interactive leaderboard of a realtime MongoDB collection in Node with Express.

# About

This app I wrote tackles the problem of visually keeping track of a list of how long customers have been waiting in the queue with an interactive web app written in Node.JS. I really enjoyed this challenge, it was simple but challenging and made me think about the best way I would want to visualize this data if I were watching your network.

The app is mainly comprised of the Backend API and the Frontend Client respectively:

  - **API** *(server.js)* - This is the Express Node.JS router that serves the index page as well as the stream. The stream has a 1second repeating callback that gets the collection of customers in a MongoDB collection and streams it with a QueryStream through to the Client that has a waiting EventSource. This uses Node.JS with Express, and Mongoose with Express-Handlebars to render the template.
  - **CLIENT** *(main.hbs, public/app.js)* - The client is a static page with the main focus area being the 4 columns that go from Green to Red representing the Customers Mood, as well as the individual Tiles representing the Customers. Customers can be added to the Queue using the form at the top of the screen. As Customers are added to the Queue they start in Green and progress further to the right according to the times requested in the specification (0-2m, 2-5m, 5-10m, 10+m). Customers are color coded by Zip Code to easily identify Customers who are located in the same geographic area, to possibly expedite their pickup. Customer details can be viewed in the right most panel by clicking on a customer tile. Customers can be removed by pressing the Remove button after selecting a Customer, or by sending a direct DELETE request to the API. The client uses jQuery for some JavaScript ease, animate.css for the CSS Animations, Google Fonts for the Typeface, and Font-Awesome for the icons. I didnt think it was 100% necessary to bring in any client side frameworks like bootstrap, backbone or angular. 
   
  
## How do I run it
Extract the codebase, in a terminal type these commands:
```sh
$ npm update
$ npm start
```

The webserver should start and you should get a *Listening on port 8020 message. Then in your browser visit http://localhost:8020 and you should be able to see the app. This version still uses the cloud mongo collection, so if you want to change that modify the MongoURL in server.js.

I also deployed this to a Heroku instance so you can see it live on the [web here] [1] (http://serene-savannah-4676.herokuapp.com/) 

### Dependencies

I used the basic MEAN stack to write this project, with a couple little extras

* Node.JS
* Express with Handlebars
* MongoDB
* jQuery
* Animate.css
* Font-Awesome
* Google Fonts
* Some random CSS button/box shadow generator

### Todo's

 - Make it more responsive, maybe go down to Rows instead of Columns or Tabs on Mobile
 - Add different vehicle types (Car,Bike, Wheelchair for special needs)
 - Map View where the Pins are different colours based on priority/time in queue

[1]:http://serene-savannah-4676.herokuapp.com/
