# mayorpressdb
This application is designed to crawl press releases from the top 10 cities in the US, analyze the content of thore press releases, and then display the results as an interactive data visualization.

When the project is complete it will be vizible at http://www.mayors.buzz, though it is currently still in development. 

For ease of reuse and systems architecture prettiness, the project has been broken into several components.

##mayorpressdb
*(this repo)*
Scrapes information from the mayors offices of 10 most populous cities in the US and stores it in a database.

##mayorpressdb_tags
Takes scraped press releases identifies their topics using IBM's Alchemy API, then stores the resulting tags in a database.

##mayorpressdb_maps
Takes the tag data and stores it as a series of json files formatted for visualization.

##mayorspressmap
Visualizes the data using d3 and provides an interface using React.
