<img src="./Images/Logos/Sunset.png" alt="sunset" style="float:right; padding:20px">

# Reskin of Sunset Wholesale West website

This is the source code for a javascript application
that reads the contents of the current website and
creates HTML for a new template on the fly as the 
user navigates the website.  

The current template in
use is *ShopGrids Bootstrap 5 eCommerce HTML Template*,
downloadable from https://graygrids.com/templates/shopgrids-bootstrap-ecommerce

## Important URLs
This is the list of URLs relevant to this project.

### Original Site
https://swwest.com

### New Site
https://swwest.com/reskin/

### Slab Documentation
https://sunsetwest.slab.com/posts/website-reskin-db5t2kux (requires login)

## Files and Folders
A description of the folders within this project follows:

* assets/ - source files from the purchased template
* images/ - images used by the rest of the project
* newskin/ - assets specific to the application rendering the purchased template
* NewSkin.js - the file that needs to be placed within the original website to enable the new skin to be displayed

## Installation and Usage
In order for the website to be converted to using the
new skin, the file **Default.Master** needs to be edited
to include the following javascript declaration at the
top of the &lt;body&gt; tag.

````
<script type="module" src="NewSkin.js"></script>
````

## Author
This project was created between February and July 2024 by Scott Mitting 
<a href="mailto:scottm@swwest.com">&lt;scottm@swwest.com&gt;</a>,
an employee of the IT department at 
<a href="https://swwest.com">Sunset Wholesale West</a>.