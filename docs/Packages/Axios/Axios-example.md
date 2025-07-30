# Minimal Example {#minimal-example .title}

A little example of using axios

## note: CommonJS usage {#note-common-js-usage}

In order to gain the TypeScript typings (for intellisense /
autocomplete) while using CommonJS imports with `require()` use the
following approach:

``` lang-js
const axios = require('axios').default;

// axios.<method> will now provide autocomplete and parameter typings
```

# Example

Performing a `GET` request

``` lang-js
const axios = require('axios');

// Make a request for a user with a given ID
axios.get('/user?ID=12345')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .finally(function () {
    // always executed
  });

// Optionally the request above could also be done as
axios.get('/user', {
    params: {
      ID: 12345
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
    // always executed
  });  

// Want to use async/await? Add the `async` keyword to your outer function/method.
async function getUser() {
  try {
    const response = await axios.get('/user?ID=12345');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
```

> **NOTE:** `async/await` is part of ECMAScript 2017 and is not
> supported in Internet Explorer and older browsers, so use with
> caution.