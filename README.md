# siteagg
Site aggregator

You are to make a website aggregator application.

The purpose of the application is to allow users to share, discuss and rate pages they find on the internet.

You are provided with some starter code which displays a simple list of websites.

1. Users can register and login.
2. Users can post new websites if they are logged in. Websites posted by users should have an URL and a description.
3. Users can up and down vote webpages by clicking a plus or a minus button.
4. Websites should be listed with the most up voted site first.
5. The listing page shows when the website was added and how many up and down votes it has.
6. Users can move to a detail page for a website (using routing).
7. On the detail page, users can post comments about a webpage, and they are displayed below the description of the webpage.

<strong>Challenge 1: Automatic information</strong>
Can you use the HTTP package for Meteor to pull in information about the posted web links automatically, so the user does not need to enter anything other than the URL? 

<strong>Challenge 2: Search function</strong>
Implement a search function that allows the user to search within the listed sites for key words

<strong>Challenge 3: Website recommender </strong>
Can you recommend websites to users based on things they have up voted and commented on? E.g. if I up vote a site entitled ‘Tofu recipes’, it would recommend other sites with ‘tofu’ and ‘recipe’ in their titles or descriptions. 
