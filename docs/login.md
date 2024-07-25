# Exploring turbo login

For the artifact upload / download flows Vercel has shared an - incomplete and sometimes incorrect - [OpenAPI specification](https://turbo.build/repo/docs/core-concepts/remote-caching#self-hosting) we are not so lucky for the login flow.

This document shows the status of my exploration of these APIs. I am planning to implement this flow, but even if I don't, I hope this document will be useful.

Turborepo is open-source so you could go through the [source code](https://github.com/vercel/turbo) and find the answers to all the questions there, but I am not very proficient in Rust and I also didn't yet have the time to go through that repo.

The following were mostly learned by just proxying and intercepting requests from `turbo login`.

## Login flow

```sh
turbo login --api http://localhost:3000 --login http://localhost:3000
```

The `--api` parameter sets the base url for the API (`/user`, `/user/tokens/current` and `/artifacts/*`) calls. The `--login` parameter sets the base url for the browser login page (`/turborepo/token?redirect_uri=http://127.0.0.1:9789`)

The flow is as follows:

1. `turbo login`
2. Opens browser window to `$LOGIN_URL/turborepo/token?redirect_uri=http://127.0.0.1:9789`
3. Authentication happens in the browser
4. The browser opens `$REDIRECT_URI?name=$TOKEN_NAME&token=$TOKEN` (where turbo is listening)
5. Turbo opens `$LOGIN_URL/turborepo/success` (regardless if failure happens in later steps)
6. Turbo queries the user from `$API_URL/v2/user` (I'm unsure if it saves it anywhere)
7. If the query was successful turbo sets the token in its global config file (`~/Library/Application\ Support/turborepo/config.json` on MacOS) otherwise it displays an error message in the terminal

The link flow is as follows (requires a prior login):

1. `turbo link`
2. Queries `$API_URL/v2/user`
3. If successful it queries `$API_URL/v2/teams?limit=100`
4. Displays the teams it found
5. Queries `$API_URL/v8/artifacts/status`
6. If successful then saves the teamId to `./.turbo/config.json`, note that it doesn't save api url that you linked the repo to. You need to set that manually if you don't want to use vercel.com even if you logged in and linked to a different api.

## Example API responses from vercel.com

### https://vercel.com/api/v2/user

```
HTTP/2 200 OK
Access-Control-Allow-Headers: Authorization, Accept, Content-Type
Access-Control-Allow-Methods: OPTIONS, GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Origin: *
Cache-Control: private, max-age=0
Content-Type: application/json; charset=utf-8
Date: Thu, 25 Jul 2024 17:57:39 GMT
Etag: "ETAG"
Server: Vercel
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Ratelimit-Limit: 500
X-Ratelimit-Remaining: 494
X-Ratelimit-Reset: 1721930304
X-Vercel-Id: [VERCEL_ID]
Content-Length: 2159
```

```json
{
  "user": {
    "id": "[REDACTED]",
    "email": "[REDACTED]",
    "name": "[REDACTED]",
    "username": "[REDACTED]",
    "avatar": "[REDACTED]",
    "defaultTeamId": "[REDACTED]",
    "version": "[REDACTED]",
    "createdAt": 0,
    "billing": {
      "plan": "[REDACTED]",
      "period": null,
      "trial": null,
      "cancelation": null,
      "addons": null,
      "email": null,
      "tax": null,
      "language": null,
      "address": null,
      "name": null,
      "currency": "[REDACTED]",
      "status": "[REDACTED]",
      "platform": "[REDACTED]",
      "invoiceItems": null,
      "subscriptions": null
    },
    "resourceConfig": { "concurrentBuilds": 1 },
    "softBlock": null,
    "stagingPrefix": "[REDACTED]",
    "importFlowGitProvider": "[REDACTED]",
    "importFlowGitNamespaceId": "[REDACTED]",
    "dismissedToasts": [
      {
        "name": "[REDACTED]",
        "dismissals": [{ "scopeId": "[REDACTED]", "createdAt": 0 }]
      },
      {
        "name": "[REDACTED]",
        "dismissals": [{ "scopeId": "[REDACTED]", "createdAt": 0 }]
      },
      {
        "name": "[REDACTED]",
        "dismissals": [{ "scopeId": "[REDACTED]", "createdAt": 0 }]
      },
      {
        "name": "[REDACTED]",
        "dismissals": [
          {
            "scopeId": "[REDACTED]",
            "createdAt": 0
          },
          {
            "scopeId": "[REDACTED]",
            "createdAt": 0
          },
          { "scopeId": "[REDACTED]", "createdAt": 0 }
        ]
      },
      {
        "name": "[REDACTED]",
        "dismissals": [{ "scopeId": "[REDACTED]", "createdAt": 0 }]
      },
      {
        "name": "[REDACTED]",
        "dismissals": [
          {
            "scopeId": "[REDACTED]",
            "createdAt": 0
          }
        ]
      },
      {
        "name": "[REDACTED]",
        "dismissals": [
          {
            "scopeId": "[REDACTED]",
            "createdAt": 0
          }
        ]
      }
    ],
    "activeDashboardViews": [
      { "scopeId": "[REDACTED]", "viewPreference": "[REDACTED]" },
      { "scopeId": "[REDACTED]", "viewPreference": "[REDACTED]" }
    ],
    "hasTrialAvailable": false,
    "remoteCaching": { "enabled": true },
    "dataCache": { "excessBillingEnabled": false },
    "featureBlocks": {},
    "northstarMigration": {
      "teamId": "[REDACTED]",
      "projects": 1,
      "stores": 0,
      "integrationClients": 0,
      "integrationConfigurations": 0,
      "startTime": 0,
      "endTime": 0
    }
  }
}
```

### https://vercel.com/api/v2/teams?limit=100

```
HTTP/2 200 OK
Access-Control-Allow-Headers: Authorization, Accept, Content-Type
Access-Control-Allow-Methods: OPTIONS, GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Origin: *
Cache-Control: private, max-age=0
Content-Type: application/json; charset=utf-8
Date: Thu, 25 Jul 2024 17:57:40 GMT
Etag: "ETAG"
Server: Vercel
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Ratelimit-Limit: 600
X-Ratelimit-Remaining: 595
X-Ratelimit-Reset: 1721930304
X-Vercel-Id: [VERCEL-ID]
Content-Length: 1350
```

```json
{
  "teams": [
    {
      "id": "[REDACTED]",
      "slug": "[REDACTED]",
      "name": "[REDACTED]",
      "avatar": null,
      "createdAt": 0,
      "created": "1970-01-01T00:00:00.000Z",
      "membership": {
        "role": "OWNER",
        "confirmed": true,
        "created": 0,
        "createdAt": 0,
        "teamId": "[REDACTED]",
        "updatedAt": 0
      },
      "enablePreviewFeedback": null,
      "enableProductionFeedback": null,
      "sensitiveEnvironmentVariablePolicy": "[REDACTED]",
      "isMigratingToSensitiveEnvVars": false,
      "creatorId": "[REDACTED]",
      "updatedAt": 0,
      "platformVersion": null,
      "billing": {
        "address": null,
        "cancelation": null,
        "email": "[REDACTED]",
        "language": null,
        "name": "[REDACTED]",
        "platform": "[REDACTED]",
        "period": null,
        "plan": "[REDACTED]",
        "tax": null,
        "currency": "[REDACTED]",
        "trial": null,
        "invoiceItems": null,
        "status": "[REDACTED]",
        "planIteration": "[REDACTED]",
        "billingVersion": 0
      },
      "description": null,
      "profiles": [],
      "stagingPrefix": "[REDACTED]",
      "resourceConfig": { "concurrentBuilds": 1 },
      "previewDeploymentSuffix": null,
      "softBlock": null,
      "remoteCaching": { "enabled": true },
      "enabledInvoiceItems": {},
      "featureBlocks": {},
      "spaces": { "enabled": false },
      "createdDirectToHobby": true,
      "northstarMigration": {
        "userId": "[REDACTED]",
        "startTime": 0,
        "endTime": 0
      }
    }
  ],
  "pagination": { "count": 1, "next": null, "prev": 0 }
}
```