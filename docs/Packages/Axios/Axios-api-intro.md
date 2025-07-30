# Axios API {#axios-api-1 .title}

The Axios API Reference

Requests can be made by passing the relevant config to `axios`.

##### axios(config) {#axios-config}

``` lang-js
// Send a POST request
axios({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});
```

``` lang-js
// GET request for remote image in node.js
axios({
  method: 'get',
  url: 'http://bit.ly/2mTM3nY',
  responseType: 'stream'
})
  .then(function (response) {
    response.data.pipe(fs.createWriteStream('ada_lovelace.jpg'))
  });
```

##### axios(url\[, config\]) {#axios-url-config}

``` lang-js
// Send a GET request (default method)
axios('/user/12345');
```

### Request method aliases

For convenience aliases have been provided for all supported request
methods.

##### axios.request(config) {#axios-request-config}

##### axios.get(url\[, config\]) {#axios-get-url-config}

##### axios.delete(url\[, config\]) {#axios-delete-url-config}

##### axios.head(url\[, config\]) {#axios-head-url-config}

##### axios.options(url\[, config\]) {#axios-options-url-config}

##### axios.post(url\[, data\[, config\]\]) {#axios-post-url-data-config}

##### axios.put(url\[, data\[, config\]\]) {#axios-put-url-data-config}

##### axios.patch(url\[, data\[, config\]\]) {#axios-patch-url-data-config}

##### axios.postForm(url\[, data\[, config\]\]) {#axios-post-form-url-data-config}

##### axios.putForm(url\[, data\[, config\]\]) {#axios-put-form-url-data-config}

##### axios.patchForm(url\[, data\[, config\]\]) {#axios-patch-form-url-data-config}

> NOTE: When using the alias methods `url`, `method`, and `data`
> properties don\'t need to be specified in config.