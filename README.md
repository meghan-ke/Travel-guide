Travel Hub
A modern,responsive web application for exploring countries, and getting a little bit of a short summary regarding the particular country.
Features
. Country Explorer: Browse detailed information about 250+ countries
.Wikipedia Design: Optimized for desktop, tablet and mobile devices.
.Fast Search: Filter countries by name, capital and region.

Live Demo 
visit the live site: https://kezamegane.tech

Prerequisites
.Web server (Nginx)
.Modern web browser with Javascript(console)enabled

Technology stack 
.Frontend: Vanilla Javascript (ES6 Modules)
. APIs:
    .REST Countries API
    .Wikipedia REST API
.Styling: Custom css with responsive design
.Server: Nginx with load balancing
.SSL: Let's Encrypt certificates


Project Structure
Travel-guide/
├── index.html              # Homepage
├── countries.html          # Countries listing page
├── country.html            # Individual country details
├── css/
│   ├── style.css          # Main styles
│   └── responsive.css     # Mobile/tablet styles
├── js/
│   ├── app.js             # Main application logic
│   ├── utils.js           # Utility functions & API calls
│   ├── config.js          # API configuration
│   └── places.js          # Places/attractions data
└── README.md

Installation & Setup
.Local Development
    From creating the Travel-guide folder in my vs code and configuring the js/config.js to be the source of my API keys for all the requests to be done in my website.
    Then from the live server on port 5500 we are able to run the website from our local server.
. Remote Deployment 
    When all the changes have been pushed to github, we now clone our repository in /var/www/my-repository, and in /etc/sites-available/default we change the root (path) to point to the repository with all the files like root /var/www/Travel-guide , and this is done on both web-01 and web-02

    The load balancer is also configured to receive requests from both the web-01 and the web-02 and also to transfer request the 301 code from https to http

    and to find my website from a remote server you simply type the domain name above in the live demo.

Configuration 
 API Keys Required 
 1. REST Countries API (public key )
    .Public API:https://restcountries.com
 2. Wikipedia API (no key required )
    public API: https://en.wikipedia.org/api/rest_v1/

Troubleshooting
Common Issues
Problem : Jvascript/css not loading after deployment 
    .Solution: Clear browser cache with Ctrl+Shift+R
    or configure cache headers in Nginx
Problem : "Utils.fetchWikipediaSummary is not a function" 
    .Solution: Ensure <script type="module"> is used in all html files.
Problem: 404 errors for assets on HTTPS
    Solution: Check nginx configuration and ensure try_files is removed from the location ssl block.

Debug Mode
Enable console logging by opening browser DevTools(F12) and checking the Console tab for detailed error messages.

Browser Support

Chrome/Edge (latest)
Firefox (latest)
Safari (latest)

Contributing 
1. Create the repository
2. Commit your changes (git commit -m 'add neew changes')
3. Push to github origin main
4. Open a pull request

Demo video 
link : https://youtube.com/shorts/X30nSmza9QM?feature=share

License
This is licensed with an ssl cetificate which makes it accessible securely over the internet.

Author
Mwizerwa Keza Megane
    .GitHub: meghan-ke
    .Website: kezamegane.tech

Acknowledgements
.REST Countries API for country data
. Wikipedia API for country summaries

Project Status
Active development- Last updated: 24 November 2025

Future Enhancements
. User authentication and saved favorites
. Trip planning features
.Interactive maps integartion
