public with sharing class ConsumerAttemp2 {
  public static final String CLIENT_ID = '3MVG9pRzvMkjMb6nb6se0Rmu9uBOc4ScO4J4ROm.vNzGfD0Fh6wz2x0uwfB4978vMicvPO3e6wn9Us2SoOy5f';
  public static final String CLIENT_SECRET = '03C99FA7222DF86620E26F5435FD142B538BFE7E97130F7D36683710E2CED6BB';
  public static final String USERNAME = 'shrikant.dangi@empathetic-moose-rmsw4b.com';
  public static final String PASSWORD = '00D5j00000Dp9bs';
  public static final String SECURITY_TOKEN = '6Cel800D5j00000Dp9bs8885j000000IrLPpp3INLyX2XaroIwXc9dY82ZHu4DbevowtFWXY1FizmQeGDy4dKP8b39DeewxFoCP9vVD4MHX';

  public static final String AUTH_ENDPOINT = 'https://login.salesforce.com/services/oauth2/token';

//   public static void withoutNamedCredential() {
//     //// TODO: pending resolution for following
//     //// 14:43:00.41 (43301240)|USER_DEBUG|[25]|DEBUG|withoutNamedCredential:urlParams:: ?grant_type=password&client_id=3MVG9pRzvMkjMb6nb6se0Rmu9uBOc4ScO4J4ROm.vNzGfD0Fh6wz2x0uwfB4978vMicvPO3e6wn9Us2SoOy5f&client_secret=03C99FA7222DF86620E26F5435FD142B538BFE7E97130F7D36683710E2CED6BB&username=shrikant.dangi@empathetic-moose-rmsw4b.com&password=00D5j00000Dp9bs6Cel800D5j00000Dp9bs8885j000000IrLPpp3INLyX2XaroIwXc9dY82ZHu4DbevowtFWXY1FizmQeGDy4dKP8b39DeewxFoCP9vVD4MHX
//     //// 14:43:01.638 (1638855099)|USER_DEBUG|[49]|DEBUG|Failed to retrieve access token. Status code: 400, Response: {"error":"invalid_grant","error_description":"authentication failure"}
//     String loginPassword = PASSWORD + SECURITY_TOKEN;

//     HttpRequest req = new HttpRequest();
//     req.setMethod('POST');

//     String urlParams =
//       '?grant_type=password&client_id=' +
//       CLIENT_ID +
//       '&client_secret=' +
//       CLIENT_SECRET +
//       '&username=' +
//       USERNAME +
//       '&password=' +
//       loginPassword;
//     System.debug('withoutNamedCredential:urlParams:: ' + urlParams);
//     req.setEndpoint(AUTH_ENDPOINT + urlParams);

//     // Send the request
//     Http http = new Http();
//     HttpResponse res = http.send(req);

//     while (res.getStatusCode() == 302) {
//       System.debug(
//         'redirecting to :' + res.getHeader('Location') + ' ' + res.getBody()
//       );
//       req.setEndpoint(res.getHeader('Location'));
//       res = http.send(req);
//     }

//     // Parse and retrieve the access token
//     if (res.getStatusCode() == 200) {
//       Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(
//         res.getBody()
//       );
//       String accessToken = (String) responseMap.get('access_token');
//       // Now you can use this accessToken to make requests to Salesforce APIs
//       System.debug('Access Token: ' + accessToken);
//     } else {
//       System.debug(
//         'Failed to retrieve access token. Status code: ' +
//           res.getStatusCode() +
//           ', Response: ' +
//           res.getBody()
//       );
//     }
//   }

  public class deserializeResponse {
    public String id;
    public String access_token;
  }

  public static String ReturnAccessToken() {
    String reqbody =
      '{"grant_type":"password","client_id": "' +
      CLIENT_ID +
      '","client_secret": "' +
      CLIENT_SECRET +
      '", "username": "' +
      USERNAME +
      '","password": "' +
      PASSWORD +
      SECURITY_TOKEN +
      '"}';
    System.debug('reqBody: ' + reqbody);

    Http h = new Http();
    HttpRequest req = new HttpRequest();
    req.setBody(reqbody);
    req.setMethod('POST');
    // req.setEndpoint('https://ap4.salesforce.com/services/oauth2/token');
    req.setEndpoint(
      'https://curious-impala-exehed-dev-ed.trailblaze.my.salesforce.com/services/oauth2/token'
    );
    HttpResponse res = h.send(req);
    System.debug('response from token url:' + res.getBody());
    deserializeResponse resp1 = (deserializeResponse) JSON.deserialize(
      res.getBody(),
      deserializeResponse.class
    );
    System.debug('deserialized response: ' + resp1);
    return resp1.access_token;
  }

  // 00Q5j00000XtDvQEAV
  public static void withNamedCredential() {
    HttpRequest req = new HttpRequest();
    req.setEndpoint(
      'callout:firstConnectedAppOnExposer/services/apexrest/LeadManager/00Q5j00000XtDvQEAV'
    );
    // Other code to set method, headers, body, etc.
    req.setMethod('GET');

    Http h = new Http();
    HttpResponse response = h.send(req);
    System.debug(
      'response Status: ' +
        response.getStatusCode() +
        ' response body: ' +
        response.getBody()
    );

    while (response.getStatusCode() == 302) {
      System.debug('redirecting to: ' + response.getHeader('Location'));
      req.setEndpoint(response.getHeader('Location'));
      response = h.send(req);
      System.debug(
        'response Status: ' +
          response.getStatusCode() +
          ' response body: ' +
          response.getBody()
      );
    }
  }
}
