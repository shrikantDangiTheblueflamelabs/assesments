public with sharing class Consumer {
  public static final String CLIENT_ID = '3MVG9pRzvMkjMb6nb6se0Rmu9uBOc4ScO4J4ROm.vNzGfD0Fh6wz2x0uwfB4978vMicvPO3e6wn9Us2SoOy5f';
  public static final String CLIENT_SECRET = '03C99FA7222DF86620E26F5435FD142B538BFE7E97130F7D36683710E2CED6BB';
  public static final String USERNAME = 'shrikant.dangi@empathetic-moose-rmsw4b.com';
  public static final String PASSWORD = '00D5j00000Dp9bs';
  public static final String SECURITY_TOKEN = '6Cel800D5j00000Dp9bs8885j000000IrLPpp3INLyX2XaroIwXc9dY82ZHu4DbevowtFWXY1FizmQeGDy4dKP8b39DeewxFoCP9vVD4MHX';

  public static final String AUTH_ENDPOINT = 'https://empathetic-moose-rmsw4b-dev-ed.trailblaze.my.salesforce.com/services/oauth2/token';

  public static void withoutNamedCredential() {
    String loginPassword = PASSWORD + SECURITY_TOKEN;
    // String encodedPassword = EncodingUtil.base64Encode(
    //   Blob.valueOf(loginPassword)
    // );

    HttpRequest req = new HttpRequest();
    req.setMethod('POST');

    String urlParams =
      '?grant_type=password&client_id=' +
      CLIENT_ID +
      '&client_secret=' +
      CLIENT_SECRET +
      '&username=' +
      USERNAME +
      '&password=' +
      loginPassword;
    System.debug('withoutNamedCredential:urlParams:: ' + urlParams);
    req.setEndpoint(AUTH_ENDPOINT + urlParams);

    // Send the request
    Http http = new Http();
    HttpResponse res = http.send(req);

    while (res.getStatusCode() == 302) {
      System.debug(
        'redirecting to :' + res.getHeader('Location') + ' ' + res.getBody()
      );
      req.setEndpoint(res.getHeader('Location'));
      res = http.send(req);
    }

    // Parse and retrieve the access token
    if (res.getStatusCode() == 200) {
      Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(
        res.getBody()
      );
      String accessToken = (String) responseMap.get('access_token');
      // Now you can use this accessToken to make requests to Salesforce APIs
      System.debug('Access Token: ' + accessToken);
    } else {
      System.debug(
        'Failed to retrieve access token. Status code: ' +
          res.getStatusCode() +
          ', Response: ' +
          res.getBody()
      );
    }
  }

  public static String getAuthToken() {
    HttpRequest req = new HttpRequest();
    req.setEndpoint('callout:apiExposerCreds/accessToken');
    req.setMethod('GET');

    Http http = new Http();
    HTTPResponse res = http.send(req);

    if (res.getStatusCode() == 200) {
      Map<String, Object> authResponse = (Map<String, Object>) JSON.deserializeUntyped(
        res.getBody()
      );
      System.debug('got access token: ' + authResponse.get('access_token'));
      return (String) authResponse.get('access_token');
    } else {
      System.debug('error: ' + res.getStatusCode());
      return null;
    }
  }

  public static void withNamedCredential() {
    HttpRequest req = new HttpRequest();
    req.setEndpoint('callout:apiExposerCreds/services/apexrest/LeadManager/'); // Use the named credential endpoint
    req.setMethod('GET'); // Set the method accordingly
    // req.setHeader('Authorization', 'OAuth ' + getAuthToken());

    Http http = new Http();
    HTTPResponse res = http.send(req);

    // Process the response as needed
    if (res.getStatusCode() == 200) {
      System.debug('withNamedCredential:: response: ' + res.getBody());
    } else {
      System.debug(
        'Error withNamedCredential:: response: ' +
          res.getStatus() +
          ' ' +
          res.getBody() +
          ' ' +
          res.getStatusCode()
      );
    }
  }
}
