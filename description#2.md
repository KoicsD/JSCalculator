# Extend the calculator's functionality

## What's AJAX?

AJAX stands for Asynchronous JavaScript and XML.
In a nutshell, it is the use of the XMLHttpRequest object
to communicate with server-side scripts.
It can send as well as receive information in a variety of formats,
including JSON, XML, HTML, and even text files.
AJAX’s most appealing characteristic, however,
is its "asynchronous" nature, which means
it can do all of this without having to refresh the page.
This lets you update portions of a page based upon user events.

To understand the basics of AJAX read this article:

https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started

Step by Step

1. After you read it open the calculator code in your editor.  
   If you haven't written that just copy the code of it  
   to your local machine and add it to a git repository.
2. Add a new div element to the page under the calculator with an id.
3. After this use [numbersapi](http://numbersapi.com/#42)  
   to show interesting facts about the calculation result's all digit.  
   For this you can use the batch requests of numbers API.  
   When the user hit click on the "=" sign  
   then make an HTTPRequest to the numbersapi page  
   and get the necessary info  
   which you will get in a [JSON](http://json.org/) format.
4. You can store the already got number facts in an array  
   or even in the [local storage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage)  
   to reduce the number of HTTP request.
5. Fix upcoming issues.  
   If your code works corretly commit your changes into your repository.
6. Submit your repository url here!
